import util from 'util';
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
        if (!this._options.hasOwnProperty('enabled')) {
            this._options.enabled = true;
        }
    }

    /**
     *
     * @param {number} facility
     * @param {number} severity
     * @param {string} hostname
     * @param {string} application
     * @param {string} date
     * @param {string} message
     *
     * eslint-disable max-params
     */
    write(facility, severity, hostname, application, date, message) { // eslint-disable-line max-params
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
    _fmt(facility, severity, hostname, application, date, message) { // eslint-disable-line max-params
        const severityName = SEVERITY_NAME[severity];
        return util.format("[%s] %s: %s", date, severityName, message);
    }

    /**
     *
     * @param {string} output
     * @private
     */
    _write(output) {
        console.log(output); // eslint-disable-line no-console
    }
};
