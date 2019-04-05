'use strict';
let Storage = require('./StorageService');
let Error = require('./ErrorService');
let runningFlowInterval  // interval for running flows

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
      reject(Error.create(400, `Bad Request: 'flowId' required`));
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
  if (body && Object.keys(body).length > 0) {
    body.id = Storage.uuid();
    resp = Storage.save('flows', body.id, body);
  } else {
    resp = new Promise((resolve, reject) => {
      reject(Error.create(400, `Bad Request: POST body required`));
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
      reject(Error.create(400, `Bad Request: 'flowId' required`));
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
  if (flowId && body && Object.keys(body).length > 0) {
    resp = Storage.save('flows', flowId, body);
  } else {
    resp = new Promise((resolve, reject) => {
      reject(Error.create(400, `Bad Request: POST body and 'flowId' required`));
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
exports.runFlow = function(flowId, body) {
  // if body exists, then it will be an Array of step IDs to run
  return new Promise(async (resolve, reject) => {
    if (flowId) {
      let currentFlow = await Storage.get('flows', flowId);
      if (currentFlow.latestJob && (!currentFlow.latestJob || currentFlow.latestJob.stepRunningPercent === null)) {
        let fromBody = (body && Object.keys(body).length > 0);
        let steps = (fromBody) ? body : currentFlow.steps;
        let stepId = fromBody ? steps[0] : steps[0].id;
        let step = await Storage.get('steps', stepId); 
        let newJobId = Storage.uuid();
        // Create new job 
        let newJob = await Storage.save('jobs', newJobId, {
          jobId: newJobId,
          flowId: flowId,
          flow: "Order Flow 01",
          targetEntity: "Order",
          user: "admin",
          lastAttemptedStep: 3,
          lastCompletedStep: 3,
          status: "completed",
          startTime: "2019-03-20T09:54:31.330356-07:00",
          endTime: "2019-03-20T10:54:35.385579-07:00",
          successfulEvents: 100,
          failedEvents: 3,
          steps: [
            {
              stepNumber: 1,
              type: "ingest",
              name: "default-ingest",
              stepName: "Flow 01 Ingest Step",
              identifier: null,
              retryLimit: 0,
              options: {
                outputFormat: "json",
                collections: "defaultIngest"
              },
              status: "finished-with-errors",
              startTime: "2019-03-20T09:54:31.330356-07:00",
              endTime: "2019-03-20T10:10:05.123456-07:00",
              successfulEvents: 13429,
              failedEvents: 100
            },
            {
              stepNumber: 2,
              type: "mapping",
              name: "default-mapping",
              stepName: "Flow 01 Mapping Step",
              identifier: null,
              retryLimit: 0,
              options: {
                outputFormat: "json",
                collections: "Flow 01 Ingest Step",
                targetEntity: "Order"
              },
              status: "failed",
              startTime: "2019-03-20T10:10:05.123456-07:00",
              endTime: "2019-03-20T10:54:35.385579-07:00",
              successfulEvents: 286,
              failedEvents: 3
            },
            {
              stepNumber: 3,
              type: "mastering",
              name: "default-mastering",
              stepName: "Flow 01 Mastering Step",
              identifier: null,
              retryLimit: 0,
              options: {
                outputFormat: "json",
                collections: "Flow 01 Mapping Step",
                targetEntity: "Order"
              },
              status: null,
              startTime: null,
              endTime: null,
              successfulEvents: null,
              failedEvents: null
            }
          ]
        });

        let currentJob = {
          id: newJobId,
          stepId: step && step.id || null,
          stepName: step && step.name || null,
          stepRunningPercent: 0,
          startTime: (new Date()).toISOString(),
          status: 'running'       
        }
        currentFlow.latestJob = currentJob;
        await Storage.save('flows', currentFlow.id, currentFlow);
        await Storage.save('jobs', newJobId, newJob);
        // Add 10 percent every 1 second
        runningFlowInterval = setInterval( function() { updateProgress(); }, 750 );
        let stepCount = steps.length;
        let stepIndex = 0;
        async function updateProgress() {
          if (currentJob.stepRunningPercent >= 100) {
            stepIndex++;
            if (stepIndex === stepCount) {
              clearInterval(runningFlowInterval);
              runningFlowInterval = null;
              currentJob.status = 'completed';
              currentJob.endTime = (new Date()).toISOString();
              currentJob.stepId = null;
              currentJob.stepName = null;
              currentJob.stepRunningPercent = null;
              currentFlow.latestJob = currentJob;
            } else {
              // move to the next step
              let nextStepId = typeof steps[stepIndex] === 'object' ? steps[stepIndex].id : steps[stepIndex];
              let nextStep = await Storage.get('steps', nextStepId); 
              if (nextStep) {
                currentJob.stepId = nextStep && nextStep.id;
                currentJob.stepName = nextStep && nextStep.name;
                currentJob.stepRunningPercent = 0;
                currentFlow.latestJob = currentJob;
              } else {
                currentJob.stepRunningPercent = 100;  // skip to next step, the passed array had a bad step ID
                currentFlow.latestJob = currentJob;
              }
            }
          } else {
            currentFlow.latestJob.stepRunningPercent += 10;
            currentJob.stepRunningPercent += 10;
          }
          Storage.save('flows', currentFlow.id, currentFlow);
        }
        // return flow with new latestJob info
        resolve(currentFlow);
      }
      reject(Error.create(400, `Bad Request: '${flowId}' is already running`));
    } else {
      reject(Error.create(400, `Bad Request: 'flowId' required`));
    }
  });

}

/**
 * Stop a Flow
 * 
 *
 * flowId String Id of flow to run
 * returns step
 **/
exports.stopFlow = function(flowId) {
  return new Promise(async (resolve, reject) => {
    if (flowId) {
      let currentFlow = await Storage.get('flows', flowId);
      if (currentFlow.latestJob && currentFlow.latestJob.status === 'running') {
        let currentJob = await Storage.get('jobs', currentFlow.latestJob.id);
        if (runningFlowInterval) {
          clearInterval(runningFlowInterval)
          runningFlowInterval = null;
        }
        // Reset flow run parameters
        currentJob.status = 'stopped'; 
        currentJob.endTime = (new Date()).toISOString();
        currentJob.stepId = null;
        currentJob.stepName = null;
        currentJob.stepRunningPercent = null;
        currentFlow.latestJob = currentJob;
        Storage.save('flows', flowId, currentFlow);
        Storage.save('jobs', currentJob.id, currentJob);
        resolve(currentFlow);
      } else {
        reject(Error.create(400, `Bad Request: '${flowId}' is not running`));
      }
    } else {
      reject(Error.create(400, `Bad Request: 'flowId' required`));
    }
  });
}