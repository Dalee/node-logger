import assert from 'assert';
import { HapiPlugin } from '../../../src/plugin/hapi-17';

// small hacky way to mock Logger
function getPluginInstance() {
    const logger = {
        'messageList': [],
        'loggerFunc': function (...args) {
            this.messageList.push(args);
        },
        'emerg': function (...args) {
            this.loggerFunc(...args);
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


describe('Hapi-17Plugin', () => {

    it('onServerStart', done => {
        const hapiPlugin = getPluginInstance();
        hapiPlugin.onServerStart({ version: '17.0.0', info: { uri: 'http://server:3000' } }).then(done);

        assert.equal(hapiPlugin._logger.messageList.length, 1);
        assert.deepEqual(hapiPlugin._logger.messageList[0], ['server started:', 'http://server:3000']);
    });

    it('onServerLog', () => {
        const hapiPlugin = getPluginInstance();
        hapiPlugin.onServerLog({}, { data: 'hello' }, ['error', 'database-error']);

        assert.equal(hapiPlugin._logger.messageList.length, 1);
        assert.deepEqual(hapiPlugin._logger.messageList[0], ['[database-error] hello']);
    });

    it('onRequestLog', () => {
        const hapiPlugin = getPluginInstance();
        hapiPlugin.onRequestLog({}, { data: 'hello' }, ['error', 'database-error']);

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
            headers: { 'x-forwarded-proto': 'https' },
            info: { host: 'localhost' },
            url: { path: '/hello/world' }
        }, {}, { received: true });

        assert.equal(hapiPlugin._logger.messageList.length, 1);
        assert.deepEqual(hapiPlugin._logger.messageList[0], ['GET', 'https://localhost/hello/world']);
    });

});
