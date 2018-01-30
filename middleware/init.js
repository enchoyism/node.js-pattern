'use strict';

const path = require('path');
const async = require('async');
const moment = require('moment');
const prettyjson = require('prettyjson');

const crypto = require('lib/crypto');
const logger = require('lib/logger');

class WrapMysql {
    constuctor() {}
    initailize(req, res) {
        this.pool = req.app.get('pool');

        return new Promise(async (resolve, reject) => {
            try {
                const conn = await this.pool.acquire();
                this.conn = conn;

                resolve(conn);
            } catch (error) {
                reject(error);
            }
        });
    }
    release() {
        if (!this.conn) return;
        this.pool.release(this.conn);
        this.conn = undefined;
    }
    beginTransaction() {
        return new Promise(async (resolve, reject) => {
            this.conn.beginTransaction((error) => {
                if (error) {
                    return this.conn.rollback(() => {
                        reject(error);
                    });
                }

                resolve();
            });
        });
    }
    commitTransaction() {
        return new Promise((resolve, reject) => {
            this.conn.commit((error) => {
                if (error) {
                    return this.conn.rollback(() => {
                        reject(error);
                    });
                }

                resolve();
            })
        });
    }
    rollbackTransaction() {
        return new Promise(async (resolve, reject) => {
            this.conn.rollback(() => {
                resolve();
            });
        });
    }
};

module.exports = async (req, res, callback) => {
    // logger
    const identifier = crypto.identifier(req);
    req.debug = logger.debug(identifier);

    // initailize mysql -> request context
    const wrapMysql = new WrapMysql();
    await wrapMysql.initailize(req, res);
    req.mysql = wrapMysql;

    // escape xss
    const xssFilter = (str) => {
        return str.replace(/</gi, '&lt;')
            .replace(/>/gi, '&gt;')
            .replace(/"/gi, '&quot;')
            .replace(/'/gi, '&#39;')
            .replace(/`/gi, '&#96;');
    };

    const xssEscapeJson = (json) => {
        for (const key of Object.keys(json)) {
            if (json[key] instanceof Object) {
                xssEscapeJson(json[key]);
            } else if (json[key] instanceof Array) {
                json[key].forEach((value) => {
                    value = xssFilter(value);
                });
            } else {
                if (typeof json[key] === 'string') {
                    json[key] = xssFilter(json[key]);
                }
            }
        }
    };

    for (const reqParam of [ req.query, req.body, req.params ]) {
        xssEscapeJson(reqParam);
    }

    res.on('finish', () => {
        // release auto connection
        req.debug.debug('mysql connection pool release connection automatically.');
        wrapMysql.release();

        // log save
        const logdir = `${path.join(__dirname, '../log')}/${moment().format('YYYY/MM/DD')}`;
        const logfile = `${identifier}.log`;
        const logpath = (`${logdir}/${logfile}}`).replace(/\//g, path.sep);
        let logdata = {
            request: {
                method: req.method,
                url: req.url,
                cookie: req.cookies,
                header: req.headers,
                param: req.params,
                query: req.query,
                body: req.body,
                http_version: req.httpVersion,
                remote_addr: req.headers['x-forwarded-for'] || req.connection.remoteAddress
            },
            identifier: identifier,
            servername: process.env.HOSTNAME || '',
            log_path: logpath
        };

        const options = { noColor: true, indent: 2 };
        logdata = prettyjson.render(logdata, options);

        logger.save(req.debug, logdir, logfile, logdata);
    });

    callback();
};
