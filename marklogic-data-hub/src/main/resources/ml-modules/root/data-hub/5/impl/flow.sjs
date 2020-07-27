/**
 Copyright (c) 2020 MarkLogic Corporation

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
const jobsMod = require("/data-hub/5/impl/jobs.sjs");

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

  constructor(config = null, globalContext = null, datahub = null, artifactsCore = null) {
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
    this.artifactsCore =  require('/data-hub/5/artifacts/core.sjs');
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

  getFlow(name) {
    if (cachedFlows[name] === undefined) {
      cachedFlows[name] =  this.artifactsCore.getFullFlow(name);
    }
    return cachedFlows[name];
  }

  setFlow(flowObj){
    this.globalContext.flow = flowObj;
  }

  /**
   * Find records that match a query based on the given inputs. Each matching record is wrapped in a
   * "content descriptor" object that is guaranteed to have at least a "uri" property.
   *
   * @param flowName
   * @param stepNumber
   * @param options
   * @param filterQuery
   * @return {*}
   */
  findMatchingContent(flowName, stepNumber, options, filterQuery) {
    const flow = this.getFlow(flowName);
    const flowStep = flow.steps[stepNumber];
    const stepDefinition = this.step.getStepByNameAndType(flowStep.stepDefinitionName, flowStep.stepDefinitionType);
    const combinedOptions = Object.assign({}, stepDefinition.options || {}, flow.options || {}, flowStep.options || {}, options);

    let query;
    let uris = null;
    if (options.uris) {
      uris = this.datahub.hubUtils.normalizeToArray(options.uris);
      if (options.sourceQueryIsScript) {
        // When the source query is a script, map each item to a content object with the "uri" property containing the item value
        return uris.map(uri => {return {uri}});
      }
      query = cts.documentQuery(uris);
    } else {
      let sourceQuery = combinedOptions.sourceQuery || flow.sourceQuery;
      query = sourceQuery ? xdmp.eval(sourceQuery) : null;
    }

    if (stepDefinition.name === 'default-merging' && stepDefinition.type === 'merging' && uris) {
      return uris.map((uri) => { return { uri }; });
    } else {
      let sourceDatabase = combinedOptions.sourceDatabase || this.globalContext.sourceDatabase;
      if (filterQuery) {
        query = cts.andQuery([query, filterQuery]);
      }
      return this.datahub.hubUtils.queryToContentDescriptorArray(query, combinedOptions, sourceDatabase);
    }
  }

  /**
   * It's unlikely that this actually runs a "flow", unless the flow consists of one step and only one transaction is
   * needed to run the step. More likely, this is really "process a batch of items for a step".
   *
   * @param flowName Required name of the flow to run
   * @param jobId Required ID of the job associated with the execution of the given step and flow
   * @param content Array of content "descriptors", where each descriptor is expected to at least have a "uri" property.
   * The value of the "uri" property is not necessarily a URI; if sourceQueryIsScript is true for the step, then
   * the value of the "uri" property can be any string.
   * @param options Optional map of options that are used to override the flow and step configuration
   * @param stepNumber The number of the step within the given flow to run
   */
  runFlow(flowName, jobId, content = [], options, stepNumber) {
    let items = content.map((contentItem) => contentItem.uri);
    let flow = this.getFlow(flowName);
    if(!flow) {
      this.datahub.debug.log({message: 'The flow with the name '+flowName+' could not be found.', type: 'error'});
      throw Error('The flow with the name '+flowName+' could not be found.')
    }
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

    const flowStep = this.globalContext.flow.steps[stepNumber];
    if(!flowStep) {
      this.datahub.debug.log({message: 'Step '+stepNumber+' for the flow: '+flowName+' could not be found.', type: 'error'});
      throw Error('Step '+stepNumber+' for the flow: '+flowName+' could not be found.');
    }
    const stepDefinition = this.step.getStepByNameAndType(flowStep.stepDefinitionName, flowStep.stepDefinitionType);

    //here we consolidate options and override in order of priority: runtime flow options, step defined options, process defined options
    let combinedOptions = Object.assign({}, stepDefinition.options, flow.options, flowStep.options, options);
    // set provenance granularity based off of combined options
    this.datahub.prov.granularityLevel(combinedOptions.provenanceGranularityLevel);

    this.globalContext.targetDatabase = combinedOptions.targetDatabase || this.globalContext.targetDatabase;
    this.globalContext.sourceDatabase = combinedOptions.sourceDatabase || this.globalContext.sourceDatabase;

    if (!(combinedOptions.noBatchWrite || combinedOptions.disableJobOutput)) {
      let batchDoc = this.datahub.jobs.createBatch(jobDoc.jobId, flowStep, stepNumber);
      this.globalContext.batchId = batchDoc.batch.batchId;
    }

    if (this.datahub.flow) {
      //clone and remove flow to avoid circular references
      this.datahub = this.datahub.hubUtils.cloneInstance(this.datahub);
      delete this.datahub.flow;
    }

    if (this.isContextDB(this.globalContext.sourceDatabase) && !combinedOptions.stepUpdate) {
      this.runStep(items, content, combinedOptions, flowName, stepNumber, flowStep);
    } else {
      const flowInstance = this;
      xdmp.invoke(
        '/data-hub/5/impl/invoke-step.sjs',
        {flowInstance, items, content, combinedOptions, flowName, flowStep, stepNumber},
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
      try {
        // combine all collections
        const collections = [
          options.collections,
          ((flowStep.options || {}).collections || (stepDefinition.options || {}).collections),
          (flow.options || {}).collections
        ].reduce((previousValue, currentValue) => (previousValue || []).concat((currentValue || [])))
          // filter out any null/empty collections that may exist
          .filter((col) => !!col);

        writeTransactionInfo = this.datahub.hubUtils.writeDocuments(this.writeQueue, xdmp.defaultPermissions(), collections, this.globalContext.targetDatabase);
      } catch (e) {
        this.handleWriteError(this, e);
      }
    }

    this.writeProvenanceData(jobId, flowName, stepDefinition, flowStep);
    this.updateBatchDocument(combinedOptions, items, writeTransactionInfo);

    let resp = {
      "jobId": this.globalContext.jobId,
      // using failed/completed items length instead of content length since a step can create more or less documents than were passed to the step
      "totalCount": this.globalContext.failedItems.length + this.globalContext.completedItems.length,
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

  /**
   * @param items the batch of items being processed by the current transaction for the given flow and step. Will be a
   * set of URIs, unless sourceQueryIsScript is set to true for the step, in which case the items can be any set
   * of strings.
   * @param content
   * @param combinedOptions
   * @param flowName
   * @param stepNumber
   * @param flowStep
   */
  runStep(items, content, combinedOptions, flowName, stepNumber, flowStep) {
    let flowInstance = this;
    let processor = flowInstance.step.getStepProcessor(flowInstance, flowStep.stepDefinitionName, flowStep.stepDefinitionType);
    if (!(processor && processor.run)) {
      let errorMsq = `Could not find main() function for process ${flowStep.stepDefinitionType}/${flowStep.stepDefinitionName} for step # ${stepNumber} for the flow: ${flowName} could not be found.`;
      flowInstance.datahub.debug.log({message: errorMsq, type: 'error'});
      throw Error(errorMsq);
    }

    let hookOperation = function () {};
    let hook = flowStep.customHook;
    if (!hook || !hook.module) {
      hook = processor.customHook;
    }
    if (hook && hook.module) {
      // Include all of the step context in the parameters for the custom hook to make use of
      let parameters = Object.assign({uris: items, content, options: combinedOptions, flowName, stepNumber, step: flowStep}, hook.parameters);
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

    const normalizeToSequence = flowInstance.datahub.hubUtils.normalizeToSequence;
    let contentArray = [];

    if (combinedOptions.acceptsBatch) {
      try {
        const results = normalizeToSequence(flowInstance.runMain(normalizeToSequence(content), combinedOptions, processor.run));
        for (const result of results) {
          this.addMetadataToContent(result, combinedOptions, flowName, flowStep);
          contentArray.push(result);
        }
        flowInstance.globalContext.completedItems = flowInstance.globalContext.completedItems.concat(items);
      } catch (e) {
        this.handleStepError(flowInstance, e, items);
      }
    } else {
      for (let contentItem of content) {
        flowInstance.globalContext.uri = contentItem.uri;
        try {
          const results = normalizeToSequence(flowInstance.runMain(contentItem, combinedOptions, processor.run));
          for (const result of results) {
            this.addMetadataToContent(result, combinedOptions, flowName, flowStep);
            contentArray.push(result);
          }
          flowInstance.globalContext.completedItems.push(flowInstance.globalContext.uri);
        } catch (e) {
          this.handleStepError(flowInstance, e);
        }
        flowInstance.globalContext.uri = null;
      }
    }
    flowInstance.globalContext.uri = null;

    try {
      this.applyProcessorsBeforeContentPersisted(flowStep, contentArray, combinedOptions);
    } catch (e) {
      // If a processor throws an error, we don't know if it was specific to a particular item or not. So we assume that
      // all items failed; this is analogous to the behavior of acceptsBatch=true
      this.handleStepError(flowInstance, e, items);
    }

    // Add everything to the writeQueue
    contentArray.forEach(content => {
      if (content.uri) {
        this.writeQueue.push(content);
      } else {
        this.datahub.debug.log({ type: 'error', message: `Couldn't add '${xdmp.toJsonString(content)}' to the write queue due to missing uri.`});
      }
    });

    if (hook && !hook.runBefore) {
      hookOperation();
    }
  }

  /**
   * Applies processors to the given content array. Processors can make any changes they wish to the items in the
   * content array, including adding and removing items, but the array itself cannot be changed - i.e. a processor may
   * not return a new instance of an array.
   *
   * @param flowStep
   * @param contentArray
   * @param combinedOptions
   */
  applyProcessorsBeforeContentPersisted(flowStep, contentArray, combinedOptions) {
    if (flowStep.processors) {
      flowStep.processors.filter((processor => "beforeContentPersisted" == processor.when)).forEach(processor => {
        const vars = Object.assign({}, processor.vars);
        vars.contentArray = contentArray;
        vars.options = combinedOptions;
        xdmp.invoke(processor.path, vars);
      });
    }
  }

  addMetadataToContent(content, combinedOptions, flowName, flowStep) {
    const normalizeToArray = this.datahub.hubUtils.normalizeToArray;
    if (!combinedOptions.acceptsBatch) {
      content.previousUri = this.globalContext.uri;
    }
    //add our metadata to this
    content.context = content.context || {};
    content.context.metadata = this.flowUtils.createMetadata(content.context.metadata ? content.context.metadata : {}, flowName, flowStep.stepDefinitionName, this.globalContext.jobId);
    // normalize context values to arrays
    if (content.context.collections) {
      content.context.collections = normalizeToArray(content.context.collections);
    }
    if (content.context.permissions) {
      // normalize permissions to array of JSON permissions
      content.context.permissions = normalizeToArray(content.context.permissions)
        .map((perm) => (perm instanceof Element) ? xdmp.permission(xdmp.roleName(fn.string(perm.xpath('*:role-id'))), fn.string(perm.xpath('*:capability')), "object") : perm);
    }
  }

  handleStepError(flowInstance, error, items) {
    flowInstance.addBatchError(flowInstance, error, flowInstance.globalContext.uri);
    if (!flowInstance.globalContext.uri && items) {
      flowInstance.globalContext.failedItems = flowInstance.globalContext.failedItems.concat(items);
    } else if (flowInstance.globalContext.uri) {
      flowInstance.globalContext.failedItems.push(flowInstance.globalContext.uri);
    }
    flowInstance.datahub.debug.log({message: `Error running step: ${error.toString()}. ${error.stack}`, type: 'error'});
  }

  handleWriteError(flowInstance, error) {
    flowInstance.globalContext.completedItems = [];
    flowInstance.globalContext.failedItems = flowInstance.writeQueue.map((contentObj) => contentObj.uri);
    const operation = error.stackFrames && error.stackFrames[0] && error.stackFrames[0].operation;
    let uri;
    // see if we can determine a uri based off the operation in the stackFrames
    if (operation) {
      uri = flowInstance.globalContext.failedItems.find((uri) => operation.includes(`"${uri}"`));
    }
    flowInstance.addBatchError(flowInstance, error, uri);
  }

  addBatchError(flowInstance, error, uri = flowInstance.globalContext.uri) {
    flowInstance.globalContext.batchErrors.push({
      "stack": error.stack,
      "code": error.code,
      "data": error.data,
      "message": error.message,
      "name": error.name,
      "retryable": error.retryable,
      "stackFrames": error.stackFrames,
      "uri": uri
    });
  }

  /**
   * Updates the batch document based on what's in the globalContext. This doesn't care about interceptors at all,
   * as those don't have any impact on the "items" that were the input to this transaction.
   *
   * @param combinedOptions
   * @param items
   * @param writeTransactionInfo
   */
  updateBatchDocument(combinedOptions = {}, items, writeTransactionInfo) {
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
        jobsMod.updateBatch(this.datahub,this.globalContext.jobId, this.globalContext.batchId, batchStatus, items, writeTransactionInfo, this.globalContext.batchErrors[0]);
      }
    }
  }

  /**
   * Writes provenance data based on what's in the writeQueue.
   *
   * @param jobId
   * @param flowName
   * @param stepDefinition
   * @param flowStep
   */
  writeProvenanceData(jobId, flowName, stepDefinition, flowStep) {
    const stepDefTypeLowerCase = (stepDefinition.type) ? stepDefinition.type.toLowerCase(): stepDefinition.type;
    const stepName = flowStep.name || flowStep.stepDefinitionName;
    /* Failure to write may have caused there to be nothing written, so checking the completed items length.
    This approach, rather than clearing the writeQueue on a write error, will allow fullOutput to still return what
    was attempted to be written to the database. This could be helpful in the future for debugging.
     */
    if (this.globalContext.completedItems.length) {
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
            provResult = this.buildFineProvenanceData(jobId, flowName, stepName, flowStep.stepDefinitionName, stepDefTypeLowerCase, content, info);
          } else {
            provResult = prov.createStepRecord(jobId, flowName, stepName, flowStep.stepDefinitionName, stepDefTypeLowerCase, content.uri, info);
          }
          if (provResult instanceof Error) {
            flowInstance.datahub.debug.log({message: provResult.message, type: 'error'});
          }
        }
      }
      if (prov.granularityLevel() !== prov.OFF_LEVEL) {
        this.datahub.prov.commit();
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
