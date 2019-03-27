'use strict';
let Storage = require('./StorageService');
const _ = require('lodash');

/**
 * Create a step within a Flow
 * 
 *
 * flowId String Id of flow
 * body Step Step to create
 * returns step
 **/
exports.createFlowStep = function(flowId, stepIndex, body) {
  return new Promise(async (resolve, reject) => {
    const index = parseInt(stepIndex);
    if (flowId && body) {
      let flow = await Storage.get('flows', flowId);
      if (flow) {
        body.id = Storage.uuid();
        let step = await Storage.save('steps', body.id, body);
        flow.steps = flow.steps || [];
        const newFlowStep = { 
          id: step.id,
          type: step.type,
          name: step.name,
          targetEntity: step.config && step.config.targetEntity || null 
        };
        flow.steps.splice(index, 0, newFlowStep);
        await Storage.save('flows', flowId, flow);
        resolve(flow);
      } else {
        reject({ error: `'${flowId}' does not exist` });
      }
    } else {
      reject({ error: `POST body or 'flowId' does not exist` });
    }
  });
}


/**
 * Delete step by Id
 * 
 *
 * flowId String Id of flow to be fetched
 * stepId String Id of step to be fetched
 * no response value expected for this operation
 **/
exports.deleteFlowStep = function(flowId, stepId) {
  return new Promise(async (resolve, reject) => {
    if (flowId && stepId) {
      let flow = await Storage.get('flows', flowId);
      if (flow) {
        await Storage.delete('steps', stepId);
        _.remove(flow.steps, function(s) {
          return s.id === stepId;
        });
        await Storage.save('flows', flowId, flow);
        resolve(flow);
      } else {
        reject({ error: `'${flowId}' does not exist` });
      }
    } else {
      reject({ error: `'flowId' or 'stepId' does not exist` });
    }
  });
}


/**
 * Get all Steps for a Flow
 * ....
 *
 * flowId String Id of flow to be fetched
 * returns List
 **/
exports.getFlowSteps = function(flowId) {
  return new Promise(async (resolve, reject) => {
    if (flowId) {
      let flow = await Storage.get('flows', flowId);
      if (flow) {
        let stepIds = flow && flow.steps && _.map(flow.steps, 'id') || [];
        let steps = await Storage.getCollection('steps');
        let stepsResp = []; // Array of Step objects
        _.forEach(steps, (step) => {
          if (stepIds.includes(step.id))
            stepsResp.push(step);
        });
        resolve(stepsResp);
      } else {
        reject({ error: `'${flowId}' does not exist` });
      }
    } else {
      reject({ error: `'flowId' does not exist` });
    }
  });
}


/**
 * Update step by Id
 * 
 *
 * flowId String Id of flow to be updated
 * stepId String Id of step to be updated
 * body Step Updated step
 * no response value expected for this operation
 **/
exports.updateFlowStep = function(flowId, stepId, body) {
  return new Promise(async (resolve, reject) => {
    if (flowId && stepId && body) {
      let flow = await Storage.get('flows', flowId);
      if (flow) {
        let step = await Storage.save('steps', stepId, body);
        let stepIndex = _.findIndex(flow.steps, ['id', step.id]);
        flow.steps[stepIndex] = { id: step.id, type: step.type, name: step.name, targetEntity: step.config && step.config.targetEntity || null }; // adds step id to steps Array, appended to the end
        await Storage.save('flows', flowId, flow);
        resolve(step);
      } else {
        reject({ error: `'${flowId}' does not exist` });
      }
    } else {
      reject({ error: `POST body, 'flowId' or 'stepId' does not exist` });
    }
  });
}

