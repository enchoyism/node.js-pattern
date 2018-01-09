'use strict';

const async = require('async');

const crypto = require('lib/crypto');
const logger = require('lib/logger');

module.exports = async (req, res, callback) => {
    // logger
    const identifier = crypto.identifier(req);
    req.app.set('logger', logger(identifier));

    // mysql request scope connection
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

    async.each([ req.query, req.body, req.params ], (params, iterateeCallback) => {
        xssEscapeJson(params);
        iterateeCallback();
    }, (error) => {
        return callback(error);
    });
};
