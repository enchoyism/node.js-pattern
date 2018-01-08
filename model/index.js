'use strict';

const pify = require('pify');

const logger = require('lib/logger');
const crypto = require('lib/crypto');
const ModelBase = require('model/base');

module.exports = class ModelIndex {
	constructor(req, res) {
		this.req = req;
		this.res = res;
		// this.mysql = this.req.app.get('mysql');
		// this.test = pify(async (mysql, callback) => {
		// 	console.log('1');
		// 	if (!mysql.connection) {
		// 		mysql.connection = await mysql.connectionPool.acquire();
		// 		callback(null, connection);
		// 	}

		// 	callback(null, mysql.connection);
		// });

		this.getConnection(req, res);

		// super(req, res);
	}

	async getConnection(req, res) {
		const connPool = this.req.app.get('mysql').connectionPool;
		this.connection = await connPool.acquire();

		// console.log(req.app.get('mysql'));

		// return null;
	}

	async test(callback) {
		// const connection = this.req.app.get('mysql');
		// console.log(this.req.mConn);
		// this.req.mConn.query('select * from MEMBER', (error, result) => {
		// 	// const connPool = this.req.app.get('mysql').connectionPool;
		// 	// connPool.release(connection);
		// 	console.log(result);
		// 	callback();
		// });


		// this.logger.info('test');
		// const connPool = this.req.app.get('mysql').connectionPool;
		// const connection = await connPool.acquire();
			this.connection.query('select * from MEMBER', (error, result) => {
				connPool.release(connection);
				console.log(result);
				callback();
			});



		// callback();
	}
};
