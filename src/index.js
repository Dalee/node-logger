import moment from 'moment';

import { FACILITY, SEVERITY, SEVERITY_NAME, FACILITY_CODE, SEVERITY_CODE } from './constants';
import LoggerImpl from './logger';
import Syslog from './adapter/syslog';
import Console from './adapter/console';
import Memory from './adapter/memory';
import { setupLogger as setupHapiLogger } from './plugin/hapi';
import setupExpress from './plugin/express';

/**
 * Default static helpers
 */
class Logger {

    /**
     * Set parameters
     *
     * @param {Object} params
     * @throws Error
     */
    static setParameters(params) {
        return gDefaultLogger.setParameters(params);
    }

    /**
     * Get current parameters
     *
     * @returns {Object}
     */
    static getParameters() {
        return gDefaultLogger.getParameters();
    }

    /**
     * Clear all registered adapters
     */
    static clearAdapters() {
        return gDefaultLogger.clearAdapters();
    }

    /**
     * Register new adapter
     *
     * @param {Function} adapter
     * @param {Object} options
     */
    static addAdapter(adapter, options) {
        return gDefaultLogger.addAdapter(adapter, options);
    }

    /**
     *
     * @returns {*}
     */
    static getAdapters() {
        return gDefaultLogger.getAdapters();
    }

    /**
     *
     */
    static log(...args) {
        gDefaultLogger.debug(...args);
    }

    /**
     *
     */
    static emerg(...args) {
        gDefaultLogger.emerg(...args);
    }

    /**
     *
     */
    static alert(...args) {
        gDefaultLogger.alert(...args);
    }

    /**
     *
     */
    static critical(...args) {
        gDefaultLogger.critical(...args);
    }

    /**
     *
     */
    static error(...args) {
        gDefaultLogger.error(...args);
    }

    /**
     *
     */
    static warning(...args) {
        gDefaultLogger.warning(...args);
    }

    /**
     *
     */
    static notice(...args) {
        gDefaultLogger.notice(...args);
    }

    /**
     *
     */
    static info(...args) {
        gDefaultLogger.info(...args);
    }

    /**
     *
     */
    static debug(...args) {
        gDefaultLogger.debug(...args);
    }
}

// default logger and logger instances
const gDefaultLogger = new LoggerImpl();
const gLoggerInstances = [];

// when process faced with unhandled exception,
// distribute it across all loggers and exit.
const unhandledException = err => {
    for (let i = 0; i < gLoggerInstances.length; i++) {
        gLoggerInstances[i].emerg(err);
    }
    // make small delay before exit in order to allow send
    // all udp packets.
    setTimeout(() => {
        process.exit(1);
    }, 2000);
};

// default registrations
// register default logger
moment.locale('en');
gLoggerInstances.push(gDefaultLogger);
process.on('uncaughtException', unhandledException);
process.on('unhandledRejection', unhandledException);

// Default exports
module.exports = exports = Logger;
exports.default = Logger;
exports.Syslog = Syslog;
exports.Console = Console;
exports.Memory = Memory;
exports.FACILITY = FACILITY;
exports.FACILITY_CODE = FACILITY_CODE;
exports.SEVERITY = SEVERITY;
exports.SEVERITY_CODE = SEVERITY_CODE;
exports.SEVERITY_NAME = SEVERITY_NAME;

// Hapi.js plugin registration
exports.register = async (server, options) => {
    const hapiLogger = new LoggerImpl();
    gLoggerInstances.push(hapiLogger);

    setupHapiLogger(hapiLogger, server, options);
};

exports.plugin = {
    pkg: require('../package.json'),
    register: exports.register
};

// Hapi plugin metadata
exports.register.attributes = {
    pkg: require('../package.json')
};

// Express.js plugin registration
exports.express = (options) => {
    const expressLogger = new LoggerImpl();
    gLoggerInstances.push(expressLogger);

    return setupExpress(expressLogger, options);
};
