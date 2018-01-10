'use strict';

const Joi = require('joi');

const ApiBase = require('route/api/base');
const ModelIndex = require('model/index');
const ServerError = require('lib/server_error');
const serverConf = require('config/server');

module.exports = class ApiIndex extends ApiBase {
    async getIndex(req, res) {
        // request param validation
        const {error} = Joi.validate({
            // data
        }, Joi.object().keys{
            // schema
        });

        if (error) {
            throw new ServerError({
                code: serverConf.codes.BAD_REQUEST,
                message: error.message
            });
        }

        // mysql
        const mysql = req.app.get('mysql');

        try {
            await mysql.beginTransaction(mysql.conn);

            const modelIndex = new ModelIndex(req, res);
            const hello = await modelIndex.hello();
            const welcome = await modelIndex.welcome();

            await mysql.commitTransaction(mysql.conn);

            res.json({ 'message': `${hello} ${welcome}` });
        } catch (error) {
            await mysql.rollbackTransaction(mysql.conn);
            throw error;
        }
    }
};
