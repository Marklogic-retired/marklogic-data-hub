'use strict';
let Storage = require('./StorageService');

/**
 * Returns all flows
 * Returns all flows
 *
 * returns List
 **/
exports.getFlows = function() {
  return Storage.getCollection('flows');
}


/**
 * Find flow by Id
 * ....
 *
 * flowId String Id of flow to be fetched
 * returns flow
 **/
exports.getFlow = function(flowId) {
  let resp;
  if (flowId) {
    resp = Storage.get('flows', flowId);
  } else {
    resp = new Promise((resolve, reject) => {
      reject({ error: `'flowId' does not exist` });
    });
  }
  return resp;
}


/**
 * Create flow
 * 
 *
 * body Flow Flow to create
 * returns flow
 **/
exports.createFlow = function(body) {
  let resp;
  if (body) {
    body.id = Storage.uuid();
    resp = Storage.save('flows', body.id, body);
  } else {
    resp = new Promise((resolve, reject) => {
      reject({ error: `POST body does not exist` });
    });
  }
  return resp;
}


/**
 * Delete flow by Id
 * 
 *
 * flowId String Id of flow to be fetched
 * no response value expected for this operation
 **/
exports.deleteFlow = function(flowId) {
  let resp;
  if (flowId) {
    // TODO: delete all steps associated with flow (needed for a mock?)
    resp = Storage.delete('flows', flowId);
  } else {
    resp = new Promise((resolve, reject) => {
      reject({ error: `'flowId' does not exist` });
    });
  }
  return resp;
}


/**
 * Update flow by Id
 * 
 *
 * flowId String Id of flow to be updated
 * body Flow Updated flow
 * no response value expected for this operation
 **/
exports.updateFlow = function(flowId, body) {
  let resp;
  if (flowId && body) {
    resp = Storage.save('flows', flowId, body);
  } else {
    resp = new Promise((resolve, reject) => {
      reject({ error: `POST body or 'flowId' does not exist` });
    });
  }
  return resp;
}


/**
 * Run a Flow
 * 
 *
 * flowId String Id of flow to run
 * returns step
 **/
exports.runFlow = function(flowId) {
  let resp;
  if (flowId) {
    resp = new Promise((resolve) => {
      resolve({ "data": "success" });
    });
  } else {
    resp = new Promise((resolve, reject) => {
      reject({ error: `'flowId' does not exist` });
    });
  }
  return resp;
}

