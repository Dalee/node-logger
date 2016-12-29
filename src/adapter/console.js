import util from 'util';
import os from 'os';
import {SEVERITY_NAME} from '../constants';

/**
 *
 */
export default class Console {

    /**
     *
     * @param options
     */
    constructor(options) {
       this._options = options;
    }

    /**
     *
     * @param facility
     * @param severity
     * @param hostname
     * @param application
     * @param date
     * @param message
     */
    write(facility, severity, hostname, application, date, message) {
        const output = this._fmt(facility, severity, hostname, application, date, message);
        this._write(output);
    }

    /**
     * TODO: add color support
     *
     * @param facility
     * @param severity
     * @param hostname
     * @param application
     * @param date
     * @param message
     * @private
     */
    _fmt(facility, severity, hostname, application, date, message) {
        const severityName = SEVERITY_NAME[severity];
        return util.format("[%s] %s: %s%s", date, severityName, message, os.EOL);
    }

    /**
     *
     * @param output
     * @private
     */
    _write(output) {
        process.stdout.write(output);
    }
};
