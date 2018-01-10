'use strict';

const status = require('statuses');

const alert = require('lib/alert');
const serverConf = require('config/server');
const ServerError = require('lib/server_error');

module.exports.notFound = (req, res, callback) => {
    const error = new ServerError(status[serverConf.errorCodes.NOT_FOUND]);
    callback(error, req, res, callback);
};

module.exports.errorHandler = (error, req, res, callback) => {
    const logger = req.app.get('logger');

    logger.error(error);

    error.code = error.code || 500;
    error.message = error.message || status[code];

    const resData = {
        status: { code: error.code, message: status[error.code] },
        error: { message: error.message }
    };

    res.status(error.code);

    if (req.url.startsWith('/api')) {
        res.json(resData);
    } else {
        resData.error.stack = error.stack;
        res.render('error', resData);
    }
};
