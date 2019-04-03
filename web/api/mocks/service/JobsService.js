'use strict';
let Storage = require('./StorageService');
let Error = require('./ErrorService');

/**
 * Find Job by Id
 * ....
 *
 * jobId String Id of Job to be fetched
 * returns flow
 **/
exports.getJob = function(jobId) {
  let resp;
  if (jobId) {
    resp = Storage.get('jobs', jobId);
  } else {
    resp = new Promise((resolve, reject) => {
      reject(Error.create(400, `Bad Request: 'jobId' required`));
    });
  }
  return resp;
}
