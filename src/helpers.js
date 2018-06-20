import { SEVERITY_NAME } from './constants';
import _ from 'lodash';
import util from 'util';

const severityMethods = Object.values(SEVERITY_NAME);

/**
 * Returns severity and message data from logged data and tags
 *
 * @param {*} data - logged data
 * @param {Array} tags - logging tags
 * @returns {{severity: string, message:string}}
 */
export function processLogData(data, tags) {
    const severity = severityFromTags('debug', tags);
    const message = formatMessage(severity, data, tags);
    return { severity, message };
}

/**
 *
 * @param {string} severity
 * @param {*} data
 * @param {Array|Object} tags
 * @returns {string}
 * @private
 */
export function formatMessage(severity, data, tags) {
    const tagsPayload = formatTags(severity, tags);

    const message = [];
    if (tagsPayload.length > 0) {
        message.push(tagsPayload);
    }

    // format data correctly, include stack to result
    switch (true) {
        case data instanceof Error:
            message.push(data.stack);
            break;
        case typeof data === "string":
            message.push(data);
            break;
        default:
            message.push(util.format(...data));
            break;
    }

    return message.join(' ');
}

/**
 *
 * @param {string} defaultLevel
 * @param {Array|Object} tags
 * @returns {string}
 * @private
 */
export function severityFromTags(defaultLevel, tags) {
    let tagList = tags;
    if ((tagList instanceof Array) === false) {
        tagList = Object.keys(tagList);
    }

    const result = _.find(tagList, key => severityMethods.includes(key));

    return result || defaultLevel;
}

/**
 *
 * @param {string} severity
 * @param {Array|Object} tags
 * @returns {string}
 * @private
 */
export function formatTags(severity, tags) {
    let tagList = tags;
    if ((tagList instanceof Array) === false) {
        tagList = Object.keys(tagList);
    }

    tagList = _.filter(tagList, key => key !== severity);

    return tagList.length > 0
        ? util.format('[%s]', tagList.join(', '))
        : '';
}
