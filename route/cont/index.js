'use strict';

const ContBase = require('route/cont/base');
const ModelIndex = require('model/index');
const ServerError = require('lib/server_error');
const serverConf = require('config/server.js');

module.exports = class ContIndex {
    async getIndex(req, res) {
        const mysql = req.app.get('mysql');

        try {
            await mysql.beginTransaction(mysql.conn);

            const modelIndex = new ModelIndex(req, res);
            const hello = await modelIndex.hello();
            const welcome = await modelIndex.welcome();

            await mysql.commitTransaction(mysql.conn);
            throw new ServerError(404);
            res.json({
                'title': serverConf.name,
                'message': `${hello} ${welcome}`
            });
        } catch (e) {
            await mysql.rollbackTransaction(mysql.conn);
            throw e;
        }
    }
};
