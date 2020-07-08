'use strict';

function isIterable(obj) {
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

function getLastName(str) {
    let parts = String(str).split(' ').filter((val) => !!val);
    return parts[parts.length - 1].replace(/[aeiouy]+/ig, '*');
}

function customLastName(values, matchRule, options) {
    let changedValues = [];
    if (isIterable(values)) {
        for (const value of values) {
            changedValues.push(getLastName(value));
        }
    } else {
        changedValues.push(getLastName(values));
    }
    return cts.wordQuery(changedValues, ['wildcarded']);
}

module.exports = {
    customLastName
};