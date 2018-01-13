'use strict';

const http = require('http');
const prettyjson = require('prettyjson');

const debug = require('lib/logger').debug('test/bootstrap');
const serverConf = require('config/server');
const Server = require('server');

const normalizePort = (val) => {
    const port = parseInt(val, 10);

    if (isNaN(port)) { return val; }
    if (port >= 0) { return port; }

    return false;
};

const port = normalizePort(serverConf.port || '3000');

const onError = (error) => {
    if (error.syscall !== 'listen') { throw error; }

    const bind = typeof port === 'string' ? 'Pipe ' + httpPort : `Port ${port}`;

    switch (error.code) {
        case 'EACCES':
            debug.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            debug.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const server = Server.bootstrap();
const app = server.app;
app.set('port', port);

const httpServer = http.createServer(app);

const close = () => {
    debug.info('closing server');

    setTimeout(async () => {
        server.destroy();
        httpServer.close(() => {
        	debug.info('closed http server');
        });
    }, 500);
};

process.on('uncaughtException', (error) => {
    debug.error(`process uncaughtException: ${error.stack}`);

    close();

    const data = { uncaughtException: { error: error.stack } };
    const options = { noColor: true, indent: 2 };
    const message = `${prettyjson.render(data, options).substr(0, 600)}...`;

    alarm.send(debug, message);

    setTimeout(() => {
        debug.info('shutdown server, process exit');
        process.exit(1);
    }, 500);
});

process.on('SIGTERM' || 'SIGINT', () => {
    debug.info('process event SIGTERM OR SIGINT');

    close();
    setTimeout(() => {
        debug.info('shutdown server, process exit');
        process.exit(0);
    }, 500);
});

before((done) => {
	httpServer.listen(port);
	httpServer.on('error', onError);
	httpServer.on('listening', () => {
		const addr = httpServer.address();
	    const bind = typeof addr === 'string'
	        ? 'pipe ' + addr
	        : 'port ' + addr.port;
	    debug.info(`Listening on ${bind}`);

	    done();
	});
});

after((done) => {
	debug.info('closing server');

    setTimeout(() => {
        server.destroy();
        httpServer.close(() => {
        	debug.info('closed http server');
        	done();
        });

    }, 500);
});

process.env.NODE_ENV = process.env.NODE_ENV || 'local';

const config = { local: { host: 'http://127.0.0.1:3000' } };
module.exports = config;
