# dalee-logger

[![Build Status](https://travis-ci.org/Dalee/node-logger.svg?branch=master)](https://travis-ci.org/Dalee/node-logger)
[![codecov](https://codecov.io/gh/Dalee/node-logger/branch/master/graph/badge.svg)](https://codecov.io/gh/Dalee/node-logger)
[![Dependencies](https://david-dm.org/Dalee/node-logger.svg)](https://david-dm.org/Dalee/node-logger)

Great for Docker/Kubernetes environments.

> Currently in production testing phase.


Key features:

 * Minimal configuration required
 * Bundled framework support:
   * [hapi.js](https://hapijs.com/) `>= v15.2.0`
   * [express.js](http://expressjs.com/) `>= v4.0.0`
 * General `uncaughtException` and `unhandledRejection` handling (process will be terminated)
 * Console writer (enabled by default)
 * Syslog [RFC3164](https://www.ietf.org/rfc/rfc3164.txt) udp4 writer

## Usage

`npm i dalee-logger --save`

### Configuration

Global configuration options:

 * `facility` - facility, default value: `1` (`USER`) (syslog parameter) 
 * `severity` - severity for events logged with `log` method, default value: `debug`
 * `hostname` - hostname (syslog parameter), default value: `os.hostname()`
 * `app` - application name (syslog parameter), default value: `path.basename(process.title)`
 * `logger_level` - output event level, possible values are:
   * `emerg`
   * `alert`
   * `critical`
   * `error`
   * `warning`
   * `notice`
   * `info`
   * `debug`


> `logger_level` also can be set via environment variable `LOGGER_LEVEL`
 
### Adapter configuration

#### Console

 * `enabled` - true/false, should console be silent or not, default is `true`


Sample output:
```
[2016-11-26 13:52:45.2342] debug: Hello world
```
 
#### Syslog

 * `host` - valid fqdn or ip address of Syslog/Logstash daemon
 * `port` - udp4 port number


Sample output (udp4 packet):
```
<0>2016-11-26 23:23:23.4554 localhost app: hello world
```

### Standalone

```
import Logger, {Syslog, Console} from 'dalee-logger';

Logger.setParameters({ app: 'node' });

Logger.addAdapter(Console, {});
Logger.addAdapter(Syslog, {
    'host': 'example.com',
    'port': 514
});

Logger.debug('Will write to console and send UDP syslog packet');
```

### hapi.js

Register as plugin in `manifest.js`:

```
plugin: {
  register: 'dalee-logger',
  options: {
    app: 'node-daemon',
    hostname: 'example.com',
    console: {
      enabled: true
    },
    syslog: {
      host: 'example.com',
      port: 514
    }
  }
}
```

### express.js

Register as express middleware:

```
import express from 'express';
import {express as expressLogger} from 'dalee-logger';

const app = express();
const logger = expressLogger({
  app: 'node-daemon',
  hostname: 'example.com',
  console: {
    enabled: true
  },
  syslog: {
    host: 'example.com',
    port: 514
  }
});

app.use(logger);

app.get('/', function(req,res) {
    req.log('notice', 'The next message will be error');
    undefined.error = 'Force error';
});

app.use(logger.errorLogger);

app.listen(80, () => {
    logger.log('debug', 'server started');
});
```

## Sample Logstash configuration

> Check out our [ELK-playground](https://github.com/Dalee/elk-playground) project


 * Logstash will listen on port `5000` for udp packets
 * Successfully parsed message will go into index named `logstash-{syslog_program}`
 * Every unparsed line will go to index named `logstash-error`
 * Logstash will write to Elastic on `localhost:9200`


```
input {
    udp {
        port => 5000
        type => syslog
    }
}

filter {
    grok {
      match => { "message" => "<%{POSINT:syslog_pri}>%{SYSLOGTIMESTAMP:syslog_timestamp} %{SYSLOGHOST:syslog_hostname} %{DATA:syslog_program}(?:\[%{POSINT:syslog_pid}\])?: %{GREEDYDATA:syslog_message}" }
      add_field => [ "received_at", "%{@timestamp}" ]
      add_field => [ "index_type", "%{syslog_program}" ]
    }

    date {
      match => [ "syslog_timestamp", "MMM d HH:mm:ss.SSS" ]
      locale => "en"
      timezone => "Europe/Moscow"
      target => "@timestamp"
    }

    syslog_pri {
    }

    # every unparsed line will go to logstash-error index
    if "_grokparsefailure" in [tags] {
        mutate {
            add_field => [ "index_type", "error" ]
        }
    }
}

output {
    elasticsearch {
        # flush_size = 1 set only for debugging purposes, should be > 1 on production
        flush_size => 1
        hosts => ["localhost:9200"]
        index => "logstash-%{index_type}"
    }
    stdout {
        # this should be disabled in production environment
        codec => rubydebug
    }
}
```

## License

Software licensed under the [MIT License](http://www.opensource.org/licenses/MIT).
