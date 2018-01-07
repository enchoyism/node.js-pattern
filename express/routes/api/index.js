'use strict';

module.exports = class ApiIndex {
    getIndex(req, res, callback) {
    	// do something
        res.json({
            'message': 'welcome to the datahub admin'
        });
    }
};
