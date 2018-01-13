'use strict';

const request = require('request');
const should = require('should');

const bootstrap = require('test/bootstrap');
const url = `${bootstrap[process.env.NODE_ENV].host}/index`;

describe('cont/index', () => {
	context('GET: /index', () => {
		it('hello welcome message', (done) => {
			const options = { url: url, qs: {} };

			request.get(options, (error, response, body) => {
				if (error) {
					throw error;
				}

				should.strictEqual(response.statusCode, 200, 'response status code is not 200');
				done();
			});
		});
	});
});
