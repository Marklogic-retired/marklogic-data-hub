'use strict';

function main(content, options) {
    if (options.customValue !== "exists") {
        fn.error(null, "OPTIONS-MISSING-VALUE", [options]);
    }
    const valueObj = content.value.toObject();
    valueObj.processed = true;
    content.value = valueObj;
    return content;
}

module.exports = {
    main
};