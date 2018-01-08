'use strict';

const serverConf = require('configs/server.js');

module.exports = class ContIndex {
    getIndex(req, res, callback) {
        res.render('index', {
        	'title': serverConf.name,
            'message': `welcome to the ${serverConf.name}`
        });
    }
};
