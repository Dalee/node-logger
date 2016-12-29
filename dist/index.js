'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SEVERITY_CODE = exports.FACILITY_CODE = exports.SEVERITY = exports.FACILITY = exports.Console = exports.Syslog = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _constants = require('./constants');

var _syslog = require('./adapter/syslog');

var _syslog2 = _interopRequireDefault(_syslog);

var _console = require('./adapter/console');

var _console2 = _interopRequireDefault(_console);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// add some additional exports from constants
exports.Syslog = _syslog2.default;
exports.Console = _console2.default;
exports.FACILITY = _constants.FACILITY;
exports.SEVERITY = _constants.SEVERITY;
exports.FACILITY_CODE = _constants.FACILITY_CODE;
exports.SEVERITY_CODE = _constants.SEVERITY_CODE;

// some default parameters

_moment2.default.locale('en');
var _adapters = [];
var _params = {
    'facility': _constants.FACILITY_CODE.USER,
    'severity': _constants.SEVERITY_CODE.DEBUG,
    'hostname': _os2.default.hostname(),
    'app': _path2.default.basename(process.title)
};

/**
 * Logger class
 *
 */

var Logger = function () {
    function Logger() {
        (0, _classCallCheck3.default)(this, Logger);
    }

    (0, _createClass3.default)(Logger, null, [{
        key: 'setParameters',


        /**
         *
         * @param params
         * @throws Error
         */
        value: function setParameters(params) {

            var appNameRegex = /^[a-z0-9_.-]{1,48}$/i;
            var fqdnOptions = {
                require_tld: false,
                allow_underscores: true
            };

            // validate facility (if passed)
            if (params.hasOwnProperty('facility')) {
                params.facility = parseInt(params.facility, 10);
                if (isNaN(params.facility)) {
                    throw new Error("Facility is not a number");
                }
                if (!_constants.FACILITY.hasOwnProperty(params.facility)) {
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
                if (!_constants.SEVERITY.hasOwnProperty(params.severity)) {
                    throw new Error("Incorrect severity number");
                }

                _params.severity = params.severity;
            }

            // validate hostname (if passed)
            // should be 255 chars max
            params.hostname = params.hostname || _params.hostname;
            params.hostname = [params.hostname].join('');

            var fqdnCheck = true;
            fqdnCheck = fqdnCheck && params.hostname.length <= 255;
            fqdnCheck = fqdnCheck && _validator2.default.isFQDN(params.hostname, fqdnOptions);
            fqdnCheck = fqdnCheck || _validator2.default.isIP(params.hostname);
            if (!fqdnCheck) {
                throw new Error('Hostname should be either IP or correct FQDN and no longer than 255 chars');
            } else {
                _params.hostname = params.hostname;
            }

            // should be 48 chars max
            params.app = params.app || _params.app;
            params.app = [params.app].join('');
            if (!appNameRegex.test(params.app)) {
                throw new Error('Incorrect app name, it should match: ' + appNameRegex);
            } else {
                _params.app = params.app;
            }
        }

        /**
         *
         * @returns {{facility: number, severity: number, hostname: *, app: *}}
         */

    }, {
        key: 'getParameters',
        value: function getParameters() {
            return _params;
        }

        /**
         *
         */

    }, {
        key: 'clearAdapters',
        value: function clearAdapters() {
            _adapters = [];
        }

        /**
         *
         * @param adapter
         * @param options
         */

    }, {
        key: 'addAdapter',
        value: function addAdapter(adapter, options) {
            _adapters.push(new adapter(options));
        }

        /**
         *
         */

    }, {
        key: 'log',
        value: function log() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            this._log(_constants.SEVERITY_CODE.DEBUG, this._fmt(args));
        }

        /**
         *
         */

    }, {
        key: 'emerg',
        value: function emerg() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            this._log(_constants.SEVERITY_CODE.EMERGENCY, this._fmt(args));
        }

        /**
         *
         */

    }, {
        key: 'alert',
        value: function alert() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            this._log(_constants.SEVERITY_CODE.ALERT, this._fmt(args));
        }

        /**
         *
         */

    }, {
        key: 'critical',
        value: function critical() {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            this._log(_constants.SEVERITY_CODE.CRITICAL, this._fmt(args));
        }

        /**
         *
         */

    }, {
        key: 'error',
        value: function error() {
            for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                args[_key5] = arguments[_key5];
            }

            this._log(_constants.SEVERITY_CODE.ERROR, this._fmt(args));
        }

        /**
         *
         */

    }, {
        key: 'warning',
        value: function warning() {
            for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                args[_key6] = arguments[_key6];
            }

            this._log(_constants.SEVERITY_CODE.WARNING, this._fmt(args));
        }

        /**
         *
         */

    }, {
        key: 'notice',
        value: function notice() {
            for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
                args[_key7] = arguments[_key7];
            }

            this._log(_constants.SEVERITY_CODE.NOTICE, this._fmt(args));
        }

        /**
         *
         */

    }, {
        key: 'info',
        value: function info() {
            for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
                args[_key8] = arguments[_key8];
            }

            this._log(_constants.SEVERITY_CODE.INFO, this._fmt(args));
        }

        /**
         *
         */

    }, {
        key: 'debug',
        value: function debug() {
            for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
                args[_key9] = arguments[_key9];
            }

            this._log(_constants.SEVERITY_CODE.DEBUG, this._fmt(args));
        }

        /**
         *
         * @param args
         * @returns {*}
         * @private
         */

    }, {
        key: '_fmt',
        value: function _fmt(args) {
            return _util2.default.format.apply(this, args);
        }

        /**
         *
         * @param severity
         * @param message
         * @private
         */

    }, {
        key: '_log',
        value: function _log(severity, message) {
            var facility = _params.facility;
            var hostname = _params.hostname;
            var application = _params.app;
            var date = (0, _moment2.default)().format('MMM D HH:mm:ss.SSS');

            // deliver everything to adapters
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(_adapters), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var adapter = _step.value;

                    adapter.write(facility, severity, hostname, application, date, message);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }]);
    return Logger;
}();

exports.default = Logger;