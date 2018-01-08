'use strict';

const serverConf = require('configs/server.js');

module.exports = class ApiIndex {
    async getIndex(req, res, callback) {
    	console.log(1);
    	const modelIndex = new ModelIndex(req, res);
    	console.log(3);
    	modelIndex.test(() => {
    		// do something
	        res.json({
	            'message': `welcome to the ${serverConf.name}`
	        });
    	});
    }
};
