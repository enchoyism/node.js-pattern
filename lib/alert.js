'use strict';

const request = require('request');
const serverConf = require('config/server');

module.exports.alert = (logger, message) => {
	const reqOptions = {
		url: `https://api.telegram.org/bot${serverConf.telegram.token}/sendmessage`,
		form: {
			text: message,
			chat_id: serverConf.telegram.chat_id
		}
	};

	request.post({
		url: `https://api.telegram.org/bot${serverConf.telegram.token}/sendmessage`,
		form: { text: message, chat_id: serverConf.telegram.chat_id }
	}, (error, response, body) => {
		if (error) {
			return logger.error('send telegram message fail');
		}

		logger.debug('send telegram message success');
	});
};
