'use strict';

function secondAction(uri, matches, options) {
    // no-op function to simply ensure we can have more than one custom action
    return xdmp.arrayValues([]);
}

module.exports = {
    secondAction
};