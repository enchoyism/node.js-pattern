'use strict';

const status = require('statuses');

module.exports = class ServerError extends Error {
	constructor(code, errorMessage, errorDetails) {
		super();
		Error.captureStackTrace(this, this.constructor);
		this.name = 'ServerError';
		this.code = code || 500;
		this.message = status[this.code];
		this.errorMessage = errorMessage || this.message || null;
		this.errorDetails = errorDetails || null;
	}
}
