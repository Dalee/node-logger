/**
 * Example code
 * run with Babel6 wrapper:
 * * `./node_modules/.bin/babel-node ./examples/general.js`
 */
import Logger from './../src/index';

// defined some constants
const SYSLOG_HOST = process.env.SYSLOG_HOST;
const SYSLOG_PORT = process.env.SYSLOG_PORT || 514;
const CONSOLE_LOG = (process.env.hasOwnProperty('CONSOLE_LOG'))
    ? process.env.CONSOLE_LOG === 'true'
    : true;

// if syslog host is provided, add syslog adapter
if (SYSLOG_HOST) {
    Logger.addAdapter(Logger.Syslog, {
        'host': SYSLOG_HOST,
        'port': SYSLOG_PORT
    });
}

// if console is requested (or omitted) add console adapter
if (CONSOLE_LOG) {
    Logger.addAdapter(Logger.Console, {});
}

// make some calls
Logger.debug('Publishing log line with DEBUG severity');
Logger.info('Publishing log line with INFO severity');
Logger.emerg(new Error('This is sample error logged'));
