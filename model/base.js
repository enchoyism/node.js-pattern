'use strict';

const crypto = require('lib/crypto');

module.exports = class ModelBase {
	constructor(req, res) {
		this.req = req;
		this.res = res;
		this.debug = req.app.get('debug');
		this.redis = req.app.get('redis');
		this.mysql = req.app.get('mysql');
	}
};
