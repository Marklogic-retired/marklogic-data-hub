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
const FlowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const Step = require("/data-hub/5/impl/step.sjs");

// define constants for caching expensive operations
const cachedFlows = {};

class Flow {

  constructor(config = null, globalContext = null, datahub = null) {
    if (!config) {
      config = require("/com.marklogic.hub/config.sjs");
    }
    this.config = config;

    if (!datahub) {
      let DataHub = require("/data-hub/5/datahub.sjs");
      datahub = new DataHub(config);
    }
    this.datahub = datahub;
    this.step = new Step(config, datahub);
    this.flowUtils = new FlowUtils(config);
    this.consts = datahub.consts;
    this.writeQueue = [];
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

  addToWriteQueue(content) {
      this.writeQueue.push(content);
  }

  runFlow(flowName, jobId, content = [], options, stepNumber) {
    let uris = content.map((contentItem) => contentItem.uri);
    let flow = this.getFlow(flowName);
    if(!flow) {
      this.datahub.debug.log({message: 'The flow with the name '+flowName+' could not be found.', type: 'error'});
      throw Error('The flow with the name '+flowName+' could not be found.')
    }
    //set the flow in the context
    this.globalContext.flow = flow;


    let jobDoc = this.datahub.jobs.getJobDocWithId(jobId);
    if(!jobDoc){
      jobDoc = this.datahub.jobs.createJob(flowName, jobId);
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

    let stepRef = this.globalContext.flow.steps[stepNumber];
    if(!stepRef) {
      this.datahub.debug.log({message: 'Step '+stepNumber+' for the flow: '+flowName+' could not be found.', type: 'error'});
      throw Error('Step '+stepNumber+' for the flow: '+flowName+' could not be found.');
    }
    let stepDetails = this.step.getStepByNameAndType(stepRef.name, stepRef.type);
    let batchDoc = this.datahub.jobs.createBatch(jobDoc.jobId, stepRef, stepNumber);
    this.globalContext.batchId = batchDoc.batch.batchId;

    if(stepRef.targetDb) {
      this.globalContext.targetDb = stepRef.targetDb;
    }
    if(stepRef.sourceDb) {
      this.globalContext.sourceDb = stepRef.sourceDb;
    }
    //here we consolidate options and override in order of priority: runtime flow options, step defined options, process defined options
    let combinedOptions = Object.assign({}, stepDetails.options, stepRef.options, options);

    //let stepResult = this.runStep(uris, content, combinedOptions, flowName, stepNumber, step);
    if (this.datahub.flow) {
      //clone and remove flow to avoid circular references
      this.datahub = this.datahub.hubUtils.cloneInstance(this.datahub);
      delete this.datahub.flow;
    }
    let flowInstance = this;
    let stepResult = null;

    if (this.isContextDB(combinedOptions.sourceDb) && !combinedOptions.stepUpdate) {
      this.runStep(uris, content, combinedOptions, flowName, stepNumber, stepRef);
    } else {
      xdmp.invoke(
        '/data-hub/5/impl/invoke-step.sjs',
        {flow: flowInstance, uris, content, options: combinedOptions, flowName, step: stepRef, stepNumber},
        {
          database: this.globalContext.sourceDb ? xdmp.database(this.globalContext.sourceDb) : xdmp.database(),
          update: combinedOptions.stepUpdate ? "true": "false",
          isolation: combinedOptions.stepUpdate ? "different-transaction": "same-statement",
          ignoreAmps: true
        }
      );
    }

    //let's update our jobdoc now
    if (!this.globalContext.batchErrors.length) {
      if (!combinedOptions.noWrite) {
        this.datahub.hubUtils.writeDocuments(this.writeQueue, 'xdmp.defaultPermissions()', combinedOptions.collections, this.globalContext.targetDb);
      }
      for (let content of this.writeQueue) {
        let info = {
            derivedFrom: content.previousUri || content.uri,
            influencedBy: stepRef.name,
            status: (flow.type === 'ingest') ? 'created' : 'updated',
            metadata: {}
          }
        ;
        this.datahub.prov.createStepRecord(jobId, flowName, stepRef.type, content.uri, info);
      }
//      this.jobs.updateJob(this.globalContext.jobId, stepNumber, stepNumber, "finished");
      this.datahub.jobs.updateBatch(this.globalContext.jobId, this.globalContext.batchId, "finished", uris);
    } else {
      this.datahub.jobs.updateBatch(this.globalContext.jobId, this.globalContext.batchId, "failed", uris);
//      this.jobs.updateJob(this.globalContext.jobId, stepNumber, stepNumber, "finished_with_errors");
    }
    let resp = {
      "jobId": this.globalContext.jobId,
      "totalCount": uris.length,
      // TODO should error counts, completedItems, etc. be all or nothing?
      "errorCount": this.globalContext.batchErrors.length ? uris.length: 0,
      "completedItems": this.globalContext.batchErrors.length ? []: uris,
      "failedItems": this.globalContext.batchErrors.length ? uris: [],
      "errors": this.globalContext.batchErrors
    };
    if (combinedOptions.fullOutput) {
      resp.documents = this.writeQueue;
    }
    if (this.datahub.performance.performanceMetricsOn()) {
      resp.performanceMetrics = this.datahub.performance.stepMetrics;
    }

    return resp;
  }


  runStep(uris, content, options, flowName, stepNumber, step) {
    // declareUpdate({explicitCommit: true});
    let flowInstance = this;
    let processor = flowInstance.step.getStepProcessor(flowInstance, step.name, step.type);
    if(!(processor && processor.run)) {
      let errorMsq = `Could not find main() function for process ${step.type}/${step.name} for step # ${stepNumber} for the flow: ${flowName} could not be found.`;
      flowInstance.datahub.debug.log({message: errorMsq, type: 'error'});
      throw Error(errorMsq);
    }

    let combinedOptions = Object.assign({}, processor.options, step.options, options);

    try {
      let hookOperation = function() {};
      let hook = processor.customHook;
      if (hook && hook.module) {
        let parameters = Object.assign({uris}, processor.customHook.parameters);
        hookOperation = function () {
          flowInstance.datahub.hubUtils.invoke(
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
      let normalizeToSequence = flowInstance.datahub.hubUtils.normalizeToSequence;
      if (combinedOptions.acceptsBatch) {
        let results = normalizeToSequence(flowInstance.runMain(normalizeToSequence(content), combinedOptions, processor.run));
        flowInstance.processResults(results, combinedOptions, flowName, step);
      } else {
          for (let contentItem of content) {
            flowInstance.globalContext.uri = contentItem.uri;
            let results = normalizeToSequence(flowInstance.runMain(contentItem, combinedOptions, processor.run));
            flowInstance.processResults(results, combinedOptions, flowName, step);
          }
      }
      flowInstance.globalContext.uri = null;
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
      flowInstance.datahub.debug.log({message: `Error running step: ${e.toString()}. ${e.stack}`, type: 'error'});
 //     xdmp.rollback();
      return flowInstance.globalContext.batchErrors;
    }
  }

  processResults(results, combinedOptions, flowName, step) {
    let self = this;
    let normalizeToArray = self.datahub.hubUtils.normalizeToArray;
    for (let result of results) {
      if (result) {
        if (!combinedOptions.acceptsBatch) {
          result.previousUri = self.globalContext.uri;
        }
        //add our metadata to this
        result.context = result.context || {};
        result.context.metadata = self.flowUtils.createMetadata(result.context.metadata ? result.context.metadata : {}, flowName, step.name);
        // normalize context values to arrays
        if (result.context.collections) {
          result.context.collections = normalizeToArray(result.context.collections);
        }
        if (result.context.permissions) {
          result.context.permissions = normalizeToArray(result.context.permissions);
        }
        self.addToWriteQueue(result, self.globalContext);
      }
    }
  }

  isContextDB(databaseName) {
    return !databaseName || fn.string(xdmp.database()) === fn.string(xdmp.database(databaseName));
  }

  runMain(content, options, func) {
    let resp;
    resp = func(content, options);
    if (resp instanceof Sequence) {
      resp = fn.head(resp);
    }
    return resp;
  };
}

module.exports = Flow;
