'use strict';

const request = require('request');
const should = require('should');

const bootstrap = require('test/bootstrap');
const url = `${bootstrap[process.env.NODE_ENV].host}/api/index`;

describe('api/index', () => {
	context('GET: /index', () => {
		it('hello welcome message', (done) => {
			const options = { url: url, qs: {}, json: true };

			request.get(options, (error, response, body) => {
				if (error) {
					throw error;
				}

				should.strictEqual(response.statusCode, 200, 'response status code is not 200');
				should.strictEqual(body.message, 'very hello! very welcome!', 'property \'message\' of body is not expected');

				done();
			});
		});
	});
});
