import dgram from 'dgram';
import util from 'util';
import validator from 'validator';

/**
 * https://tools.ietf.org/html/rfc5424
 *
 */
export default class Syslog {

    /**
     *
     * @param {Object} options
     */
    constructor(options) {
        options = options || {};
        this._host = options.host || '127.0.0.1';
        this._port = parseInt(options.port, 10) || 514;

        this.initSocket();
    }

    /**
     * Initialize server socket, catch error event re-create client socket.
     */
    initSocket() {
        this._sender = dgram.createSocket('udp4');
        this._sender.unref();

        this._sender.on('error', () => {
            this._sender = null;
            this.initSocket();
        });
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
    write(facility, severity, hostname, application, date, message) { // eslint-disable-line max-params
        const priority = this.calculatePri(facility, severity);
        const msg = this.cleanMessage(message);
        const parts = [];

        // if msg after cleanup is empty, do not send anything..
        if (msg.length === 0) {
            return;
        }

        // formatting header
        const header = util.format(
            '<%d>%s',
            priority,
            date
        );

        parts.push(header);
        if (hostname.length > 0) {
            parts.push(hostname);
        }

        if (application.length > 0) {
            parts.push(util.format('%s:', application));
        }

        parts.push(msg);
        const output = util.format.apply(this, parts);

        this._write(output);
    }

    /**
     * https://tools.ietf.org/html/rfc5424#section-6.4
     * @param {string} message
     */
    cleanMessage(message) {
        return validator.stripLow(message, true);
    }

    /**
     * https://tools.ietf.org/html/rfc5424#section-6.2.1
     * (facility * 8) + severity
     *
     * @param {number} facility
     * @param {number} severity
     */
    calculatePri(facility, severity) {
        return (facility * 8 + severity);
    }

    /**
     *
     * @param {string} output
     * @private
     */
    _write(output) {
        const msg = new Buffer.from(output, 'utf8'); // we need calculate size in bytes
        this._sender.send(output, 0, msg.length, this._port, this._host);
    }
};
