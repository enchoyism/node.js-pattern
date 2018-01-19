'use strict';

const crypto = require('lib/crypto');

module.exports = class ModelBase {
	constructor(req, res) {
		this.req = req;
		this.res = res;
		this.mysql = req.mysql;
		this.redis = req.app.get('redis');
		this.debug = req.app.get('debug');
	}
};
