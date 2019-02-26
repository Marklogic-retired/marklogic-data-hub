/**
  Copyright 2012-2019 MarkLogic Corporation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
'use strict';

const consts = require("/data-hub/5/impl/consts.sjs");
const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const HubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const Debug = require("/data-hub/5/impl/debug.sjs");
const Step = require("/data-hub/5/impl/step.sjs");
const Jobs = require("/data-hub/5/impl/jobs.sjs");
const defaultConfig = require("/com.marklogic.hub/config.sjs");
// define constants for caching expensive operations
const cachedFlows = {};

class Flow {

  constructor(config = null, globalContext = null) {
    if (!config) {
      config = defaultConfig;
    }
    this.config = config;
    this.consts = consts;
    this.debug = new Debug(config);
    this.flowUtils = new flowUtils(config);
    this.hubUtils = new HubUtils(config);
    this.step = new Step(config);
    this.jobs = new Jobs(config);
    this.writeQueue = {};
    if (!globalContext) {
      globalContext = {
        flow : {},
        jobId: '',
        attemptStep: 1,
        lastCompletedStep: 0,
        lastAttemptedStep: 0,
        targetDb: config.FINALDATABASE,
        sourceDb: config.STAGINGDATABASE,
        batchErrors: []
      };
    }
    this.globalContext = globalContext;
  }

  getFlowNames() {
    let names = [];
    let query = [cts.directoryQuery("/flows/"), cts.collectionQuery('http://marklogic.com/data-hub/flow')];
    let docs = cts.search(cts.andQuery(query));
    if(docs) {
      for(let doc of docs) {
        let name = doc.xpath('/name');
        if(name) {
          names.push(name);
        }
      }
    }

    return names;
  }

  getFlows(){
    let docs = [];
    let query = cts.directoryQuery("/flows/");
    let uris = cts.uris("", null ,query);
    for (let doc of uris) {
      docs.push(cts.doc(doc).toObject());
    }
    return docs;
  }

  deleteFlow(flowName) {
    let uris = cts.uris("", null ,cts.andQuery([cts.orQuery([cts.directoryQuery("/flows/"),cts.collectionQuery("http://marklogic.com/data-hub/flow")]),
      cts.jsonPropertyValueQuery("name", flowName)]));
    for (let doc of uris) {
      if (fn.docAvailable(doc)){
        this.hubUtils.deleteDocument(doc, this.config.STAGINGDATABASE);
      }
    }
  }

  //note: we're using uriMatch here to avoid case sensitivity, but still strongly match on the actual flow name itself
  getFlow(name) {
    let uriMatches = cts.uriMatch('/flows/'+name+'.flow.json', ['case-insensitive']);
    // cache flow to prevent repeated calls.
    if (cachedFlows[name] === undefined) {
      if (fn.count(uriMatches) === 1) {
        cachedFlows[name] = cts.doc(fn.head(uriMatches)).toObject();
      } else if (fn.count(uriMatches) > 1) {
        for (let uri of uriMatches) {
          if (uri === '/flows/' + name + '.flow.json') {
            cachedFlows[name] = cts.doc(uriMatches).toObject();
            break;
          }
        }
      } else {
        cachedFlows[name] = null;
      }
    }
    return cachedFlows[name];
  }

  setFlow(flowObj){
    this.globalContext.flow = flowObj;
  }

  addToWriteQueue(uri, content, context) {
      this.writeQueue[uri] = {
        content: content,
        context: context
      }
  }

  runFlow(flowName, jobId, uris, content = {}, options, stepNumber) {
    let flow = this.getFlow(flowName);
    if(!flow) {
      this.debug.log({message: 'The flow with the name '+flowName+' could not be found.', type: 'error'});
      throw Error('The flow with the name '+flowName+' could not be found.')
    }
    //set the flow in the context
    this.globalContext.flow = flow;

    let jobDoc = this.jobs.getJobDocWithId(jobId);
    if(!jobDoc){
      jobDoc = this.jobs.createJob(flowName, jobId);
    }
    if (jobDoc && jobDoc.job) {
      jobDoc = jobDoc.job;
    }
    //set the jobid in the context based on the jobdoc response
    this.globalContext.jobId = jobDoc.jobId;
    this.globalContext.lastCompletedStep = jobDoc.lastCompletedStep;
    this.globalContext.lastAttemptedStep = jobDoc.lastAttemptedStep;

    //grab the step, or the first if its null/not set
    if(!stepNumber) {
      stepNumber = 1;
    }

    //set the context for the attempted step
    this.globalContext.attemptStep = stepNumber;

    let step = this.globalContext.flow.steps[stepNumber];
    if(!step) {
      this.debug.log({message: 'Step '+stepNumber+' for the flow: '+flowName+' could not be found.', type: 'error'});
      throw Error('Step '+stepNumber+' for the flow: '+flowName+' could not be found.')
    }
    let batchDoc = this.jobs.createBatch(jobDoc.jobId, step, stepNumber);
    this.globalContext.batchId = batchDoc.batch.batchId;

    if(step.targetDb) {
      this.globalContext.targetDb = step.targetDb;
    }
    if(step.sourceDb) {
      this.globalContext.sourceDb = step.sourceDb;
    }
    //here we consolidate options and override in order of priority: runtime flow options, step defined options, process defined options
    let combinedOptions = Object.assign({}, step.options, options);
    let stepResult = fn.head(
      xdmp.invoke(
        '/data-hub/5/impl/invoke-step.sjs',
        { globalContext: this.globalContext, uris, content, options: combinedOptions, flowName, step, stepNumber},
        { database: this.globalContext.sourceDb ? xdmp.database(this.globalContext.sourceDb): xdmp.database(), ignoreAmps: true }
      )
    );
    if (Array.isArray(stepResult)) {
      this.globalContext.batchErrors = this.globalContext.batchErrors.concat(stepResult);
    } else {
      this.writeQueue = stepResult;
    }

    //let's update our jobdoc now
    if (!this.globalContext.batchErrors.length) {
      if (!combinedOptions.noWrite) {
        this.hubUtils.writeDocuments(this.writeQueue, 'xdmp.defaultPermissions()', combinedOptions.collections, this.globalContext.targetDb);
      }
//      this.jobs.updateJob(this.globalContext.jobId, stepNumber, stepNumber, "finished");
      this.jobs.updateBatch(this.globalContext.jobId, this.globalContext.batchId, "finished", uris);
    } else {
      this.jobs.updateBatch(this.globalContext.jobId, this.globalContext.batchId, "failed", uris);
//      this.jobs.updateJob(this.globalContext.jobId, stepNumber, stepNumber, "finished_with_errors");
    }
    return {
      "totalCount": uris.length,
      // TODO should error counts, completedItems, etc. be all or nothing?
      "errorCount": this.globalContext.batchErrors.length ? uris.length: 0,
      "completedItems": this.globalContext.batchErrors.length ? []: uris,
      "failedItems": this.globalContext.batchErrors.length ? uris: [],
      "errors": this.globalContext.batchErrors,
      "documents": this.writeQueue
    };
  }

  runStep(uris, content, options, flowName, stepNumber, step) {
    // declareUpdate({explicitCommit: true});
    let flowInstance = this;
    let processor = flowInstance.step.getStepProcessor(flowInstance, step.name, step.type);
    if(!(processor && processor.run)) {
      let errorMsq = `Could not find main() function for process ${step.type}/${step.name} for step # ${stepNumber} for the flow: ${flowName} could not be found.`;
      flowInstance.debug.log({message: errorMsq, type: 'error'});
      throw Error(errorMsq);
    }

    let combinedOptions = Object.assign({}, processor.options, options);
    try {
      let hookOperation = function() {};
      let hook = processor.customHook;
      if (hook && hook.module) {
        let parameters = Object.assign({uris}, processor.customHook.parameters);
        hookOperation = function () {
          flowInstance.hubUtils.invoke(
            hook.module,
            parameters,
            hook.user || xdmp.getCurrentUser(),
            hook.runBefore ? flowInstance.globalContext.sourceDb : this.globalContext.targetDb
          );
        }
      }
      if (hook && hook.runBefore) {
        hookOperation();
      }
      for (let uri of uris) {
        let result = flowInstance.runMain(uri, content[uri], combinedOptions, processor.run);
        flowInstance.addToWriteQueue(uri, result, flowInstance.globalContext);
      }
      if (hook && !hook.runBefore) {
        hookOperation();
      }
//      xdmp.commit();
      return flowInstance.writeQueue;
    } catch (e) {
      flowInstance.globalContext.batchErrors.push({
        "stack": e.stack,
        "code": e.code,
        "data": e.data,
        "message": e.message,
        "name": e.name,
        "retryable": e.retryable,
        "stackFrames": e.stackFrames
      });
      flowInstance.debug.log({message: `Error running step: ${e.toString()}.`, type: 'error'});
 //     xdmp.rollback();
      return flowInstance.globalContext.batchErrors;
    }
  }

  isContextDB(databaseName) {
    return !databaseName || fn.string(xdmp.database()) === fn.string(xdmp.database(databaseName));
  }

  runMain(uri, content, options, func) {
    let resp;
    resp = func(uri, content, options);
    if (resp instanceof Sequence) {
      resp = fn.head(resp);
    }
    return resp;
  };
}

module.exports = Flow;
