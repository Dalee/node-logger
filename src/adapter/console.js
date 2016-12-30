import util from 'util';
import os from 'os';
import {SEVERITY_NAME} from '../constants';

/**
 * Console adapter
 *
 */
export default class Console {

    /**
     *
     * @param {Object} options
     * @constructor
     */
    constructor(options) {
        this._options = options || {enabled: true};
    }

    /**
     *
     * @param {number} facility
     * @param {number} severity
     * @param {string} hostname
     * @param {string} application
     * @param {string} date
     * @param {string} message
     */
    write(facility, severity, hostname, application, date, message) {
        if (this._options.enabled) {
            const output = this._fmt(facility, severity, hostname, application, date, message);
            this._write(output);
        }
    }

    /**
     *
     *
     * @param {number} facility
     * @param {number} severity
     * @param {string} hostname
     * @param {string} application
     * @param {string} date
     * @param {string} message
     * @private
     */
    _fmt(facility, severity, hostname, application, date, message) {
        const severityName = SEVERITY_NAME[severity];
        return util.format("[%s] %s: %s%s", date, severityName, message, os.EOL);
    }

    /**
     *
     * @param {string} output
     * @private
     */
    _write(output) {
        process.stdout.write(output);
    }
};
