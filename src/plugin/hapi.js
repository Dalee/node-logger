import { processLogData } from '../helpers';
import Syslog from '../adapter/syslog';
import Console from '../adapter/console';

/**
 *
 * @param {Object} Logger
 * @param {Server} server
 * @param {Object} options
 */
export function setupLogger(Logger, server, options) {
    const hapiPlugin = new HapiPlugin(Logger);

    // always add console as adapter
    Logger.setParameters(options);
    Logger.addAdapter(Console, options.console || {});

    // if syslog object is provided, add syslog adapter
    if (options.syslog) {
        Logger.addAdapter(Syslog, options.syslog);
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
    server.on('log', (...args) => {
        hapiPlugin.onServerLog(server, ...args);
    });

    //
    // logging requested via `request.log`
    // possible calls:
    //  - `request.log('error', data);`
    //  - `request.log(['error', 'database'], data);`
    //
    server.on('request', (...args) => {
        hapiPlugin.onRequestLog(...args);
    });

    //
    // error during route handler processing
    //
    server.on('request-error', (...args) => {
        hapiPlugin.onRequestError(...args);
    });

    //
    // internal hapi event related to request
    // currently we only interested in received sub-event
    // to render request before any processing will start
    //
    server.on('request-internal', (...args) => {
        hapiPlugin.onRequestInternal(...args);
    });

    //
    // just handler to notify that server is started
    //
    server.ext({
        type: 'onPostStart',
        method: (server, next) => hapiPlugin.onServerStart(server, next)
    });
}

/**
 * HapiPlugin
 *
 */
export class HapiPlugin {

    /**
     *
     * @param {Logger} Logger
     * @constructor
     */
    constructor(Logger) {
        this._logger = Logger;
    }

    /**
     *
     * @param {Server} server
     * @param next
     */
    async onServerStart(server, next) {
        this._logger.info('server started:', server.info.uri);

        if (server.version < '17.0.0') {
            return next();
        }
    }

    /**
     *
     * @param {Server} server
     * @param {Object} event
     * @param {Array} tags
     */
    onServerLog(server, event, tags) {
        const data = event.error || event.data;
        const { severity, message } = processLogData(data, tags);
        this._logger[severity](message);
    }

    /**
     *
     * @param {Request} request
     * @param {Object} event
     * @param {Array} tags
     */
    onRequestLog(request, event, tags) {
        const data = event.error || event.data;
        const { severity, message } = processLogData(data, tags);
        this._logger[severity](message);
    }

    /**
     *
     * @param {Request} request
     * @param {error} err
     */
    onRequestError(request, err) {
        this._logger.error(err);
    }

    /**
     *
     * @param {Request} request
     * @param {Object} event
     * @param {Object} tags
     */
    onRequestInternal(request, event, tags) {
        // new request just received
        if (tags.received) {
            const method = request.method.toUpperCase();
            const proto = (request.headers['x-forwarded-proto'] || request.connection.info.protocol);
            const url = `${proto}://${request.info.host}${request.url.path}`;
            this._logger.debug(method, url);
        }
    }

}
