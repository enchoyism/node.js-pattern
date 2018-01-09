'use strict';

const ApiBase = require('route/api/base');
const ModelIndex = require('model/index');
const ServerError = require('lib/server_error');

module.exports = class ApiIndex extends ApiBase {
    async getIndex(req, res) {
        const mysql = req.app.get('mysql');

        try {
            await mysql.beginTransaction(mysql.conn);

            const modelIndex = new ModelIndex(req, res);
            const hello = await modelIndex.hello();
            const welcome = await modelIndex.welcome();
            throw new ServerError(404);
            await mysql.commitTransaction(mysql.conn);
            console.log(mysql.conn);
            res.json({ 'message': `${hello} ${welcome}` });
        } catch (e) {
            await mysql.rollbackTransaction(mysql.conn);
            throw e;
        }
    }
};
