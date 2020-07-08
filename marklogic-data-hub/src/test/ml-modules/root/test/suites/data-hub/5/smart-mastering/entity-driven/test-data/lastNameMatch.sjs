'use strict';

function isIterable(obj) {
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

function wildcard(str) {
  return fn.string(str).replace(/[aeiouy]+/ig, '*');
}

function getLastName(str) {
    let parts = fn.string(str).split(' ').filter((val) => !!val);
    return parts[parts.length - 1];
}

function customLastName(values, matchRule, options) {
    let lastNameMatches = [];
    let fullNameMatches = [];
    if (isIterable(values)) {
        for (const value of values) {
            const wildcardValue = wildcard(value);
            lastNameMatches.push(getLastName(wildcardValue));
            fullNameMatches.push(wildcardValue);
        }
    } else {
        const wildcardValue = wildcard(values);
        lastNameMatches.push(getLastName(wildcardValue));
        fullNameMatches.push(wildcardValue);
    }
    return cts.andNotQuery(cts.wordQuery(lastNameMatches, ['wildcarded']), cts.wordQuery(fullNameMatches, ['wildcarded']));
}

module.exports = {
    customLastName
};