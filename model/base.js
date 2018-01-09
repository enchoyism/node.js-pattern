'use strict';

const logger = require('lib/logger');
const crypto = require('lib/crypto');

module.exports = class ModelBase {
	constructor(req, res) {
		this.req = req;
		this.res = res;
		this.logger = req.app.get('logger');
		this.redis = req.app.get('redis');
		this.mysql = req.app.get('mysql');
		this.mongo = req.app.get('mongo');
	}
}
