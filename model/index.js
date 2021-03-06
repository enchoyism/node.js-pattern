'use strict';

const crypto = require('lib/crypto');
const ModelBase = require('model/base');

module.exports = class ModelIndex extends ModelBase {
	constructor(req, res) {
		super(req, res);
	}

	yell(string) {
		return new Promise((resolve, reject) => {
			string = this.mysql.conn.escape(string);

			const sql = `select ${string}`;

			this.mysql.conn.query(sql, (error, result) => {
				if (error) {
					return reject(error);
				}

				resolve(result[0][string.replace(/\'/gi, '')]);
			});
		});
	}

	hello() {
		return this.yell('very hello!');
	}

	welcome() {
		return this.yell('very welcome!');
	}
};
