import sinon from 'sinon';
import assert from 'assert';

import Syslog from '../../../src/adapter/syslog';
import {SEVERITY_CODE, FACILITY_CODE} from '../../../src/constants';

const syslog = new Syslog();

describe('Syslog', () => {

    it('should correctly calculate priority', sinon.test(function () {
        let pri;

        pri = syslog.calculatePri(FACILITY_CODE.LOCAL4, SEVERITY_CODE.NOTICE);
        assert.equal(pri, 165);

        pri = syslog.calculatePri(FACILITY_CODE.KERNEL, SEVERITY_CODE.EMERGENCY);
        assert.equal(pri, 0);
    }));

    it('should correctly cleanup message', sinon.test(function () {
        const message = "\x12|this|is|sparta\x09\x01\x02";
        const cleared = syslog.cleanMessage(message);

        assert.equal(cleared, "|this|is|sparta");
    }));

    it('should correctly format syslog message (hostname and app)', sinon.test(function () {
        const messages = [];
        this.stub(syslog, "_write", (output) => {
            messages.push(output);
        });

        syslog.write(
            FACILITY_CODE.KERNEL,
            SEVERITY_CODE.EMERGENCY,
            'localhost',
            'app',
            '2016-12-01 23:23:23.4554',
            'syslog goes here'
        );

        assert.equal(messages.length, 1);
        assert.equal(messages[0], '<0>2016-12-01 23:23:23.4554 localhost app: syslog goes here');
    }));

    it('should correctly format syslog message (hostname only)', sinon.test(function () {
        const messages = [];
        this.stub(syslog, "_write", (output) => {
            messages.push(output);
        });

        syslog.write(
            FACILITY_CODE.KERNEL,
            SEVERITY_CODE.EMERGENCY,
            'localhost',
            '',
            '2016-12-01 23:23:23.4554',
            'syslog goes here'
        );

        assert.equal(messages.length, 1);
        assert.equal(messages[0], '<0>2016-12-01 23:23:23.4554 localhost syslog goes here');
    }));

    it('should correctly format syslog message (app only)', sinon.test(function () {
        const messages = [];
        this.stub(syslog, "_write", (output) => {
            messages.push(output);
        });

        syslog.write(
            FACILITY_CODE.KERNEL,
            SEVERITY_CODE.EMERGENCY,
            '',
            'app',
            '2016-12-01 23:23:23.4554',
            'syslog goes here'
        );

        assert.equal(messages.length, 1);
        assert.equal(messages[0], '<0>2016-12-01 23:23:23.4554 app: syslog goes here');
    }));

    it('should correctly format syslog message (no hostname, no app)', sinon.test(function () {
        const messages = [];
        this.stub(syslog, "_write", (output) => {
            messages.push(output);
        });

        syslog.write(
            FACILITY_CODE.KERNEL,
            SEVERITY_CODE.EMERGENCY,
            '',
            '',
            '2016-12-01 23:23:23.4554',
            'syslog goes here'
        );

        assert.equal(messages.length, 1);
        assert.equal(messages[0], "<0>2016-12-01 23:23:23.4554 syslog goes here");
    }));

    it('should not try to send any data if message is empty', sinon.test(function () {
        const messages = [];
        this.stub(syslog, "_write", (output) => {
            messages.push(output);
        });

        syslog.write(
            FACILITY_CODE.KERNEL,
            SEVERITY_CODE.EMERGENCY,
            'localhost',
            'app',
            '2016-12-01 23:23:23.4554',
            '\x01\x02'
        );

        assert.equal(messages.length, 0);
    }));
});
