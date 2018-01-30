'use strict';

const crypto = require('lib/crypto');

module.exports = class ModelBase {
	constructor(req, res) {
		this.req = req;
		this.res = res;
		this.mysql = req.mysql;
		this.debug = req.debug;
        this.redis = req.app.get('redis');
	}
};
