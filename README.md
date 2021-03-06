**😬 My favorite node.js webapp basic pattern (with Express.js)**

# Require
- **Node.js (ECMAScript 7)**
- **OS: mac, linux**
- **Database: redis, mysql**
- **Alarm: telegram token, chat_id**

# Clone & Add DB access config
### Clone
``` bash
$ git clone https://github.com/enchoyism/nodejs-pattern.git
$ npm install -d
```

### Config
**New file(./configs/private.js)**
Edit {...} to your config.
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
    test: {
        local: {
            host: 'http://127.0.0.1'
        },
    }
    telegram: {
        token: '{YOUR_TELEGRAM_TOKEN}',
        chat_id: '{YOUR_CHAT_ID}'
    }
};
```

# Quick start
``` bash
$ npm start
```

# Cluster start (pm2)
``` bash
$ npm install pm2 -g
```

**EDIT** {YOUR_REPOSITORY_PATH} to absolute path (ex. /home/...) of ./server.yaml
``` YML
apps:
  - name: nodejs-pattern
    script: {YOUR_REPOSITORY_PATH}/bin/www
    cmd: {YOUR_REPOSITORY_PATH}
    interpreter: node
    interpreterArgs: --max-old-space-size=2048 --stack_size=8192
    instances: 0
    exec_mode: cluster
    max_memory_restart: 1G
    log_date_format: YYYY-MM-DD HH:mm:ss Z
    error_file: {YOUR_REPOSITORY_PATH}/logs/nodejs-pattern.err.log
    out_file: {YOUR_REPOSITORY_PATH}/logs/nodejs-pattern.out.log
    merge_logs: true
    pid_file: {YOUR_REPOSITORY_PATH}/pids/nodejs-pattern.pid
    min_uptime: 1000s
    max_restarts: 10
    autorestart: true
    listen_timeout: 5000
    kill_timeout: 5000
    restart_delay: 5000
    env_local:
        NODE_ENV: local
        NODE_PATH: {YOUR_REPOSITORY_PATH}
        DEBUG: '*nodejs-pattern*'
    env_development:
        NODE_ENV: development
        NODE_PATH: {YOUR_REPOSITORY_PATH}
        DEBUG: '*nodejs-pattern*'
    env_stage:
        NODE_ENV: stage
        NODE_PATH: {YOUR_REPOSITORY_PATH}
        DEBUG: '*nodejs-pattern*'
    env_production:
        NODE_ENV: production
        NODE_PATH: {YOUR_REPOSITORY_PATH}
        DEBUG: '*nodejs-pattern*'
```

``` bash
$ pm2 start ./server.yaml --env local
```

# Check
### curl
``` bash
$ curl -XGET 'http://localhost:3000/api/index'
{"message":"welcome to the datahub admin"}
```

### swagger
Access 'http://localhost:3000/docs' with your browser

# Mysql usage sample
### Transaction mode
The connection will be released automatically
- [middleware/init.js](https://github.com/enchoyism/nodejs-pattern/blob/master/middleware/init.js)
- [route/api/index.js](https://github.com/enchoyism/nodejs-pattern/blob/master/route/api/index.js)
- [model/index.js](https://github.com/enchoyism/nodejs-pattern/blob/master/model/index.js)
``` javascript
const mysql = req.app.get('mysql');

try {
    await mysql.beginTransaction();

    // ...dosomething (await/async & promise db access)

    await mysql.commitTransaction();
} catch (error) {
    await mysql.rollbackTransaction();
    throw error;
}
```

### General mode
``` javascript
// ...dosomething
const mysql = req.app.get('mysql');

try {
    // ...dosomething (await/async & promise db access)
} catch (error) {
    await mysql.rollbackTransaction();
    throw error;
}
```

# Test & Coverage (istanbul)
### Execute
``` bash
$ npm test
> export NODE_ENV=local & export NODE_PATH=. & node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- --timeout=60000 --recursive ./test



  api/index
    GET: /index
      ✓ hello welcome message (62ms)

  cont/index
    GET: /index
      ✓ hello welcome message


  2 passing (597ms)


=============================== Coverage summary ===============================
Statements   : 76.61% ( 226/295 )
Branches     : 34.48% ( 20/58 )
Functions    : 63.79% ( 37/58 )
Lines        : 76.61% ( 226/295 )
================================================================================
```

### Browser
``` bash
$ open coverage/lcov-report/index.html
```
