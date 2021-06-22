'use strict';
const test = require('/test/test-helper.xqy');

function weOnlyLikeVirginia(
    propertyName,
    allProperties,
    mergeRule
) {
    let results = [];
    for (let property of allProperties) {
        if (fn.exists(property.values.xpath('Address[state = "Virginia"]'))) {
            results.push(property);
        }
    }
    return results;
}

module.exports = {
    weOnlyLikeVirginia
};