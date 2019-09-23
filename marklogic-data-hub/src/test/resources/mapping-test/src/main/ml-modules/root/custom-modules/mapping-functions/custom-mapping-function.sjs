'use strict';

const core = require('/data-hub/5/mapping-functions/core.sjs');

function customDateTime(picture, value) {
  return core.parseDateTime(picture, value);
}

module.exports = {
  customDateTime: customDateTime
};
