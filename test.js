/**
 * Example code
 */
import Logger, {Syslog, Console} from './src/index';

// defined some constants
const SYSLOG_HOST = process.env.SYSLOG_HOST;
const SYSLOG_PORT = process.env.SYSLOG_PORT || 514;
const CONSOLE_LOG = (process.env.hasOwnProperty('CONSOLE_LOG'))
    ? process.env.CONSOLE_LOG === 'true'
    : true;

// if syslog host is provided, add syslog adapter
if (SYSLOG_HOST) {
    Logger.addAdapter(Syslog, {
        'host': SYSLOG_HOST,
        'port': SYSLOG_PORT
    });
}

// if console is requested (or omitted) add console adapter
if (CONSOLE_LOG) {
    Logger.addAdapter(Console);
}

// make some calls
Logger.debug("Hello world");
Logger.info("Another log line");
Logger.emerg(new Error("This is sample error logged"));
Logger.info("=================================");
Logger.info("=================================");
Logger.info("Previous exception trace was ok :)");
