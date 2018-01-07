os env: mac, linux

# Clone & Add DB access config
### Clone
``` bash
$ git clone https://github.com/enchoyism/nodejs-pattern.git
$ cd express
$ npm install -d
```

### DB access config
**New file(./configs/private.js)**
Edit {...} to your config
``` javascript
'use strict';

module.exports = {
    redis: {
        local: {
            host: '127.0.0.1',
            port: 6379,
            password: '{YOUR_REDIS_PASSWORD}',
            db: 0
        }
    },
    mysql: {
        local: {
            host: '127.0.0.1',
            port: 3306,
            user: '{YOUR_MYSQL_USER}',
            password: '{YOUR_MYSQL_PASSWORD}',
            database: '{YOUR_MYSQL_DATABASE}'
        }
    },
    mongo: {
        local: 'mongodb://127.0.0.1:27017/{YOUR_MONGO_DATABASE}'
    }
};
```

# Quick start
``` bash
$ npm start
```

# Start with pm2
``` bash
$ npm install pm2 -g
```

**edit** {YOUR_NODE_PATH} to absolute path (ex. /home/...) of ./server.yaml
Edit {...} to your config
``` YML
apps:
  - name: nodejs-pattern
    script: {YOUR_NODE_PATH}/bin/www
    cmd: {YOUR_NODE_PATH}
    interpreter: node
    interpreterArgs: --max-old-space-size=2048 --stack_size=8192
    instances: 0
    exec_mode: cluster
    max_memory_restart: 1G
    log_date_format: YYYY-MM-DD HH:mm:ss Z
    error_file: {YOUR_NODE_PATH}/logs/nodejs-pattern.err.log
    out_file: {YOUR_NODE_PATH}/logs/nodejs-pattern.out.log
    merge_logs: true
    pid_file: {YOUR_NODE_PATH}/pids/nodejs-pattern.pid
    min_uptime: 1000s
    max_restarts: 10
    autorestart: true
    listen_timeout: 5000
    kill_timeout: 5000
    restart_delay: 5000
    env_local:
        NODE_ENV: local
        NODE_PATH: {YOUR_NODE_PATH}
        DEBUG: '*nodejs-pattern*'
    env_development:
        NODE_ENV: development
        NODE_PATH: {YOUR_NODE_PATH}
        DEBUG: '*nodejs-pattern*'
    env_stage:
        NODE_ENV: stage
        NODE_PATH: {YOUR_NODE_PATH}
        DEBUG: '*nodejs-pattern*'
    env_production:
        NODE_ENV: production
        NODE_PATH: {YOUR_NODE_PATH}
        DEBUG: '*nodejs-pattern*'
```

``` bash
$ pm2 start ./server.yaml --env local
```

# Check
### bash
``` bash
$ curl -XGET 'http://localhost:3000/api/index'
{"message":"welcome to the datahub admin"}
```

### swagger
Access 'http://localhost:3000/docs' with your browser
