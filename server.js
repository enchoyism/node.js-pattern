'use strict';

const redis = require('ioredis');
const mysql = require('mysql');
const genericPool = require('generic-pool');
const express = require('express');
const asyncify = require('express-asyncify');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const swaggerUI = require('swagger-ui-express');
const yamlJS = require('yamljs');

const serverConf = require('config/server');
const logger = require('lib/logger')('server');
const errorHandler = require('lib/errorHandler');

class Server {
	static bootstrap() {
		return new Server();
	}

	async destroy() {
		const redis = this.app.get('redis');
		const mysql = this.app.get('mysql');

		if (redis) {
			redis.quit();
			delete this.app.settings.redis;
			logger.info('database redis client destroyed');
		}

		if (mysql) {
			await mysql.connectionPool.drain();
			mysql.connectionPool.clear();
			delete this.app.settings.mysql;
			logger.info('database mysql connection pool destroyed');
		}
	}

	constructor() {
		this.app = asyncify(express());
		this._database();
		this._config();
		this._middleware();
		this._route();
        this._etc();
	}

	async _database() {
		// redis
		this.app.set('redis', new redis(serverConf.redis));
		logger.info('database redis client created.');

		// mysql
		const factory = {
            create: () => {
                return new Promise((resolve, reject) => {
                    const connection = mysql.createConnection(serverConf.mysql);

                    connection.connect((error) => {
                        if (error) {
                            return reject(error);
                        }

                        resolve(connection);
                    });

                    connection.on('error', (error) => {
                        throw error;
                    });
                });
            },
            destroy: (connection) => {
                return new Promise((resolve) => {
                    connection.destroy();
                    resolve();
                });
            }
        };

		const options = {
            min: 0, max: 10,
            acquireTimeoutMillis: 3000,
            idleTimeoutMillis : 30000
        };

        const pool = genericPool.createPool(factory, options);

        pool.on('factoryCreateError', (error) => {
            logger.error(`factory create error: ${error}`);
            throw error;
        }).on('factoryDestroyError', (error) => {
            logger.error(`factory destroy error: ${error}`);
            throw error;
        });

        const rollbackTransaction = (connection) => {
            return new Promise((resolve, reject) => {
                connection.rollback(() => {
                    pool.release(connection);
                    resolve();
                });
            });
        };

        const beginTransaction = (connection) => {
            return new Promise((resolve, reject) => {
                connection.beginTransaction((error) => {
                    if (error) {
                        return connection.rollback(() => {
                            pool.release(connection);
                            return reject(error);
                        });
                    }

                    resolve();
                });
            });
        };

        const commitTransaction = (connection) => {
            return new Promise((resolve, reject) => {
                connection.commit((error) => {
                    if (error) {
                        return connection.rollback(() => {
                            pool.release(connection);
                            return reject(error);
                        });
                    }

                    pool.release(connection);
                    resolve();
                })
            });
        };

        this.app.set('mysql', {
            pool: pool, conn: undefined,
            beginTransaction: beginTransaction,
            rollbackTransaction: rollbackTransaction,
            commitTransaction: commitTransaction
        });

        logger.info('database mysql connection pool created.');
	};

	_config() {
		this.app.get('/favicon.ico', (req, res) => {
            res.sendStatus(204);
        });

        // view engine setup
        this.app.set('views', path.join(serverConf.node_path, 'view'));
        this.app.set('view engine', 'ejs');

        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({
            extended: true, limit: '10mb'
        }));

        this.app.use(cookieParser());
    }

    _middleware() {
        // swagger
        this.app.use('/swagger', express.static(path.join(serverConf.node_path, 'public')));
        this.app.use('/swagger', express.static(path.join(serverConf.node_path, 'swagger')));
		this.app.use('/docs', swaggerUI.serve, swaggerUI.setup(yamlJS.load('./swagger/server.yaml'), false));

        // escape xss
        this.app.use(require('middleware/init'));
	}

	_route() {
		logger.info(`number of routing module: ${serverConf.route.length}`);

		const methods = [ 'get', 'post', 'put', 'delete' ];
		// const router = express.Router();

		for (const route of serverConf.route) {
			const ClassModule = require(`route/${route.module}`);
			const contClass = new ClassModule();

			for (const url of Object.keys(route)) {
				for (const method of methods) {
					if (!route[url][method]) {
						continue;
					}

					this.app[method](url, contClass[(route[url][method]).handler].bind(contClass));
				}
			}
		}

		// this.app.use(router);
	}

    _etc() {
        this.app.use(errorHandler.notFound);
        this.app.use(errorHandler.errorHandler);
    }
};

module.exports = Server;