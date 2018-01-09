'use strict';

module.exports.notFound = (req, res, callback) => {
    const error = new Error('Not Found');
    callback(error, req, res, callback);
};

module.exports.errorHandler = (error, req, res, callback) => {
    const logger = req.app.get('logger');

    logger.error(error);

    if (req.url.startsWith('/api')) {
        res.json({ error_message: error.message });
    } else {
        res.render('error', {
            message: error.message,
            error: error
        });
    }
};
