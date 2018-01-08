'use strict';

const redis = require('ioredis');
const mysql = require('mysql');
const genericPool = require('generic-pool');
const mongoose = require('mongoose');
const express = require('express');
const asyncify = require('express-asyncify');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const swaggerUI = require('swagger-ui-express');
const yamlJS = require('yamljs');

const serverConf = require('configs/server');
const logger = require('lib/logger')('server');

class Server {
	static bootstrap() {
		return new Server();
	}

	async destroy() {
		const redis = this.app.get('redis');
		const mongo = this.app.get('mongo');
		const mysql = this.app.get('mysql');

		if (redis) {
			redis.quit();
			delete this.app.settings.redis;
			logger.info('database redis client destroyed');
		}

		if (mongo) {
			mongo.close();
			delete this.app.setting.mongo;
			logger.info('database mongo client destroyed');
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
		this._databases();
		this._configs();
		this._middlewares();
		this._routes();
	}

	async _databases() {
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

        const connectionPool = genericPool.createPool(factory, options);

        connectionPool.on('factoryCreateError', (error) => {
            logger.error(`factory create error: ${error}`);
            throw error;
        }).on('factoryDestroyError', (error) => {
            logger.error(`factory destroy error: ${error}`);
            throw error;
        });

        this.app.set('mysql', { connectionPool: connectionPool });

		// this.app.set('mysql', mysql.createPool(serverConf.mysql));
		logger.info('database mysql connection pool created.');

		// mongo
		mongoose.connect(serverConf.mongo.uri, serverConf.mongo.options);

		const mongo = mongoose.connection;

		mongo.on('error', (error) => {
			logger.error('mongo connection error');
		});
		mongo.on('open', () => {
			this.app.set('mongo', mongo);
		});

		logger.info('database mongo client created.');
	};

	_configs() {
		this.app.get('/favicon.ico', (req, res) => {
            res.sendStatus(204);
        });

        // view engine setup
        this.app.set('views', path.join(serverConf.node_path, 'views'));
        this.app.set('view engine', 'ejs');

        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({
            extended: true, limit: '10mb'
        }));

        this.app.use(cookieParser());
        this.app.use('/swagger', express.static(path.join(serverConf.node_path, 'public')));
        this.app.use('/swagger', express.static(path.join(serverConf.node_path, 'swagger')));
	}

	_middlewares() {
		this.app.use('/docs', swaggerUI.serve, swaggerUI.setup(yamlJS.load('./swagger/server.yaml'), false));
	}

	_routes() {
		logger.info(`number of routing module: ${serverConf.routes.length}`);

		const methods = [ 'get', 'post', 'put', 'delete' ];
		const router = express.Router();

		for (const route of serverConf.routes) {
			const ClassModule = require(`routes/${route.module}`);
			const contClass = new ClassModule();

			for (const url of Object.keys(route)) {
				for (const method of methods) {
					if (!route[url][method]) {
						continue;
					}

					router[method](url, contClass[(route[url][method]).handler].bind(contClass));
				}
			}
		}

		this.app.use(router);
	}
};

module.exports = Server;
