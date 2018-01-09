'use strict';

const debug = require('debug');

const serverConf = require('config/server');

debug.formatArgs = function(args) {
    args[0] = this.namespace + ' ' + args[0];
    return args;
};

module.exports = (alias) => {
    const logger = {
        error: debug(`[${serverConf.name}][${process.pid}] ${alias} [ERROR]`),
        debug: debug(`[${serverConf.name}][${process.pid}] ${alias} [DEBUG]`),
        info: debug(`[${serverConf.name}][${process.pid}] ${alias} [INFO]`)
    };

    logger.debug.log = console.log.bind(console);
    logger.info.log = console.log.bind(console);

    return logger;
};
