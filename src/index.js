import moment from 'moment';
import os from 'os';
import util from 'util';
import path from 'path';
import validator from 'validator';

import {FACILITY, SEVERITY, FACILITY_CODE, SEVERITY_CODE} from './constants';
import Syslog from './adapter/syslog';
import Console from './adapter/console';
import {setupLogger as setupHapiLogger} from './plugin/hapi';

// some default parameters
moment.locale('en');
let _adapters = [];
let _params = {
    'facility': FACILITY_CODE.USER,
    'severity': SEVERITY_CODE.DEBUG,
    'hostname': os.hostname(),
    'app': path.basename(process.title)
};

/**
 * Logger class, singleton
 *
 */
export default class Logger {

    /**
     * Set parameters
     *
     * @param {Object} params
     * @throws Error
     */
    static setParameters(params) {

        const appNameRegex = /^[a-z0-9_.-]{1,48}$/i;
        const fqdnOptions = {
            require_tld: false,
            allow_underscores: true
        };

        // validate facility (if passed)
        if (params.hasOwnProperty('facility')) {
            params.facility = parseInt(params.facility, 10);
            if (isNaN(params.facility)) {
                throw new Error("Facility is not a number");
            }
            if (!FACILITY.hasOwnProperty(params.facility)) {
                throw new Error("Incorrect facility number");
            }

            _params.facility = params.facility;
        }

        // validate severity (if passed)
        if (params.hasOwnProperty('severity')) {
            params.severity = parseInt(params.severity, 10);
            if (isNaN(params.severity)) {
                throw new Error("Severity is not a number");
            }
            if (!SEVERITY.hasOwnProperty(params.severity)) {
                throw new Error("Incorrect severity number");
            }

            _params.severity = params.severity;
        }

        // validate hostname (if passed)
        // should be 255 chars max
        params.hostname = params.hostname || _params.hostname;
        params.hostname = [params.hostname].join('');

        let fqdnCheck = true;
        fqdnCheck = fqdnCheck && params.hostname.length <= 255;
        fqdnCheck = fqdnCheck && validator.isFQDN(params.hostname, fqdnOptions);
        fqdnCheck = fqdnCheck || validator.isIP(params.hostname);
        if (!fqdnCheck) {
            throw new Error('Hostname should be either IP or correct FQDN and no longer than 255 chars');
        } else {
            _params.hostname = params.hostname;
        }

        // should be 48 chars max
        params.app = params.app || _params.app;
        params.app = [params.app,].join('');
        if (!appNameRegex.test(params.app)) {
            throw new Error(`Incorrect app name, it should match: ${appNameRegex}`);
        } else {
            _params.app = params.app;
        }
    }

    /**
     * Get current parameters
     *
     * @returns {Object}
     */
    static getParameters() {
        return _params;
    }

    /**
     * Clear all registered adapters
     */
    static clearAdapters() {
        _adapters = [];
    }

    /**
     * Register new adapter
     *
     * @param {Object} adapter
     * @param {Object} options
     */
    static addAdapter(adapter, options) {
        _adapters.push(new adapter(options));
    }

    /**
     *
     * @param {error} err
     */
    static unhandledError(err) {
        this.emerg(err);
        setTimeout(() => {
            process.exit(1);
        }, 2000);
    }

    /**
     *
     */
    static log(...args) {
        this._log(SEVERITY_CODE.DEBUG, this._fmt(args));
    }

    /**
     *
     */
    static emerg(...args) {
        this._log(SEVERITY_CODE.EMERGENCY, this._fmt(args));
    }

    /**
     *
     */
    static alert(...args) {
        this._log(SEVERITY_CODE.ALERT, this._fmt(args));
    }

    /**
     *
     */
    static critical(...args) {
        this._log(SEVERITY_CODE.CRITICAL, this._fmt(args));
    }

    /**
     *
     */
    static error(...args) {
        this._log(SEVERITY_CODE.ERROR, this._fmt(args));
    }

    /**
     *
     */
    static warning(...args) {
        this._log(SEVERITY_CODE.WARNING, this._fmt(args));
    }

    /**
     *
     */
    static notice(...args) {
        this._log(SEVERITY_CODE.NOTICE, this._fmt(args));
    }

    /**
     *
     */
    static info(...args) {
        this._log(SEVERITY_CODE.INFO, this._fmt(args));
    }

    /**
     *
     */
    static debug(...args) {
        this._log(SEVERITY_CODE.DEBUG, this._fmt(args));
    }

    /**
     *
     * @param {Array} args
     * @returns {string}
     * @private
     */
    static _fmt(args) {
        return util.format.apply(this, args);
    }

    /**
     *
     * @param {number} severity
     * @param {string} message
     * @private
     */
    static _log(severity, message) {
        const facility = _params.facility;
        const hostname = _params.hostname;
        const application = _params.app;
        const date = moment().format('MMM D HH:mm:ss.SSS');

        // deliver everything to adapters
        for (const adapter of _adapters) {
            adapter.write(facility, severity, hostname, application, date, message);
        }
    }
}

// add some additional exports from constants
export {
    // classes
    Syslog,
    Console,
    // help dictionaries
    FACILITY,
    SEVERITY,
    FACILITY_CODE,
    SEVERITY_CODE
};

// some registrations
process.on('uncaughtException', (err) => Logger.unhandledError(err));
process.on('unhandledRejection', (err) => Logger.unhandledError(err));

// hapi plugin
exports.register = (server, options, next) => {
    setupHapiLogger(Logger, server, options);
    next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};
