'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HapiPlugin = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

exports.setupLogger = setupLogger;

var _syslog = require('../adapter/syslog');

var _syslog2 = _interopRequireDefault(_syslog);

var _console = require('../adapter/console');

var _console2 = _interopRequireDefault(_console);

var _constants = require('../constants');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var severityMethods = (0, _values2.default)(_constants.SEVERITY_NAME);

/**
 *
 * @param {Object} Logger
 * @param {Server} server
 * @param {Object} options
 */
function setupLogger(Logger, server, options) {
    var hapiPlugin = new HapiPlugin(Logger);

    // always add console as adapter
    Logger.setParameters(options);
    Logger.addAdapter(_console2.default, options.console || {});

    // if syslog object is provided, add syslog adapter
    if (options.syslog) {
        Logger.addAdapter(_syslog2.default, options.syslog);
    }

    //
    // expose logger everywhere in hapi
    //
    server.app.logger = Logger;
    server.decorate('server', 'logger', Logger);

    //
    // logging requested via `server.log`
    // possible calls:
    //  - `server.log('error', data);`
    //  - `server.log(['error', 'database'], data);`
    //
    server.on('log', function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        hapiPlugin.onServerLog.apply(hapiPlugin, [server].concat(args));
    });

    //
    // logging requested via `request.log`
    // possible calls:
    //  - `request.log('error', data);`
    //  - `request.log(['error', 'database'], data);`
    //
    server.on('request', function () {
        hapiPlugin.onRequestLog.apply(hapiPlugin, arguments);
    });

    //
    // error during route handler processing
    //
    server.on('request-error', function () {
        hapiPlugin.onRequestError.apply(hapiPlugin, arguments);
    });

    //
    // internal hapi event related to request
    // currently we only interested in received sub-event
    // to render request before any processing will start
    //
    server.on('request-internal', function () {
        hapiPlugin.onRequestInternal.apply(hapiPlugin, arguments);
    });

    //
    // just handler to notify that server is started
    //
    server.ext({
        type: 'onPostStart',
        method: function method() {
            return hapiPlugin.onServerStart(server);
        }
    });
}

/**
 * HapiPlugin
 *
 */

var HapiPlugin = exports.HapiPlugin = function () {

    /**
     *
     * @param {Logger} Logger
     * @constructor
     */
    function HapiPlugin(Logger) {
        (0, _classCallCheck3.default)(this, HapiPlugin);

        this._logger = Logger;
    }

    /**
     *
     * @param {Server} server
     */


    (0, _createClass3.default)(HapiPlugin, [{
        key: 'onServerStart',
        value: function onServerStart(server) {
            this._logger.info('server started:', server.info.uri);
        }

        /**
         *
         * @param {Server} server
         * @param {Object} event
         * @param {Array} tags
         */

    }, {
        key: 'onServerLog',
        value: function onServerLog(server, event, tags) {
            var severity = this._severityFromTags('debug', tags);
            var data = this._formatData(severity, event, tags);
            this._logger[severity](data);
        }

        /**
         *
         * @param {Request} request
         * @param {Object} event
         * @param {Array} tags
         */

    }, {
        key: 'onRequestLog',
        value: function onRequestLog(request, event, tags) {
            var severity = this._severityFromTags('debug', tags);
            var data = this._formatData(severity, event, tags);
            this._logger[severity](data);
        }

        /**
         *
         * @param {Request} request
         * @param {error} err
         */

    }, {
        key: 'onRequestError',
        value: function onRequestError(request, err) {
            this._logger.error(err);
        }

        /**
         *
         * @param {Request} request
         * @param {Object} event
         * @param {Array} tags
         */

    }, {
        key: 'onRequestInternal',
        value: function onRequestInternal(request, event, tags) {
            // new request just received
            if (tags['received']) {
                var method = request.method.toUpperCase();
                var proto = request.headers['x-forwarded-proto'] || request.connection.info.protocol;
                var url = proto + '://' + request.info.host + request.url.path;
                this._logger.debug(method, url);
            }
        }

        /**
         *
         * @param {string} severity
         * @param {Object} event
         * @param {Array} tags
         * @returns {string}
         * @private
         */

    }, {
        key: '_formatData',
        value: function _formatData(severity, event, tags) {
            var tagsPayload = this._formatTags(severity, tags);

            var data = [];
            if (tagsPayload.length > 0) {
                data.push(tagsPayload);
            }

            // format data correctly, include stack to result
            switch (true) {
                case event.data instanceof Error:
                    data.push(event.data.stack);
                    break;

                default:
                    data.push(event.data);
            }

            return data.join(' ');
        }

        /**
         *
         * @param {string} defaultLevel
         * @param {Array} tags
         */

    }, {
        key: '_severityFromTags',
        value: function _severityFromTags(defaultLevel, tags) {
            var tagList = tags;
            if (tagList instanceof Array === false) {
                tagList = (0, _keys2.default)(tagList);
            }

            var result = _lodash2.default.find(tagList, function (key) {
                return severityMethods.indexOf(key) >= 0;
            });

            return result || defaultLevel;
        }

        /**
         *
         * @param {string} severity
         * @param {Array} tags
         * @private
         */

    }, {
        key: '_formatTags',
        value: function _formatTags(severity, tags) {
            var tagList = tags;
            if (tagList instanceof Array === false) {
                tagList = (0, _keys2.default)(tagList);
            }

            tagList = _lodash2.default.filter(tagList, function (key) {
                return key !== severity;
            });

            return tagList.length > 0 ? _util2.default.format('[%s]', tagList.join(', ')) : '';
        }
    }]);
    return HapiPlugin;
}();