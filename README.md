# dalee-logger

[![Build Status](https://travis-ci.org/Dalee/node-logger.svg?branch=master)](https://travis-ci.org/Dalee/node-logger)

Currently work-in-progress.

Highlights:

* Console writer
* Syslog udp4 writer (Syslog/Logstash compatible)
* `uncaughtException` and `unhandledRejection` handling (process will exit)
* `hapi.js` plugin
* `express.js` plugin

## Usage

`npm i dalee-logger --save`

### Standalone

```
import Logger, {Syslog, Console} from 'dalee-logger';

Logger.addAdapter(Console, {});
Logger.addAdapter(Syslog, {
    'host': 'example.com',
    'port': 514
});

Logger.debug('Will write to console and send UDP syslog packet');
```

### hapi.js

Version supported: `^15.2.0`

Just register plugin in `manifest.js` as:
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
```

### express.js

work-in-progress


## Logstash configuration

Sample filter for Logstash

 * successfully parsed message will go into index named `logstash-{syslog_program}`
 * every unparsed line will go to index named `logstash-error`

```
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
```
