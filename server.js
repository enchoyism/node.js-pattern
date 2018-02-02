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
const debug = require('lib/logger').debug('server');
const errorHandler = require('lib/errorHandler');

class Server {
    static bootstrap() {
        return new Server();
    }

    async destroy() {
        const redis = this.app.get('redis');
        const pool = this.app.get('pool');

        if (redis) {
            redis.quit();
            delete this.app.settings.redis;
            debug.info('database redis client destroyed');
        }

        if (pool) {
            await pool.drain();
            pool.clear();
            delete this.app.settings.pool;
            debug.info('database mysql connection pool destroyed');
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
        debug.info('database redis client created');

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

                    connection.on('error', async (error) => {
                        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
                            debug.info('database mysql connection lost');

                            const pool = this.app.get('pool');

                            if (pool) {
                                await pool.drain();
                                pool.clear();
                                delete this.app.settings.pool;
                                debug.info('database mysql origin connection pool destroyed');
                            }

                            this.app.set('pool', initPool());
                            debug.info('database mysql connection pool re created');
                        } else {
                            throw error;
                        }
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

        const initPool = () => {
            const pool = genericPool.createPool(factory, {
                min: 0, max: 10,
                acquireTimeoutMillis: 3000,
                idleTimeoutMillis : 30000
            });

            pool.on('factoryCreateError', (error) => {
                debug.error(`factory create error: ${error}`);
            }).on('factoryDestroyError', (error) => {
                debug.error(`factory destroy error: ${error}`);
            });

            return pool;
        };

        this.app.set('pool', initPool());
        debug.info('database mysql connection pool created');
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
        this.app.use('/public', express.static(path.join(serverConf.node_path, 'public')));
        this.app.use('/swagger', express.static(path.join(serverConf.node_path, 'swagger')));
        this.app.use('/docs', swaggerUI.serve, swaggerUI.setup(yamlJS.load('./swagger/server.yaml'), false));

        // escape xss
        this.app.use(require('middleware/init'));
    }

    _route() {
        debug.info(`number of routing module: ${serverConf.route.length}`);

        for (const route of serverConf.route) {
            const ClassModule = require(`route/${route.module}`);

            for (const url of Object.keys(route)) {

                const methods = [ 'get', 'post', 'put', 'delete' ];

                for (const method of methods) {
                    if (!route[url][method]) {
                        continue;
                    }

                    this.app[method](url, async (req, res, callback) => {
                        try {
                            await new ClassModule(req, res)[(route[url][method]).handler](req, res, callback);
                        } catch (error) {
                            throw error;
                        }
                    });

                    methods.splice(methods.indexOf(method), 1);
                }

                for (const method of methods) {
                    this.app[method](url, (req, res, callback) => {
                        errorHandler.methodNotAllowed(req, res, callback);
                    });
                }
            }
        }
    }

    _etc() {
        this.app.use(errorHandler.notFound);
        this.app.use(errorHandler.errorHandler);
    }
};

module.exports = Server;
