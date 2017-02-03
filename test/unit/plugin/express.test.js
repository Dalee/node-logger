import assert from 'assert';
import {ExpressLogger} from '../../../src/plugin/express';

// small hacky way to mock Logger
function getLoggerInstance() {
    const logger = {
        'messageList': [],
        'loggerFunc': function (...args) {
            this.messageList.push(args);
        },
        'emerg': function (...args) {
            this.loggerFunc(...args)
        },
        'alert': function (...args) {
            this.loggerFunc(...args);
        },
        'critical': function (...args) {
            this.loggerFunc(...args);
        },
        'error': function (...args) {
            this.loggerFunc(...args);
        },
        'warning': function (...args) {
            this.loggerFunc(...args);
        },
        'notice': function (...args) {
            this.loggerFunc(...args);
        },
        'info': function (...args) {
            this.loggerFunc(...args);
        },
        'debug': function (...args) {
            this.loggerFunc(...args);
        },
        'log': function (...args) {
            this.loggerFunc(...args);
        },
    };

    return new ExpressLogger(logger);
}


describe('ExpressLogger', () => {

    it('should log message', () => {
        const expressLogger = getLoggerInstance();
        expressLogger.log(['info', 'message', 'log'], 'hello', 'world');

        assert.equal(expressLogger._logger.messageList.length, 1);
        assert.deepEqual(expressLogger._logger.messageList[0], ['[message, log] hello world']);
    });

    it('should log incoming request', () => {
        const expressLogger = getLoggerInstance();

        expressLogger.onRequest({
            method: 'get',
            protocol: 'https',
            hostname: 'localhost',
            path: '/hello/world'
        });

        assert.equal(expressLogger._logger.messageList.length, 1);
        assert.deepEqual(expressLogger._logger.messageList[0], ['GET https://localhost/hello/world']);
    });
});

describe('ExpressLogger middleware', () => {

    it('should provide log method', () => {
        const expressLogger = getLoggerInstance();
        const req = {
            method: 'get',
            protocol: 'https',
            hostname: 'localhost',
            path: '/hello/world'
        };
        expressLogger.middlewareLog(req, {}, () => {});
        assert.doesNotThrow(() => {
            req.log('debug', 'hello');
        })
        assert.equal(expressLogger._logger.messageList.length, 2);
        assert.deepEqual(expressLogger._logger.messageList[0], ['GET https://localhost/hello/world']);
        assert.deepEqual(expressLogger._logger.messageList[1], ['hello']);
    });

    it('should log request errors', () => {
        const expressLogger = getLoggerInstance();

        expressLogger.middlewareErrorLog('some error', {}, {}, () => {});

        assert.equal(expressLogger._logger.messageList.length, 1);
        assert.deepEqual(expressLogger._logger.messageList[0], ['some error']);
    });

});
