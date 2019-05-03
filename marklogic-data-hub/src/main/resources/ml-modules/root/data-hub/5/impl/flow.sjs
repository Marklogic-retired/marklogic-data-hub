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
const defaultGlobalContext = {
  flow : {},
  jobId: '',
  attemptStep: 1,
  lastCompletedStep: 0,
  lastAttemptedStep: 0,
  batchErrors: [],
  failedItems: [],
  completedItems: []
};

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
    if (globalContext) {
      this.globalContext = globalContext;
    } else {
      this.resetGlobalContext();
    }
  }

  resetGlobalContext() {
    this.globalContext = Object.assign({
      targetDatabase: this.config.FINALDATABASE,
      sourceDatabase: this.config.STAGINGDATABASE
    }, defaultGlobalContext);
    for (let key of Object.getOwnPropertyNames(this.globalContext)) {
      if (Array.isArray(this.globalContext[key])) {
        this.globalContext[key] = [];
      } else if (this.globalContext[key] instanceof Object) {
        this.globalContext[key] = Object.create(this.globalContext[key]);
      }
    }
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
  //TODO: make this a flat fn.doc call in the future and figure out how to normalize the uri so we don't need this loop at all
  getFlow(name) {
    let uriMatches = cts.uriMatch('/flows/'+name+'.flow.json', ['case-insensitive'], cts.directoryQuery("/flows/"));
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
    let stepDetails = this.step.getStepByNameAndType(stepRef.stepDefinitionName, stepRef.stepDefinitionType);

    //here we consolidate options and override in order of priority: runtime flow options, step defined options, process defined options
    let combinedOptions = Object.assign({}, stepDetails.options, flow.options, stepRef.options, options);
    // combine all collections
    let collections = [
      options.collections,
      ((stepRef.options || {}).collections || (stepDetails.options || {}).collections),
      (flow.options || {}).collections
    ].reduce((previousValue, currentValue) => (previousValue || []).concat((currentValue || [])));
    this.globalContext.targetDatabase = combinedOptions.targetDatabase || this.globalContext.targetDatabase;
    this.globalContext.sourceDatabase = combinedOptions.sourceDatabase || this.globalContext.sourceDatabase;

    if (!combinedOptions.noBatchWrite) {
      let batchDoc = this.datahub.jobs.createBatch(jobDoc.jobId, stepRef, stepNumber);
      this.globalContext.batchId = batchDoc.batch.batchId;
    }

    if (this.datahub.flow) {
      //clone and remove flow to avoid circular references
      this.datahub = this.datahub.hubUtils.cloneInstance(this.datahub);
      delete this.datahub.flow;
    }
    let flowInstance = this;

    if (this.isContextDB(this.globalContext.sourceDatabase) && !combinedOptions.stepUpdate) {
      this.runStep(uris, content, combinedOptions, flowName, stepNumber, stepRef);
    } else {
      xdmp.invoke(
        '/data-hub/5/impl/invoke-step.sjs',
        {flow: flowInstance, uris, content, options: combinedOptions, flowName, step: stepRef, stepNumber},
        {
          database: this.globalContext.sourceDatabase ? xdmp.database(this.globalContext.sourceDatabase) : xdmp.database(),
          update: combinedOptions.stepUpdate ? 'true': 'false',
          commit: 'auto',
          ignoreAmps: true
        }
      );
    }

    //let's update our jobdoc now
    if (!combinedOptions.noWrite) {
      this.datahub.hubUtils.writeDocuments(this.writeQueue, 'xdmp.defaultPermissions()', collections, this.globalContext.targetDatabase);
    }
    for (let content of this.writeQueue) {
      let info = {
        derivedFrom: content.previousUri || content.uri,
        influencedBy: stepRef.stepDefinitionName,
        status: (stepDetails.type === 'INGESTION') ? 'created' : 'updated',
        metadata: {}
      };
      this.datahub.prov.createStepRecord(jobId, flowName, stepRef.name, stepRef.stepDefinitionName, stepRef.stepDefinitionType.toLowerCase(), content.uri, info);
    }
    if (!combinedOptions.noBatchWrite) {
      let batchStatus = "finished";
      if (this.globalContext.failedItems.length) {
        if (this.globalContext.completedItems.length) {
          batchStatus = "finished_with_errors";
        } else {
          batchStatus = "failed";
        }
      }
      this.datahub.jobs.updateBatch(this.globalContext.jobId, this.globalContext.batchId, batchStatus, uris, this.globalContext.batchErrors[0]);
    }

    let resp = {
      "jobId": this.globalContext.jobId,
      "totalCount": uris.length,
      "errorCount": this.globalContext.failedItems.length,
      "completedItems": this.globalContext.completedItems,
      "failedItems": this.globalContext.failedItems,
      "errors": this.globalContext.batchErrors
    };
    if (combinedOptions.fullOutput) {
      resp.documents = this.writeQueue;
    }
    if (this.datahub.performance.performanceMetricsOn()) {
      resp.performanceMetrics = this.datahub.performance.stepMetrics;
    }
    this.resetGlobalContext();
    return resp;
  }


  runStep(uris, content, options, flowName, stepNumber, step) {
    // declareUpdate({explicitCommit: true});
    let flowInstance = this;
    let processor = flowInstance.step.getStepProcessor(flowInstance, step.stepDefinitionName, step.stepDefinitionType);
    if(!(processor && processor.run)) {
      let errorMsq = `Could not find main() function for process ${step.stepDefinitionType}/${step.stepDefinitionName} for step # ${stepNumber} for the flow: ${flowName} could not be found.`;
      flowInstance.datahub.debug.log({message: errorMsq, type: 'error'});
      throw Error(errorMsq);
    }

      let hookOperation = function() {};
      let hook = processor.customHook;
      if (hook && hook.module) {
        let parameters = Object.assign({uris}, processor.customHook.parameters);
        hookOperation = function () {
          flowInstance.datahub.hubUtils.invoke(
            hook.module,
            parameters,
            hook.user || xdmp.getCurrentUser(),
            hook.runBefore ? flowInstance.globalContext.sourceDatabase : this.globalContext.targetDatabase
          );
        }
      }
      if (hook && hook.runBefore) {
        hookOperation();
      }
      let normalizeToSequence = flowInstance.datahub.hubUtils.normalizeToSequence;
      if (options.acceptsBatch) {
        try {
          let results = normalizeToSequence(flowInstance.runMain(normalizeToSequence(content), options, processor.run));
          flowInstance.processResults(results, options, flowName, step);
          flowInstance.globalContext.completedItems = flowInstance.globalContext.completedItems.concat(uris);
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
          flowInstance.globalContext.failedItems = flowInstance.globalContext.failedItems.concat(uris);
          flowInstance.datahub.debug.log({message: `Error running step: ${e.toString()}. ${e.stack}`, type: 'error'});
        }
      } else {
        for (let contentItem of content) {
          flowInstance.globalContext.uri = contentItem.uri;
          try {
            let results = normalizeToSequence(flowInstance.runMain(contentItem, options, processor.run));
            flowInstance.processResults(results, options, flowName, step);
            flowInstance.globalContext.completedItems.push(flowInstance.globalContext.uri);
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
            flowInstance.globalContext.failedItems.push(flowInstance.globalContext.uri);
            flowInstance.datahub.debug.log({message: `Error running step: ${e.toString()}. ${e.stack}`, type: 'error'});
          }
        }
      }
      flowInstance.globalContext.uri = null;
      if (hook && !hook.runBefore) {
        hookOperation();
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
        result.context.metadata = self.flowUtils.createMetadata(result.context.metadata ? result.context.metadata : {}, flowName, step.stepDefinitionName, this.globalContext.jobId);
        // normalize context values to arrays
        if (result.context.collections) {
          result.context.collections = normalizeToArray(result.context.collections);
        }
        if (result.context.permissions) {
          // normalize permissions to array of JSON permissions
          result.context.permissions = normalizeToArray(result.context.permissions)
            .map((perm) => (perm instanceof Element) ? xdmp.permission(xdmp.roleName(fn.string(perm.xpath('*:role-id'))), fn.string(perm.xpath('*:capability')), "object") : perm);
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
    return resp;
  };
}

module.exports = Flow;
