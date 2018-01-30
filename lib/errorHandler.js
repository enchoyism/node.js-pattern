'use strict';

const path = require('path');
const status = require('statuses');
const moment = require('moment');
const prettyjson = require('prettyjson');

const alarm = require('lib/alarm');
const crypto = require('lib/crypto');
const serverConf = require('config/server');
const ServerError = require('lib/serverError');

module.exports.notFound = (req, res, callback) => {
    const error = new ServerError({
        code: serverConf.errorCodes.NOT_FOUND
    });
    callback(error, req, res, callback);
};

module.exports.methodNotAllowed = (req, res, callback) => {
    const error = new ServerError({
        code: serverConf.errorCodes.METHOD_NOT_ALLOWED
    });
    callback(error, req, res, callback);
};

module.exports.errorHandler = (error, req, res, callback) => {
    req.debug.error(error);

    error.code = error.code || 500;
    error.message = error.message || status[code];

    const resData = {
        meta: {
            code: error.code,
            message: status[error.code],
            indentifier: crypto.identifier(req)
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

    const identifier = crypto.identifier(req);
    const logdir = `${path.join(__dirname, '../log')}/${moment().format('YYYY/MM/DD')}`;
    const logfile = `${identifier}.log`;
    const logpath = (`${logdir}/${logfile}}`).replace(/\//g, path.sep);

    const logdata = {
        identifier: identifier,
        servername: process.env.HOSTNAME || '',
        log_path: logpath,
        meta: {
            code: error.code,
            message: status[error.code],
            indentifier: crypto.identifier(req)
        },
        request: {
            method: req.method, url: req.url, cookie: req.cookies,
            header: req.headers, param: req.params, query: req.query,
            body: req.body, http_version: req.httpVersion,
            remote_addr: req.headers['x-forwarded-for'] || req.connection.remoteAddress
        },
        response: {
            header: res.getHeaders()
        },
        error: {
            message: error.message
        }
    };

    req.app.set('logdata', logdata);

    const options = { noColor: true, indent: 2 };
    const message = `${prettyjson.render(logdata, options).substr(0, 1500)}...`;

    alarm.send(debug, message);
};
