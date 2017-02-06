import assert from 'assert';
import * as helpers from '../../src/helpers';

describe('Helpers', () => {
    it('should get correct severity level from hapi tags (array)', () => {
        assert.equal(helpers.severityFromTags('debug', ['error']), 'error');
        assert.equal(helpers.severityFromTags('debug', ['database-error']), 'debug');
    });

    it('should get correct severity level from hapi tags (object)', () => {
        assert.equal(helpers.severityFromTags('debug', {'error': true}), 'error');
        assert.equal(helpers.severityFromTags('debug', {'database-error': true}), 'debug');
    });

    it('should correctly format tags for logging (array)', () => {
        assert.equal(helpers.formatTags('debug', ['error']), '[error]');
        assert.equal(helpers.formatTags('error', ['error']), '');
        assert.equal(helpers.formatTags('error', ['error', 'database-error']), '[database-error]');
        assert.equal(helpers.formatTags('debug', ['error', 'database-error']), '[error, database-error]');
    });

    it('should correctly format tags for logging (object)', () => {``
        assert.equal(helpers.formatTags('debug', {error: true}), '[error]');
        assert.equal(helpers.formatTags('error', {error: true}), '');
        assert.equal(
            helpers.formatTags('error', {'error': true, 'database-error': true}),
            '[database-error]'
        );

        assert.equal(
            helpers.formatTags('debug', {'error': true, 'database-error': true}),
            '[error, database-error]'
        );
    });


    it('should correctly format data for logging (array)', () => {
        assert.equal(
            helpers.formatMessage('debug', ['hello', 'world'], []),
            'hello world'
        );
    });

    it('should correctly format data for logging (array with format string)', () => {
        assert.equal(
            helpers.formatMessage('debug', ['%s, %s', 'hello', 'world'], []),
            'hello, world'
        );
    });

    it('should correctly format data for logging (no error)', () => {
        assert.equal(
            helpers.formatMessage('debug', '', ['database-error']),
            '[database-error] '
        );

        assert.equal(
            helpers.formatMessage('debug', 'hello', ['error', 'database-error']),
            '[error, database-error] hello'
        );
    });

    it('should correctly format data for logging (error)', () => {
        const err = new Error('hello');
        let result;

        result = helpers.formatMessage('error', err, []);
        assert.equal(result.substring(0, 12), 'Error: hello');

        result = helpers.formatMessage('error', err, ['database-error']);
        assert.equal(result.substring(0, 29), '[database-error] Error: hello');
    });
});
