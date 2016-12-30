import assert from 'assert';
import {HapiPlugin} from '../../../src/plugin/hapi';

// small hacky way to mock Logger
function getPluginInstance() {
    const logger = {
        'messageList': [],
        'loggerFunc': function (...args) {
            this.messageList.push(args);
        },
        'emerg': (...args) => {
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

    return new HapiPlugin(logger);
}


describe('HapiPlugin', () => {

    it('should get correct severity level from hapi tags (array)', () => {
        const hapiPlugin = getPluginInstance();

        assert.equal(hapiPlugin._severityFromTags('debug', ['error']), 'error');
        assert.equal(hapiPlugin._severityFromTags('debug', ['database-error']), 'debug');
    });

    it('should get correct severity level from hapi tags (object)', () => {
        const hapiPlugin = getPluginInstance();

        assert.equal(hapiPlugin._severityFromTags('debug', {'error': true}), 'error');
        assert.equal(hapiPlugin._severityFromTags('debug', {'database-error': true}), 'debug');
    });

    it('should correctly format tags for logging (array)', () => {
        const hapiPlugin = getPluginInstance();

        assert.equal(hapiPlugin._formatTags('debug', ['error']), '[error]');
        assert.equal(hapiPlugin._formatTags('error', ['error']), '');
        assert.equal(hapiPlugin._formatTags('error', ['error', 'database-error']), '[database-error]');
        assert.equal(hapiPlugin._formatTags('debug', ['error', 'database-error']), '[error, database-error]');
    });

    it('should correctly format tags for logging (object)', () => {
        const hapiPlugin = getPluginInstance();

        assert.equal(hapiPlugin._formatTags('debug', {error: true}), '[error]');
        assert.equal(hapiPlugin._formatTags('error', {error: true}), '');
        assert.equal(
            hapiPlugin._formatTags('error', {'error': true, 'database-error': true}),
            '[database-error]'
        );

        assert.equal(
            hapiPlugin._formatTags('debug', {'error': true, 'database-error': true}),
            '[error, database-error]'
        );
    });

    it('should correctly format data for logging (no error)', () => {
        const hapiPlugin = getPluginInstance();

        assert.equal(
            hapiPlugin._formatData('debug', {}, ['database-error']),
            '[database-error] '
        );

        assert.equal(
            hapiPlugin._formatData('debug', {data: 'hello'}, ['error', 'database-error']),
            '[error, database-error] hello'
        );
    });

    it('should correctly format data for logging (error)', () => {
        const hapiPlugin = getPluginInstance();
        const err = new Error('hello');
        let result;

        result = hapiPlugin._formatData('error', {data: err}, []);
        assert.equal(result.substring(0, 12), 'Error: hello');

        result = hapiPlugin._formatData('error', {data: err}, ['database-error']);
        assert.equal(result.substring(0, 29), '[database-error] Error: hello');
    });

    it('onServerStart', () => {
        const hapiPlugin = getPluginInstance();
        hapiPlugin.onServerStart({info: {uri: 'http://server:3000'}});

        assert.equal(hapiPlugin._logger.messageList.length, 1);
        assert.deepEqual(hapiPlugin._logger.messageList[0], ['server started:', 'http://server:3000']);
    });

    it('onServerLog', () => {
        const hapiPlugin = getPluginInstance();
        hapiPlugin.onServerLog({}, {data: 'hello'}, ['error', 'database-error']);

        assert.equal(hapiPlugin._logger.messageList.length, 1);
        assert.deepEqual(hapiPlugin._logger.messageList[0], ['[database-error] hello']);
    });

    it('onRequestLog', () => {
        const hapiPlugin = getPluginInstance();
        hapiPlugin.onRequestLog({}, {data: 'hello'}, ['error', 'database-error']);

        assert.equal(hapiPlugin._logger.messageList.length, 1);
        assert.deepEqual(hapiPlugin._logger.messageList[0], ['[database-error] hello']);
    });

    it('onRequestError', () => {
        const hapiPlugin = getPluginInstance();
        hapiPlugin.onRequestError({}, 'error');

        assert.equal(hapiPlugin._logger.messageList.length, 1);
        assert.deepEqual(hapiPlugin._logger.messageList[0], ['error']);
    });

    it('onRequestInternal', () => {
        const hapiPlugin = getPluginInstance();

        hapiPlugin.onRequestInternal({
            method: 'get',
            headers: {'x-forwarded-proto': 'https'},
            info: {host: 'localhost'},
            url: {path: '/hello/world'}
        }, {}, {received: true});

        assert.equal(hapiPlugin._logger.messageList.length, 1);
        assert.deepEqual(hapiPlugin._logger.messageList[0], ['GET', 'https://localhost/hello/world']);
    });

});
