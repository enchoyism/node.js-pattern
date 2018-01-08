'use strict';

const pify = require('pify');

const logger = require('lib/logger');
const crypto = require('lib/crypto');

module.exports = class ModelBase {
	constructor(req, res) {
		this.req = req;
		this.res = res;
		this.logger = logger(crypto.identifier(req));
		this.connection = this.getConnection(req, res);
		// this.getConnection = pify(async (callback) => {
		// 	const mysql = this._req.app.get('mysql');

		// 	if (!mysql.connection && !mysql.connection.acquire) {
		// 		const connPool = this._req.app.get('mysql').connectionPool;
		// 		mysql.connection = await connPool.acquire();

		// 		this.logger.debug('database mysql client connection created');
		// 	}
		// });
	}

	async getConnection(req, res) {
		const mysql = req.app.get('mysql');

		console.log(mysql.connection);
		if (!mysql.connection) {
			const connPool = req.app.get('mysql').connectionPool;
			const connection = await connPool.acquire();

			this.logger.debug('database mysql client connection created');

			return connection;
		}

		return null;
	}
}
