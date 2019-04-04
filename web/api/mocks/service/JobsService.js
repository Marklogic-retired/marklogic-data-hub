'use strict';
let Storage = require('./StorageService');
let Error = require('./ErrorService');

/**
 * Find Job by Id
 * ....
 *
 * jobId String Id of Job to be fetched
 * returns job
 **/
exports.getJob = function(jobId) {
  let resp;
  if (jobId) {
    resp = Storage.get('job-detail', jobId);
  } else {
    resp = new Promise((resolve, reject) => {
      reject(Error.create(400, `Bad Request: 'jobId' required`));
    });
  }
  return resp;
}

/**
 * Find all Jobs
 * ....
 *
 * jobId String Id of Job to be fetched
 * returns array of jobs
 **/
exports.getJobs = function() {
  return Storage.getCollection('job-all');
}


/**
 * Delete a Job
 * ....
 *
 * jobId String Id of Job to be fetched
 * returns job that is deleted
 **/
exports.deleteJob = function(jobId) {
  let resp;
  if (jobId) {
    Storage.delete('job-all', jobId);
    Storage.delete('job-detail', jobId);
    resp = new Promise((resolve, reject) => {
      resolve({200: 'success'});
    });
  } else {
    resp = new Promise((resolve, reject) => {
      reject(Error.create(400, `Bad Request: 'jobId' required`));
    });
  }
  return resp;
}
