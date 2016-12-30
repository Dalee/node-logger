'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _dgram = require('dgram');

var _dgram2 = _interopRequireDefault(_dgram);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * https://tools.ietf.org/html/rfc5424
 *
 */
var Syslog = function () {

    /**
     *
     * @param {Object} options
     */
    function Syslog(options) {
        (0, _classCallCheck3.default)(this, Syslog);

        options = options || {};
        this._host = options.host || '127.0.0.1';
        this._port = parseInt(options.port, 10) || 514;

        this._sender = _dgram2.default.createSocket('udp4');
        this._sender.unref();
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


    (0, _createClass3.default)(Syslog, [{
        key: 'write',
        value: function write(facility, severity, hostname, application, date, message) {
            var priority = this.calculatePri(facility, severity);
            var msg = this.cleanMessage(message);
            var parts = [];

            // if msg after cleanup is empty, do not send anything..
            if (msg.length === 0) {
                return;
            }

            // formatting header
            var header = _util2.default.format('<%d>%s', priority, date);

            parts.push(header);
            if (hostname.length > 0) {
                parts.push(hostname);
            }

            if (application.length > 0) {
                parts.push(_util2.default.format('%s:', application));
            }

            parts.push(msg);
            var output = _util2.default.format.apply(this, parts);

            this._write(output);
        }

        /**
         * https://tools.ietf.org/html/rfc5424#section-6.4
         * @param {string} message
         */

    }, {
        key: 'cleanMessage',
        value: function cleanMessage(message) {
            return _validator2.default.stripLow(message, true);
        }

        /**
         * https://tools.ietf.org/html/rfc5424#section-6.2.1
         * (facility * 8) + severity
         *
         * @param {number} facility
         * @param {number} severity
         */

    }, {
        key: 'calculatePri',
        value: function calculatePri(facility, severity) {
            return facility * 8 + severity;
        }

        /**
         *
         * @param {string} output
         * @private
         */

    }, {
        key: '_write',
        value: function _write(output) {
            this._sender.send(output, 0, output.length, this._port, this._host);
        }
    }]);
    return Syslog;
}();

exports.default = Syslog;
;
module.exports = exports['default'];