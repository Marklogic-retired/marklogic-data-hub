'use strict';

const core = require('/data-hub/5/mapping-functions/core.sjs');

function customDateTime(value, pattern) {
  return core.parseDateTime(value, pattern);
}

module.exports = {
  customDateTime: customDateTime
};
