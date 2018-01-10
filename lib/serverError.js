'use strict';

const status = require('statuses');

module.exports = class ServerError extends Error {
	constructor(error = {}) {
		super();
		Error.captureStackTrace(this, this.constructor);
		this.name = 'ServerError';
		this.code = error.code || 500;
		this.message = error.message || status[this.code] || null;
	}
};
