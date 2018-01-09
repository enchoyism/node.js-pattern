'use strict';

const serverConf = require('config/server.js');

module.exports = class ContIndex {
    getIndex(req, res, callback) {
        res.render('index', {
        	'title': serverConf.name,
            'message': `welcome to the ${serverConf.name}`
        });
    }
};
