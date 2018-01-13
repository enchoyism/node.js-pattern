'use strict';

const path = require('path');
const async = require('async');
const moment = require('moment');
const prettyjson = require('prettyjson');

const crypto = require('lib/crypto');
const logger = require('lib/logger');

module.exports = async (req, res, callback) => {
    // logger
    const identifier = crypto.identifier(req);
    const debug = logger.debug(identifier);
    req.app.set('debug', debug);

    // get connection
    const mysql = req.app.get('mysql');
    mysql.conn = await mysql.pool.acquire();

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
        // release connection
        if (mysql.conn) {
            debug.debug('mysql connection pool release connection.');
            mysql.pool.release(mysql.conn);
            delete req.app.settings.mysql.conn;
        }

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

        logger.save(debug, logdir, logfile, logdata);
    });

    callback();
};
