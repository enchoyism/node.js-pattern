'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug');
const async = require('async');
const mkdirp = require('mkdirp');

const serverConf = require('config/server');

debug.formatArgs = function(args) {
    args[0] = this.namespace + ' ' + args[0];
    return args;
};

module.exports.debug = (alias) => {
    const logger = {
        error: debug(`[${serverConf.name}][${process.pid}] ${alias} [ERROR]`),
        debug: debug(`[${serverConf.name}][${process.pid}] ${alias} [DEBUG]`),
        info: debug(`[${serverConf.name}][${process.pid}] ${alias} [INFO]`)
    };

    logger.debug.log = console.log.bind(console);
    logger.info.log = console.log.bind(console);

    return logger;
};

module.exports.save = (debug, dir, filename, data) => {
    async.series([
        (callback) => {
            mkdirp(dir, (error) => {
                callback(error);
            });
        },
        (callback) => {
            fs.writeFile(`${dir}${path.sep}${filename}`, data, (error) => {
                callback(error);
            });
        }
    ], (error) => {
        if (error) {
            return debug.error(`log save error: ${error}`);
        }

        debug.debug('log save success');
    });
};
