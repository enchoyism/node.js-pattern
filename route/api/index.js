'use strict';

const ApiBase = require('route/api/base');
const ModelIndex = require('model/index');
const serverConf = require('config/server.js');

module.exports = class ApiIndex extends ApiBase {
    async getIndex(req, res) {
        const mysql = req.app.get('mysql');

        try {
            await mysql.beginTransaction(mysql.conn);

            const modelIndex = new ModelIndex(req, res);
            const hello = await modelIndex.hello();
            const welcome = await modelIndex.welcome();

            await mysql.commitTransaction(mysql.conn);

            res.json({ 'message': `${hello} ${welcome}` });
        } catch (e) {
            await mysql.rollbackTransaction(mysql.conn);
            throw e;
        }
    }
};
