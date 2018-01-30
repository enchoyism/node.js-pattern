'use strict';

const Joi = require('joi');

const ApiBase = require('route/api/base');
const ModelIndex = require('model/index');
const ServerError = require('lib/serverError');
const serverConf = require('config/server');

module.exports = class ApiIndex extends ApiBase {
    constructor(req, res) {
        super(req, res);
    }

    async getIndex(req, res) {
        // request param validation
        const {error} = Joi.validate({
            // data
        }, Joi.object().keys({
            // schema
        }));

        if (error) {
            throw new ServerError({
                code: serverConf.errorCodes.BAD_REQUEST,
                message: error.message
            });
        }

        try {
            const mysql = req.mysql;

            await mysql.beginTransaction();
            const modelIndex = new ModelIndex(req, res);
            const hello = await modelIndex.hello();
            const welcome = await modelIndex.welcome();
            await mysql.commitTransaction();

            res.json({
                'title': serverConf.name,
                'message': `${hello} ${welcome}`
            });
        } catch (error) {
            await mysql.rollbackTransaction();
            throw error;
        }
    }
};
