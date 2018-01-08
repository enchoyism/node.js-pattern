'use strict';

const crypto = require('crypto');
const parseurl = require('parseurl');
const microtime = require('microtime-nodejs');

module.exports.identifier = (req) => {
	if (req.identifier) {
		return req.identifier;
	}

    req.traceSeq = req.traceSeq || 0;

    const info = parseurl.original(req);
    const now = microtime.nowDouble().toFixed(4);
    const plaintext = `${req.traceSeq}${info.hostname}${process.pid}${now}`;

    const hash = crypto.createHash('md5');
    hash.update(plaintext, 'utf8');

    const cipherText = hash.digest('hex');

    req.traceSeq++;
    req.identifier = cipherText;

    return cipherText;
};
