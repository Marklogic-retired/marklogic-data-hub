
'use strict';

/**
 * Return an Error JSON object
 * ....
 *
 * jobId String Id of Job to be fetched
 * returns flow
 **/
exports.create = function(code, message) {
  return {
    code,
    message,
    timestamp: (new Date()).toISOString()
  };
}
