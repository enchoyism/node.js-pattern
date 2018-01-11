'use strict';

const status = require('statuses');
const prettyjson = require('prettyjson');

const alarm = require('lib/alarm');
const crypto = require('lib/crypto');
const serverConf = require('config/server');
const ServerError = require('lib/serverError');

module.exports.notFound = (req, res, callback) => {
    const error = new ServerError(status[serverConf.errorCodes.NOT_FOUND]);
    callback(error, req, res, callback);
};

module.exports.errorHandler = (error, req, res, callback) => {
    const debug = req.app.get('debug');

    debug.error(error);

    error.code = error.code || 500;
    error.message = error.message || status[code];

    const resData = {
        meta: {
            code: error.code,
            message: status[error.code],
            identifier: crypto.identifier(req)
        },
        error: {
            message: error.message
        }
    };

    res.status(error.code);

    if (req.url.startsWith('/api')) {
        res.json(resData);
    } else {
        resData.error.stack = error.stack;
        res.render('error', resData);
    }

    resData.error.stack = error.stack;

    const data = resData;
    const options = { noColor: true, indent: 2 };
    const message = `${prettyjson.render(data, options).substr(0, 600)}...`;
    alarm.send(debug, message);
};
