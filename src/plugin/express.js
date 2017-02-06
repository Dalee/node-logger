import {processLogData} from '../helpers';
import Syslog from '../adapter/syslog';
import Console from '../adapter/console';

/**
 *
 * @param {Object} Logger
 * @param {Object} options
 */
export default function (Logger, options) {
    Logger.setParameters(options);
    Logger.clearAdapters();
    Logger.addAdapter(Console, options.console || {});

    // if syslog object is provided, add syslog adapter
    if (options.syslog) {
        Logger.addAdapter(Syslog, options.syslog);
    }

    const expressLogger = new ExpressLogger(Logger);

    const middleware = (req, res, next) => expressLogger.middlewareLog(req, res, next);
    middleware.errorLogger = (err, req, res, next) => expressLogger.middlewareErrorLog(err, req, res, next);
    middleware.log = (...attr) => expressLogger.log(...attr);

    return middleware;
}

export class ExpressLogger {

    constructor(Logger) {
        this._logger = Logger;
    }

    log(tags, ...data) {
        if (typeof tags === 'string') {
            tags = [tags];
        }
        const {severity, message} = processLogData(data, tags);
        this._logger[severity](message);
    }

    onRequest(req) {
        const method = req.method.toUpperCase();
        const url = `${req.protocol}://${req.hostname}${req.path}`;
        this.log('debug', method, url);
    }

    middlewareLog(req, res, next) {
        req.log = (...args) => this.log(...args);
        this.onRequest(req);
        next();
    }

    middlewareErrorLog(err, req, res, next) {
        this.log('emerg', err);
        next(err);
    }
}
