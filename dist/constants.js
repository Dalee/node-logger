"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 *
 *
 */
var FACILITY = exports.FACILITY = {
    0: "kernel messages",
    1: "user-level messages",
    2: "mail system",
    3: "system daemons",
    4: "security/authorization messages",
    5: "messages generated internally by syslogd",
    6: "line printer subsystem",
    7: "network news subsystem",
    8: "UUCP subsystem",
    9: "clock daemon",
    10: "security/authorization messages",
    11: "FTP daemon",
    12: "NTP subsystem",
    13: "log audit",
    14: "log alert",
    15: "clock daemon",
    16: "local use 0 (local0)",
    17: "local use 1 (local1)",
    18: "local use 2 (local2)",
    19: "local use 3 (local3)",
    20: "local use 4 (local4)",
    21: "local use 5 (local5)",
    22: "local use 6 (local6)",
    23: "local use 7 (local7)"
};

/**
 *
 *
 */
var FACILITY_CODE = exports.FACILITY_CODE = {
    KERNEL: 0,
    USER: 1,
    MAIL: 2,
    SYSTEM: 3,
    SECURITY0: 4,
    SECURITY: 4,
    SYSLOG: 5,
    PRINTER: 6,
    NEWS: 7,
    UUCP: 8,
    CLOCK0: 9,
    CLOCK: 9,
    SECURITY1: 10,
    FTP: 11,
    NTP: 12,
    AUDIT: 13,
    ALERT: 14,
    CLOCK1: 15,
    LOCAL0: 16,
    LOCAL1: 17,
    LOCAL2: 18,
    LOCAL3: 19,
    LOCAL4: 20,
    LOCAL5: 21,
    LOCAL6: 22,
    LOCAL7: 23
};

/**
 *
 *
 */
var SEVERITY = exports.SEVERITY = {
    0: "Emergency: system is unusable",
    1: "Alert: action must be taken immediately",
    2: "Critical: critical conditions",
    3: "Error: error conditions",
    4: "Warning: warning conditions",
    5: "Notice: normal but significant condition",
    6: "Informational: informational messages",
    7: "Debug: debug-level messages"
};

/**
 *
 *
 */
var SEVERITY_NAME = exports.SEVERITY_NAME = {
    0: "emerg",
    1: "alert",
    2: "critical",
    3: "error",
    4: "warning",
    5: "notice",
    6: "info",
    7: "debug"
};

/**
 *
 *
 */
var SEVERITY_CODE = exports.SEVERITY_CODE = {
    EMERGENCY: 0,
    ALERT: 1,
    CRITICAL: 2,
    ERROR: 3,
    WARNING: 4,
    NOTICE: 5,
    INFO: 6,
    DEBUG: 7
};