'use strict';

const privateConf = require('config/private');

const serverConf = {
	name: 'nodejs-pattern',
	port: 3000,

	node_path: process.env.NODE_PATH,
	node_env: process.env.NODE_ENV || 'local',

	redis: {},
	mysql: {},
	mongo: {},

	route: []
};

serverConf.route.push(
	// api
	{
		module: 'api/index',
		'/api/index': {
			get: { handler: 'getIndex' }
		}
	},

	// controller
	// {
	// 	module: 'cont/index',
	// 	'/index': {
	// 		get: { handler: 'getIndex' }
	// 	}
	// }
);

serverConf.redis.host = privateConf.redis[serverConf.node_env].host;
serverConf.redis.port = privateConf.redis[serverConf.node_env].port;
serverConf.redis.password = privateConf.redis[serverConf.node_env].password;
serverConf.redis.db = privateConf.redis[serverConf.node_env].db;

serverConf.mysql.host = privateConf.mysql[serverConf.node_env].host;
serverConf.mysql.port = privateConf.mysql[serverConf.node_env].port;
serverConf.mysql.user = privateConf.mysql[serverConf.node_env].user;
serverConf.mysql.password = privateConf.mysql[serverConf.node_env].password;
serverConf.mysql.database = privateConf.mysql[serverConf.node_env].database;

// serverConf.mongo = privateConf.mongo;

module.exports = serverConf;
