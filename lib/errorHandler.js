'use strict';

const status = require('statuses');

const alert = require('lib/alert');
const errorStatus = require('config/error_status');
const ServerError = require('lib/server_error');

module.exports.notFound = (req, res, callback) => {
    const error = new ServerError(status[errorStatus.NOT_FOUND]);
    callback(error, req, res, callback);
};

module.exports.errorHandler = (error, req, res, callback) => {
    const logger = req.app.get('logger');

    logger.error(error);

    res.status(error.code);

    if (req.url.startsWith('/api')) {
        res.json({
            status: { code: error.code, message: error.message },
            error: { message: error.errorMessage, details: error.errorDetails }
        });
    } else {
        res.render('error', {
            code: error.code,
            message: error.errorMessage,
            details: error.errorDetails,
            stack: error.stack
        });
    }


};
