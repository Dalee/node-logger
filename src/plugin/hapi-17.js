import Syslog from '../adapter/syslog';
import Console from '../adapter/console';
import HapiPlugin from './hapi-plugin.js';

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
    server.events.on('log', (...args) => {
        hapiPlugin.onServerLog(server, ...args);
    });

    //
    // logging requested via `request.log`
    // possible calls:
    //  - `request.log('error', data);`
    //  - `request.log(['error', 'database'], data);`
    //
    server.events.on('request', (...args) => {
        hapiPlugin.onRequestLog(...args);
    });

    //
    // error during route handler processing
    //
    server.events.on({ name: 'request', channels: 'error' }, (...args) => {
        hapiPlugin.onRequestError(...args);
    });

    //
    // internal hapi event related to request
    // currently we only interested in received sub-event
    // to render request before any processing will start
    //
    server.events.on({ name: 'request', channels: 'internal' }, (...args) => {
        hapiPlugin.onRequestInternal(...args);
    });

    //
    // just handler to notify that server is started
    //
    server.ext({
        type: 'onPostStart',
        method: (server) => hapiPlugin.onServerStart(server)
    });
}

module.exports.HapiPlugin = HapiPlugin;
