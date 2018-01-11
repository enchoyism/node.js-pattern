'use strict';

const request = require('request');
const serverConf = require('config/server');

module.exports.send = (debug, message) => {
	telegram(debug, message);
};

const telegram = (debug, message) => {
	request.post({
		url: `https://api.telegram.org/bot${serverConf.telegram.token}/sendmessage`,
		form: { text: message, chat_id: serverConf.telegram.chat_id }
	}, (error) => {
		if (error) {
			return debug.error(`send telegram message fail: ${error.message}`);
		}

		debug.debug('send telegram message success');
	});
};
