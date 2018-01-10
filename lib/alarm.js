'use strict';

const request = require('request');
const serverConf = require('config/server');

module.exports.send = (logger, message) => {
	telegram(logger, message);
};

const telegram = (logger, message) => {
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
	}, (error) => {
		if (error) {
			return logger.error(`send telegram message fail: ${error.message}`);
		}

		logger.debug('send telegram message success');
	});
};
