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
    this.writeQueue = [];
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
    if (content.uri) {
      this.writeQueue.push(content);
    } else {
      this.datahub.debug.log({ type: 'error', message: `Couldn't add '${xdmp.toJsonString(content)}' to the write queue due to missing uri.`});
    }
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
    if(!(jobDoc || options.disableJobOutput)) {
      jobDoc = this.datahub.jobs.createJob(flowName, jobId);
    }
    if (jobDoc) {
      if (jobDoc.job) {
        jobDoc = jobDoc.job;
      }
      //set the jobid in the context based on the jobdoc response
      this.globalContext.jobId = jobDoc.jobId;
      this.globalContext.lastCompletedStep = jobDoc.lastCompletedStep;
      this.globalContext.lastAttemptedStep = jobDoc.lastAttemptedStep;
    }

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
    // set provenance granularity based off of combined options
    this.datahub.prov.granularityLevel(combinedOptions.provenanceGranularityLevel);
    // combine all collections
    let collections = [
      options.collections,
      ((stepRef.options || {}).collections || (stepDetails.options || {}).collections),
      (flow.options || {}).collections
    ].reduce((previousValue, currentValue) => (previousValue || []).concat((currentValue || [])))
      // filter out any null/empty collections that may exist
      .filter((col) => !!col);
    this.globalContext.targetDatabase = combinedOptions.targetDatabase || this.globalContext.targetDatabase;
    this.globalContext.sourceDatabase = combinedOptions.sourceDatabase || this.globalContext.sourceDatabase;

    if (!(combinedOptions.noBatchWrite || combinedOptions.disableJobOutput)) {
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

    let writeTransactionInfo = {};
    //let's update our jobdoc now
    if (!combinedOptions.noWrite) {
      writeTransactionInfo = this.datahub.hubUtils.writeDocuments(this.writeQueue, 'xdmp.defaultPermissions()', collections, this.globalContext.targetDatabase);
    }
    let stepDefTypeLowerCase = (stepDetails.type) ? stepDetails.type.toLowerCase(): stepDetails.type;
    let stepName = stepRef.name || stepRef.stepDefinitionName;
    let prov = this.datahub.prov;
    for (let content of this.writeQueue) {
      let previousUris = this.datahub.hubUtils.normalizeToArray(content.previousUri || content.uri);
      let info = {
        derivedFrom: previousUris,
        influencedBy: stepName,
        status: (stepDefTypeLowerCase === 'ingestion') ? 'created' : 'updated',
        metadata: {}
      };
      // We may want to hide some documents from provenance. e.g., we don't need provenance of mastering PROV documents
      if (content.provenance !== false) {
        let provResult;
        if (prov.granularityLevel() === prov.FINE_LEVEL && content.provenance) {
          provResult = this.buildFineProvenanceData(jobId, flowName, stepName, stepRef.stepDefinitionName, stepDefTypeLowerCase, content, info);
        } else {
          provResult = prov.createStepRecord(jobId, flowName, stepName, stepRef.stepDefinitionName, stepDefTypeLowerCase, content.uri, info);
        }
        if (provResult instanceof Error) {
          flowInstance.datahub.debug.log({message: provResult.message, type: 'error'});
        }
      }
    }
    if (prov.granularityLevel() !== prov.OFF_LEVEL) {
      this.datahub.prov.commit();
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
      if (!combinedOptions.disableJobOutput) {
        this.datahub.jobs.updateBatch(this.globalContext.jobId, this.globalContext.batchId, batchStatus, uris, writeTransactionInfo, this.globalContext.batchErrors[0]);
      }
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
    if (!(processor && processor.run)) {
      let errorMsq = `Could not find main() function for process ${step.stepDefinitionType}/${step.stepDefinitionName} for step # ${stepNumber} for the flow: ${flowName} could not be found.`;
      flowInstance.datahub.debug.log({message: errorMsq, type: 'error'});
      throw Error(errorMsq);
    }

    let hookOperation = function () {};
    let hook = step.customHook;
    if (!hook || !hook.module) {
      hook = processor.customHook;
    }
    if (hook && hook.module) {
      // Include all of the step context in the parameters for the custom hook to make use of
      let parameters = Object.assign({uris, content, options, flowName, stepNumber, step}, hook.parameters);
      hookOperation = function () {
        flowInstance.datahub.hubUtils.invoke(
          hook.module,
          parameters,
          hook.user || xdmp.getCurrentUser(),
          hook.database || (hook.runBefore ? flowInstance.globalContext.sourceDatabase : flowInstance.globalContext.targetDatabase)
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
            "stackFrames": e.stackFrames,
            "uri": flowInstance.globalContext.uri
          });
          flowInstance.globalContext.failedItems.push(flowInstance.globalContext.uri);
          flowInstance.datahub.debug.log({message: `Error running step: ${e.toString()}. ${e.stack}`, type: 'error'});
        }
        flowInstance.globalContext.uri = null;
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

  buildFineProvenanceData(jobId, flowName, stepName, stepDefName, stepDefType, content, info) {
    let previousUris = fn.distinctValues(Sequence.from([Sequence.from(Object.keys(content.provenance)),Sequence.from(info.derivedFrom)]));
    let prov = this.datahub.prov;
    let hubUtils = this.datahub.hubUtils;
    let newDocURI = content.uri;
    let docProvIDs = [];
    // setup variables to group prov info by properties
    let docProvPropertyIDsByProperty = {};
    let docProvPropertyMetadataByProperty = {};
    let docProvDocumentIDsByProperty = {};
    for (let prevUri of previousUris) {
      let docProvenance = content.provenance[prevUri];
      if (docProvenance) {
        let docProperties = Object.keys(docProvenance);
        let docPropRecords = prov.createStepPropertyRecords(jobId, flowName, stepName, stepDefName, stepDefType, prevUri, docProperties, info);
        let docProvID = docPropRecords[0];
        docProvIDs.push(docProvID);
        let docProvPropertyIDKeyVals = docPropRecords[1];
        // accumulating changes here, since merges can have multiple docs with input per property.
        for (let origProp of Object.keys(docProvPropertyIDKeyVals)) {
          let propDetails = docProvenance[origProp];
          let prop = propDetails.type || propDetails.destination;

          docProvPropertyMetadataByProperty[prop] = docProvPropertyMetadataByProperty[prop] || {};
          const propMetadata = docProvPropertyMetadataByProperty[prop];
          for (const propDetailsKey of Object.keys(propDetails)) {
            if (propDetails.hasOwnProperty(propDetailsKey) && propDetails[propDetailsKey]) {
              propMetadata[propDetailsKey] = propMetadata[propDetailsKey] || [];
              propMetadata[propDetailsKey] = propMetadata[propDetailsKey].concat(hubUtils.normalizeToArray(propDetails[propDetailsKey]));
            }
          }
          docProvPropertyIDsByProperty[prop] = docProvPropertyIDsByProperty[prop] || [];
          docProvPropertyIDsByProperty[prop].push(docProvPropertyIDKeyVals[origProp]);
          docProvDocumentIDsByProperty[prop] = docProvDocumentIDsByProperty[prop] || [];
          docProvDocumentIDsByProperty[prop].push(docProvID);
        }
      }
    }

    let newPropertyProvIDs = [];
    for (let prop of Object.keys(docProvPropertyIDsByProperty)) {
      let docProvDocumentIDs = docProvDocumentIDsByProperty[prop];
      let docProvPropertyIDs = docProvPropertyIDsByProperty[prop];
      let docProvPropertyMetadata = docProvPropertyMetadataByProperty[prop];
      for (const propDetailsKey of Object.keys(docProvPropertyMetadata)) {
        if (docProvPropertyMetadata.hasOwnProperty(propDetailsKey)) {
          let dedupedMeta = Sequence.from(docProvPropertyMetadata[propDetailsKey]);
          docProvPropertyMetadata[propDetailsKey] = fn.count(dedupedMeta) <= 1 ? fn.string(fn.head(dedupedMeta)) : dedupedMeta.toArray();
          if (!(typeof docProvPropertyMetadata[propDetailsKey] === 'string' || docProvPropertyMetadata[propDetailsKey] instanceof xs.string)) {
            docProvPropertyMetadata[propDetailsKey] = xdmp.toJsonString(docProvPropertyMetadata[propDetailsKey]);
          }
        }
      }
      let propInfo = Object.assign({}, info, { metadata: docProvPropertyMetadata });
      let newPropertyProvID = prov.createStepPropertyAlterationRecord(jobId, flowName, stepName, stepDefName, stepDefType, prop, docProvDocumentIDs, docProvPropertyIDs, propInfo);
      newPropertyProvIDs.push(newPropertyProvID);
    }
    // Now create the merged document record from both the original document records & the merged property records
    return prov.createStepDocumentAlterationRecord(jobId, flowName, stepName, stepDefName, stepDefType, newDocURI, docProvIDs, newPropertyProvIDs, info);
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
