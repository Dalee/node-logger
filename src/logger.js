import moment from 'moment';
import os from 'os';
import util from 'util';
import path from 'path';
import validator from 'validator';

import { FACILITY, SEVERITY, SEVERITY_NAME, FACILITY_CODE, SEVERITY_CODE, SEVERITY_CODE2 } from './constants';

/**
 * Logger class, singleton
 *
 */
export default class LoggerImpl {

    constructor() {
        this._adapters = [];
        this._params = {
            'facility': FACILITY_CODE.USER, // default facility for event
            'severity': SEVERITY_CODE.DEBUG, // default level for event (if event severity is not specified)
            'hostname': os.hostname(), // default hostname
            'app': path.basename(process.title), // application name (elastic index name if parsed with logstash)
            'logger_level': process.env.LOGGER_LEVEL || SEVERITY_NAME[SEVERITY_CODE.DEBUG] // default filtering level
        };
    }

    /**
     * Set parameters
     *
     * @param {Object} params
     * @throws Error
     */
    setParameters(params) {

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

            this._params.facility = params.facility;
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

            this._params.severity = params.severity;
        }

        // validate hostname (if passed)
        // should be 255 chars max
        params.hostname = params.hostname || this._params.hostname;
        params.hostname = [params.hostname].join('');

        let fqdnCheck = true;
        fqdnCheck = fqdnCheck && params.hostname.length <= 255;
        fqdnCheck = fqdnCheck && validator.isFQDN(params.hostname, fqdnOptions);
        fqdnCheck = fqdnCheck || validator.isIP(params.hostname);
        if (!fqdnCheck) {
            throw new Error('Hostname should be either IP or correct FQDN and no longer than 255 chars');
        } else {
            this._params.hostname = params.hostname;
        }

        // should be 48 chars max
        params.app = params.app || this._params.app;
        params.app = [params.app,].join('');
        if (!appNameRegex.test(params.app)) {
            throw new Error(`Incorrect app name, it should match: ${appNameRegex}`);
        } else {
            this._params.app = params.app;
        }

        // validate and set logger_level (if passed)
        params.logger_level = params.logger_level || this._params.logger_level;
        params.logger_level = params.logger_level.toLowerCase();
        if (!SEVERITY_CODE2.hasOwnProperty(params.logger_level)) {
            throw new Error(`Incorrect logger level passed: ${params.logger_level}`);
        }

        this._params.logger_level = params.logger_level;
    }

    /**
     * Get current parameters
     *
     * @returns {Object}
     */
    getParameters() {
        return this._params;
    }

    /**
     * Clear all registered adapters
     */
    clearAdapters() {
        this._adapters.length = 0;
    }

    getAdapters() {
        return this._adapters;
    }

    /**
     * Register new adapter
     *
     * @param {Function} adapter
     * @param {Object} options
     */
    addAdapter(adapter, options) {
        this._adapters.push(new adapter(options));
    }

    /**
     *
     */
    log(...args) {
        this._log(SEVERITY_CODE.DEBUG, ...args);
    }

    /**
     *
     */
    emerg(...args) {
        this._log(SEVERITY_CODE.EMERGENCY, ...args);
    }

    /**
     *
     */
    alert(...args) {
        this._log(SEVERITY_CODE.ALERT, ...args);
    }

    /**
     *
     */
    critical(...args) {
        this._log(SEVERITY_CODE.CRITICAL, ...args);
    }

    /**
     *
     */
    error(...args) {
        this._log(SEVERITY_CODE.ERROR, ...args);
    }

    /**
     *
     */
    warning(...args) {
        this._log(SEVERITY_CODE.WARNING, ...args);
    }

    /**
     *
     */
    notice(...args) {
        this._log(SEVERITY_CODE.NOTICE, ...args);
    }

    /**
     *
     */
    info(...args) {
        this._log(SEVERITY_CODE.INFO, ...args);
    }

    /**
     *
     */
    debug(...args) {
        this._log(SEVERITY_CODE.DEBUG, ...args);
    }

    /**
     *
     * @param {Array} args
     * @returns {string}
     * @private
     */
    _fmt(args) {
        return util.format(...args);
    }

    /**
     *
     * @param {number} severity
     * @param {Array} args
     */
    _log(severity, ...args) {
        const message = this._fmt(args);
        if (severity > SEVERITY_CODE2[this._params.logger_level]) {
            return;
        }

        const facility = this._params.facility;
        const hostname = this._params.hostname;
        const application = this._params.app;
        const date = moment().format('MMM D HH:mm:ss.SSS');

        // deliver everything to adapters
        for (const adapter of this._adapters) {
            adapter.write(facility, severity, hostname, application, date, message);
        }
    }
}
