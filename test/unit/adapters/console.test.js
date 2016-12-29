import sinon from 'sinon';
import assert from 'assert';
import os from 'os';

import Console from '../../../src/adapter/console';
import {SEVERITY_CODE, FACILITY_CODE} from '../../../src/constants';

describe('console', () => {

    it('should write correct message to console', sinon.test(function () {
        const console = new Console();
        const messages = [];

        this.stub(console, "_write", (output) => {
            messages.push(output);
        });

        console.write(
            FACILITY_CODE.LOCAL0,
            SEVERITY_CODE.DEBUG,
            'localhost',
            'logger',
            '2016-11-26 13:52:45.2342',
            "Hello world"
        );

        assert.equal(messages.length, 1);
        assert.equal(messages[0], "[2016-11-26 13:52:45.2342] debug: Hello world" + os.EOL);
    }));

});
