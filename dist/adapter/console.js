'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 */
var Console = function () {

  /**
   *
   * @param options
   */
  function Console(options) {
    (0, _classCallCheck3.default)(this, Console);

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


  (0, _createClass3.default)(Console, [{
    key: 'write',
    value: function write(facility, severity, hostname, application, date, message) {
      var output = this._fmt(facility, severity, hostname, application, date, message);
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

  }, {
    key: '_fmt',
    value: function _fmt(facility, severity, hostname, application, date, message) {
      var severityName = _constants.SEVERITY_NAME[severity];
      return _util2.default.format("[%s] %s: %s%s", date, severityName, message, _os2.default.EOL);
    }

    /**
     *
     * @param output
     * @private
     */

  }, {
    key: '_write',
    value: function _write(output) {
      process.stdout.write(output);
    }
  }]);
  return Console;
}();

exports.default = Console;
;
module.exports = exports['default'];