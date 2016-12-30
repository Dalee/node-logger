import assert from 'assert';

import { SEVERITY_NAME } from '../../src/constants';
import Logger from '../../src/index';

describe('Constants', () => {

    it('Logger class should have all methods defined in SEVERITY_NAME', () => {
        const methodList = Object.values(SEVERITY_NAME);
        for (const methodName of methodList) {
            assert.equal(
                Logger.hasOwnProperty(methodName) && (typeof Logger[methodName]) === 'function',
                true,
                `Logger doesn't have method: ${methodName}`
            );
        }
    });

});
