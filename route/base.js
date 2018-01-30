'use strict';

module.exports = class RouteBase {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.mysql = req.mysql;
        this.debug = req.debug;
        this.redis = req.app.get('redis');
    }
}
