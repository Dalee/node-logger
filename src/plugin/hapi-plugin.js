import { processLogData } from '../helpers';

/**
 * HapiPlugin
 *
 */
export default class HapiPlugin {

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
