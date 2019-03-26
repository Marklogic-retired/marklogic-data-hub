'use strict';
let Storage = require('./StorageService');
let Error = require('./ErrorService');
const _ = require('lodash');

/**
 * Create a step within a Flow
 * 
 *
 * flowId String Id of flow
 * body Step Step to create
 * returns step
 **/
exports.createFlowStep = function(flowId, stepOrder, body) {
  return new Promise(async (resolve, reject) => {
    const index = parseInt(stepOrder);
    if (flowId && body && Object.keys(body).length > 0) {
      let flow = await Storage.get('flows', flowId);
      if (flow) {
        body.id = Storage.uuid();
        let step = await Storage.save('steps', body.id, body);
        flow.steps = flow.steps || [];
        const newFlowStep = { 
          id: step.id,
          name: step.name,
          type: step.type,
          name: step.name,
          targetEntity: step.config && step.config.targetEntity || null 
        };
        if(index === flow.steps.length){
          flow.steps.push(newFlowStep);
        } else {
          flow.steps.splice(index, 0, newFlowStep);
        }
        
        await Storage.save('flows', flowId, flow);
        resolve(step);
      } else {
        reject(Error.create(404, `Not Found: '${flowId}' does not exist`));
      }
    } else {
      reject(Error.create(400, `Bad Request: POST body and 'flowId' required`));
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
        resolve({200: 'Success'});
      } else {
        reject(Error.create(404, `Not Found: '${flowId}' does not exist`));
      }
    } else {
      reject(Error.create(400, `Bad Request: 'flowId' and 'stepId' required`));
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
        let stepsResp = []; // Array of Step objects
        _.forEach(stepIds, async (stepId) => {
          let step = await Storage.get('steps', stepId);
          if (step)
            stepsResp.push(step);
        });
        resolve(stepsResp);
      } else {
        reject(Error.create(404, `Not Found: '${flowId}' does not exist`));
      }
    } else {
      reject(Error.create(400, `Bad Request: 'flowId' required`));
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
    if (flowId && stepId && body && Object.keys(body).length > 0) {
      let flow = await Storage.get('flows', flowId);
      if (flow) {
        let step = await Storage.save('steps', stepId, body);
        let stepIndex = _.findIndex(flow.steps, ['id', step.id]);
        flow.steps[stepIndex] = { id: step.id, name: step.name, type: step.type, targetEntity: step.config && step.config.targetEntity || null }; // adds step id to steps Array, appended to the end
        await Storage.save('flows', flowId, flow);
        resolve(step);
      } else {
        reject(Error.create(404, `Not Found: '${flowId}' does not exist`));
      }
    } else {
      reject(Error.create(400, `Bad Request: POST body, 'flowId' and 'stepId' required`));
    }
  });
}

