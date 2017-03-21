import sinon from 'sinon';
import assert from 'assert';
import Logger, {FACILITY_CODE, SEVERITY_CODE, SEVERITY_NAME} from '../../src/index';

/**
 * Tests Logger object itself
 */
describe('Logger', () => {

    beforeEach('cleanup adaptors', () => {
        Logger.clearAdapters();
        Logger.setParameters({'logger_level': 'debug'});
    });

    it('should correctly log with severity level and message', () => {
        const messages = [];
        Logger.addAdapter(Logger.Memory, messages);

        Logger.log(Logger.SEVERITY_CODE.DEBUG);
        Logger.emerg(Logger.SEVERITY_CODE.EMERGENCY);
        Logger.alert(Logger.SEVERITY_CODE.ALERT);
        Logger.critical(Logger.SEVERITY_CODE.CRITICAL);
        Logger.error(Logger.SEVERITY_CODE.ERROR);
        Logger.warning(Logger.SEVERITY_CODE.WARNING);
        Logger.notice(Logger.SEVERITY_CODE.NOTICE);
        Logger.info(Logger.SEVERITY_CODE.INFO);
        Logger.debug(Logger.SEVERITY_CODE.DEBUG);

        // 1 is severity position
        assert.equal(messages.length, 9);
        assert.equal(Logger.SEVERITY_CODE.DEBUG, messages[0][1]);
        assert.equal(Logger.SEVERITY_CODE.EMERGENCY, messages[1][1]);
        assert.equal(Logger.SEVERITY_CODE.ALERT, messages[2][1]);
        assert.equal(Logger.SEVERITY_CODE.CRITICAL, messages[3][1]);
        assert.equal(Logger.SEVERITY_CODE.ERROR, messages[4][1]);
        assert.equal(Logger.SEVERITY_CODE.WARNING, messages[5][1]);
        assert.equal(Logger.SEVERITY_CODE.NOTICE, messages[6][1]);
        assert.equal(Logger.SEVERITY_CODE.INFO, messages[7][1]);
        assert.equal(Logger.SEVERITY_CODE.DEBUG, messages[8][1]);

        // 5 is message position
        assert.equal(Logger.SEVERITY_CODE.DEBUG, messages[0][5]);
        assert.equal(Logger.SEVERITY_CODE.EMERGENCY, messages[1][5]);
        assert.equal(Logger.SEVERITY_CODE.ALERT, messages[2][5]);
        assert.equal(Logger.SEVERITY_CODE.CRITICAL, messages[3][5]);
        assert.equal(Logger.SEVERITY_CODE.ERROR, messages[4][5]);
        assert.equal(Logger.SEVERITY_CODE.WARNING, messages[5][5]);
        assert.equal(Logger.SEVERITY_CODE.NOTICE, messages[6][5]);
        assert.equal(Logger.SEVERITY_CODE.INFO, messages[7][5]);
        assert.equal(Logger.SEVERITY_CODE.DEBUG, messages[8][5]);
    });

    it('should correctly filter events with defined level', sinon.test(function () {
        const messages = [];
        Logger.setParameters({'logger_level': 'warning'});
        Logger.addAdapter(Logger.Memory, messages);

        // check adapter
        const adapterList = Logger.getAdapters();
        assert.equal(adapterList.length, 1);

        // write some events
        Logger.log('DEBUG level should not be logged');
        Logger.info('INFO level should not be logged');
        Logger.notice('NOTICE should not be logged');
        Logger.warning('WARNING level should be logged');
        Logger.error('ERROR level should be logged');
        Logger.critical('CRITICAL level should be logged');
        Logger.alert('ALERT level should be logged');
        Logger.emerg('EMERG level should be logged');

        // check events filtered
        assert.equal(messages.length, 5);
        assert.equal(messages[0][5], 'WARNING level should be logged');
        assert.equal(messages[1][5], 'ERROR level should be logged');
        assert.equal(messages[2][5], 'CRITICAL level should be logged');
        assert.equal(messages[3][5], 'ALERT level should be logged');
        assert.equal(messages[4][5], 'EMERG level should be logged');
    }));

    it('should correctly concatenate all arguments (strings)', sinon.test(function () {
        const messages = [];
        Logger.addAdapter(Logger.Memory, messages);

        Logger.log("Hello");
        Logger.log("Hello", "World");
        Logger.log("Hello", "World", "Logger");

        assert.equal(3, messages.length);
        assert.equal("Hello", messages[0][5]);
        assert.equal("Hello World", messages[1][5]);
        assert.equal("Hello World Logger", messages[2][5]);
    }));

    it('should correctly format objects', sinon.test(function () {
        const messages = [];
        Logger.addAdapter(Logger.Memory, messages);

        Logger.log({});
        Logger.log({a: "b"});
        Logger.log([]);
        Logger.log([1, 2]);

        assert.equal(messages.length, 4);
        assert.equal(messages[0][5], '{}');
        assert.equal(messages[1][5], '{ a: \'b\' }');
        assert.equal(messages[2][5], '[]');
        assert.equal(messages[3][5], '[ 1, 2 ]');
    }));

    it('should correctly concatenate all arguments (objects)', sinon.test(function () {
        const messages = [];
        Logger.addAdapter(Logger.Memory, messages);

        Logger.log({}, {});
        Logger.log([], []);
        Logger.log({a: "b"}, [1, 2]);

        assert.equal(messages.length, 3);
        assert.equal(messages[0][5], '{} {}');
        assert.equal(messages[1][5], '[] []');
        assert.equal(messages[2][5], '{ a: \'b\' } [ 1, 2 ]');
    }));

    it('should correctly set facility', sinon.test(function () {
        assert.doesNotThrow(function () {
            Logger.setParameters({'facility': FACILITY_CODE.KERNEL});

            const params = Logger.getParameters();
            assert.equal(params.facility, 0);
        });

        assert.doesNotThrow(function () {
            Logger.setParameters({'facility': FACILITY_CODE.LOCAL3});

            const params = Logger.getParameters();
            assert.equal(params.facility, 19);
        });

        assert.doesNotThrow(function () {
            Logger.setParameters({'facility': '19'});

            const params = Logger.getParameters();
            assert.equal(params.facility, 19);
        });

        assert.throws(function () {
            Logger.setParameters({'facility': 100});
        });

        assert.throws(function () {
            Logger.setParameters({'facility': 'Hello'});
        });
    }));

    it('should correctly set severity', sinon.test(function () {
        assert.doesNotThrow(function () {
            Logger.setParameters({'severity': SEVERITY_CODE.EMERGENCY});

            const params = Logger.getParameters();
            assert.equal(params.severity, 0);
        });

        assert.doesNotThrow(function () {
            Logger.setParameters({'severity': SEVERITY_CODE.INFO});

            const params = Logger.getParameters();
            assert.equal(params.severity, 6);
        });

        assert.doesNotThrow(function () {
            Logger.setParameters({'severity': '6'});

            const params = Logger.getParameters();
            assert.equal(params.severity, 6);
        });

        assert.throws(function () {
            Logger.setParameters({'severity': 10});
        });

        assert.throws(function () {
            Logger.setParameters({'severity': 'Hello'});
        });
    }));

    it('should accept only correct hostname', sinon.test(function () {
        assert.doesNotThrow(function () {
            Logger.setParameters({'hostname': '127.0.0.1'});
        });

        assert.doesNotThrow(function () {
            Logger.setParameters({'hostname': 'hostname'});
        });

        assert.doesNotThrow(function () {
            Logger.setParameters({'hostname': 'node1.local'});
        });

        assert.throws(function () {
            Logger.setParameters({'hostname': "> invalid"})
        });

        assert.throws(function () {
            const superLongLine = "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa";

            Logger.setParameters({'hostname': superLongLine});
        })
    }));

    it('should accept only correct application name', sinon.test(function () {
        assert.doesNotThrow(function () {
           Logger.setParameters({'app': 'worker-node1'});
        });

        assert.doesNotThrow(function () {
            Logger.setParameters({'app': '__1node1__'});
        });

        assert.throws(function () {
            Logger.setParameters({'app': '> invalid'});
        });

        assert.throws(function () {
            const superLongLine = "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa" +
                "aaaaaaaaaaaaaaaaaaaaaaaaaaa";

            Logger.setParameters({'app': superLongLine});
        })
    }));

    it('should accept only correct logger level', sinon.test(function () {
        assert.doesNotThrow(function () {
            Logger.setParameters({'logger_level': SEVERITY_NAME[SEVERITY_CODE.DEBUG]});

            const params = Logger.getParameters();
            assert.equal(params.logger_level, SEVERITY_NAME[SEVERITY_CODE.DEBUG]);
        });

        assert.doesNotThrow(function () {
            Logger.setParameters({'logger_level': SEVERITY_NAME[SEVERITY_CODE.EMERGENCY]});

            const params = Logger.getParameters();
            assert.equal(params.logger_level, SEVERITY_NAME[SEVERITY_CODE.EMERGENCY]);
        });

        assert.doesNotThrow(function () {
            Logger.setParameters({'logger_level': 'EMERG'});

            const params = Logger.getParameters();
            assert.equal(params.logger_level, SEVERITY_NAME[SEVERITY_CODE.EMERGENCY]);
        });

        assert.doesNotThrow(function () {
            Logger.setParameters({'logger_level': 'emerg'});

            const params = Logger.getParameters();
            assert.equal(params.logger_level, SEVERITY_NAME[SEVERITY_CODE.EMERGENCY]);
        });

        assert.throws(function () {
            Logger.setParameters({'logger_level': 'example'});
        });

        assert.throws(function () {
            Logger.setParameters({'logger_level': 'Hello'});
        })
    }));
});
