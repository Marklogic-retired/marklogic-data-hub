/**
 Copyright (c) 2021 MarkLogic Corporation

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

const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const defaultConfig = require("/com.marklogic.hub/config.sjs")
const flowRunner = require("/data-hub/5/flow/flowRunner.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const jobs = require("/data-hub/5/impl/jobs.sjs");
const StepExecutionContext = require('/data-hub/5/flow/stepExecutionContext.sjs');
const StepDefinition = require("/data-hub/5/impl/stepDefinition.sjs");
const WriteQueue = require("/data-hub/5/flow/writeQueue.sjs");

// define constants for caching expensive operations
const cachedFlows = {};

class Flow {

  constructor(config, datahub) {
    this.config = config;
    this.datahub = datahub;
    this.stepDefinition = new StepDefinition(config, datahub);

    // Starting in 5.5, this is needed for backwards compatibility so that scaffolded modules can still
    // refer to datahub.flow.flowUtils .
    this.flowUtils = require("/data-hub/5/impl/flow-utils.sjs");

    this.consts = require("/data-hub/5/impl/consts.sjs");
    this.writeQueue = new WriteQueue();
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
      cachedFlows[name] = Artifacts.getFullFlow(name);
    }
    return cachedFlows[name];
  }

  /**
   * Find records that match a query based on the given inputs. Each matching record is wrapped in a
   * "content descriptor" object that is guaranteed to have at least a "uri" property.
   *
   * @param flowName
   * @param stepNumber
   * @param options This isn't just the runtime options provided by the user; because it is expected
   * to be called by the processBatch endpoint, which is invoked by the Java QueryStepRunner class,
   * this is likely already the set of combined options. But it's not guaranteed to be the same,
   * and so combinedOptions is still constructed within this function.
   * @return {*}
   */
  findMatchingContent(flowName, stepNumber, options) {
    // getFlow will throw an error if the flow cannot be found
    const flow = this.getFlow(flowName);

    const flowStep = flow.steps[stepNumber];
    if (!flowStep) {
      httpUtils.throwBadRequest(`Could not find step '${stepNumber}' in flow '${flowName}'`);
    }

    const stepDefinition = this.stepDefinition.getStepDefinitionByNameAndType(flowStep.stepDefinitionName, flowStep.stepDefinitionType);
    if (!stepDefinition) {
      httpUtils.throwBadRequest(`Could not find a step definition with name '${flowStep.stepDefinitionName}' and type '${flowStep.stepDefinitionType}' for step '${stepNumber}' in flow '${flowName}'`);
    }

    const combinedOptions = this.flowUtils.makeCombinedOptions(flow, stepDefinition, stepNumber, options);

    let query;
    let uris = null;
    if (options.uris) {
      uris = hubUtils.normalizeToArray(options.uris);

      if (combinedOptions.excludeAlreadyProcessed === true || combinedOptions.excludeAlreadyProcessed === "true") {
        const stepId = flowStep.stepId ? flowStep.stepId : flowStep.name + "-" + flowStep.stepDefinitionType;
        const filteredItems = this.filterItemsAlreadyProcessedByStep(uris, flowName, stepId);
        if (filteredItems.length != uris.length) {
          xdmp.trace(datahub.consts.TRACE_FLOW_RUNNER, 'excludeAlreadyProcessed filtered out some items; previous count: ' + uris.length + '; new count: ' + filteredItems.length);
        }
        uris = filteredItems;
      }

      if (combinedOptions.sourceQueryIsScript) {
        // When the source query is a script, map each item to a content object with the "uri" property containing the item value
        return uris.map(uri => {return {uri}});
      }
      query = cts.documentQuery(uris);
    } else {
      let sourceQuery = combinedOptions.sourceQuery || flow.sourceQuery;
      query = sourceQuery ? xdmp.eval(sourceQuery) : null;
    }

    let sourceDatabase = combinedOptions.sourceDatabase || defaultConfig.STAGINGDATABASE;
    return hubUtils.queryToContentDescriptorArray(query, combinedOptions, sourceDatabase);
  }

  /**
   * Filters out each item from the items array that was already processed by the given flowName and stepId.
   * The determination is based on Batch documents in the jobs database.
   *
   * @param items the array of items to process; this is referred to as "uris" outside the context of this function,
   * but since these values are not necessarily URIs starting in 5.3.0, the term "items" is used here instead
   * @param flowName
   * @param stepId
   * @returns an array of items that should still be processed
   */
  filterItemsAlreadyProcessedByStep(items, flowName, stepId) {
    // TODO This duplicates knowledge of hash construction with jobs.sjs. Will clean this up in 5.5 when we can create
    // a better "utils" library that is not a class with a bunch of public functions.
    const prefix = flowName + "|" + fn.lowerCase(stepId) + "|finished|";

    // A map is used in this script to avoid N calls to array.includes
    const script = "var items; var prefix; " +
      "const itemHashes = items.map(item => xdmp.hash64(prefix + item)); " +
      "const processedItemHashesMap = cts.values(cts.jsonPropertyReference('processedItemHashes'), null, ['map'], cts.andQuery([" +
      "  cts.collectionQuery('Batch'), " +
      "  cts.jsonPropertyRangeQuery('processedItemHashes', '=', itemHashes)" +
      "])); " +
      "items.filter(item => !processedItemHashesMap[xdmp.hash64(prefix + item)]);";

    // xdmp.invokeFunction returns nothing, so using xdmp.eval
    return fn.head(xdmp.eval(script,
      {items, prefix},
      {database: xdmp.database(this.config.JOBDATABASE)}
    ));
  }

  /**
   * It's unlikely that this actually runs a "flow", unless the flow consists of one step and only one transaction is
   * needed to run the step. More likely, this is really "process a batch of items for a step".
   *
   * @param flowName Required name of the flow to run
   * @param jobId Required ID of the job associated with the execution of the given step and flow
   * @param contentArray Array of content "descriptors", where each descriptor is expected to at least have a "uri" property.
   * The value of the "uri" property is not necessarily a URI; if sourceQueryIsScript is true for the step, then
   * the value of the "uri" property can be any string.
   * @param options Similar to findMatchingContent, this is the combination of options provided by the Java QueryStepRunner
   *  class that ideally would be the same as what's produced by flowUtils.makeCombinedOptions, but it's not yet
   * @param stepNumber The number of the step within the given flow to run
   */
  runFlow(flowName, jobId, contentArray = [], options, stepNumber) {
    const theFlow = this.getFlow(flowName);
    if(!theFlow) {
      throw Error('The flow with the name '+flowName+' could not be found.')
    }

    let jobDoc = jobs.getJob(jobId);
    if(!(jobDoc || options.disableJobOutput)) {
      jobDoc = jobs.createJob(flowName, jobId);
    }
    if (jobDoc) {
      if (jobDoc.job) {
        jobDoc = jobDoc.job;
      }
      jobId = jobDoc.jobId;
    }

    if(!stepNumber) {
      stepNumber = 1;
    }

    const flowStep = theFlow.steps[stepNumber];
    if(!flowStep) {
      this.datahub.debug.log({message: 'Step '+stepNumber+' for the flow: '+flowName+' could not be found.', type: 'error'});
      throw Error('Step '+stepNumber+' for the flow: '+flowName+' could not be found.');
    }
    const stepDefinition = this.stepDefinition.getStepDefinitionByNameAndType(flowStep.stepDefinitionName, flowStep.stepDefinitionType);

    const stepExecutionContext = new StepExecutionContext(theFlow, stepNumber, stepDefinition, jobId, options);
    const combinedOptions = stepExecutionContext.combinedOptions;

    this.datahub.prov.granularityLevel(combinedOptions.provenanceGranularityLevel);

    if (!(combinedOptions.noBatchWrite || combinedOptions.disableJobOutput)) {
      const flowStepWithOptions = Object.assign({}, flowStep,
        {"options": Object.assign({}, flowStep.options, combinedOptions)}
      );
      let batchDoc = jobs.createBatch(jobDoc, flowStepWithOptions, stepNumber);
      stepExecutionContext.batchId = batchDoc.batch.batchId;
    }

    if (this.datahub.flow) {
      //clone and remove flow to avoid circular references
      this.datahub = this.cloneInstance(this.datahub);
      delete this.datahub.flow;
    }

    const items = contentArray.map(contentItem => contentItem.uri);
    if (this.isContextDB(stepExecutionContext.getSourceDatabase()) && !combinedOptions.stepUpdate) {
      this.runStep(stepExecutionContext, contentArray);
    } else {
      const flowInstance = this;
      xdmp.invoke(
        '/data-hub/5/impl/invoke-step.sjs',
        {flowInstance, stepExecutionContext, contentArray},
        {
          database: xdmp.database(stepExecutionContext.getSourceDatabase()),
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
        const configCollections = [
          options.collections,
          ((flowStep.options || {}).collections || (stepDefinition.options || {}).collections),
          (theFlow.options || {}).collections
        ].reduce((previousValue, currentValue) => (previousValue || []).concat((currentValue || [])))
          // filter out any null/empty collections that may exist
          .filter((col) => !!col);

        const targetDatabase = stepExecutionContext.getTargetDatabase();
        writeTransactionInfo = this.flowUtils.writeContentArray(
          this.writeQueue.getContentArray(targetDatabase), targetDatabase, configCollections
        );
      } catch (e) {
        this.handleWriteError(this, stepExecutionContext, e);
      }
    }

    this.writeProvenanceData(stepExecutionContext);
    this.updateBatchDocument(stepExecutionContext, items, writeTransactionInfo);

    let resp = {
      "jobId": stepExecutionContext.jobId,
      // using failed/completed items length instead of content length since a step can create more or less documents than were passed to the step
      "totalCount": stepExecutionContext.failedItems.length + stepExecutionContext.completedItems.length,
      "errorCount": stepExecutionContext.failedItems.length,
      "completedItems": stepExecutionContext.completedItems,
      "failedItems": stepExecutionContext.failedItems,
      "errors": stepExecutionContext.batchErrors
    };
    if (combinedOptions.fullOutput) {
      resp.documents = this.writeQueue.getContentArray(stepExecutionContext.getTargetDatabase());
    }
    if (this.datahub.performance.performanceMetricsOn()) {
      resp.performanceMetrics = this.datahub.performance.stepMetrics;
    }

    this.writeQueue = new WriteQueue();
    return resp;
  }

  /**
   *
   * @param stepExecutionContext
   * @param content
   */
  runStep(stepExecutionContext, content) {
    const stepNumber = stepExecutionContext.stepNumber;
    const flowName = stepExecutionContext.flow.name;

    // The array will be empty in case an interceptor failed
    const outputContentArray = flowRunner.processContentWithStep(stepExecutionContext, content, null);
    const databaseName = stepExecutionContext.getTargetDatabase();
    outputContentArray.forEach(contentObject => {
      this.writeQueue.addContent(databaseName, contentObject, flowName, stepNumber);
    });
  }

  cloneInstance(instance) {
    let prototype = Object.getPrototypeOf(instance);
    let keys = Object.getOwnPropertyNames(instance).concat(Object.getOwnPropertyNames(prototype));
    let newInstance = {};
    for (let key of keys) {
      newInstance[key] = instance[key];
    }
    return newInstance;
  }

  handleWriteError(flowInstance, stepExecutionContext, error) {
    stepExecutionContext.setCompletedItems([]);
    const failedItems = flowInstance.writeQueue.getContentUris(stepExecutionContext.getTargetDatabase());
    stepExecutionContext.setFailedItems(failedItems);

    const operation = error.stackFrames && error.stackFrames[0] && error.stackFrames[0].operation;
    let uri;
    // see if we can determine a uri based off the operation in the stackFrames
    if (operation) {
      uri = failedItems.find(uri => operation.includes(`"${uri}"`));
    }

    // Directly add this to avoid the failedItems count from being incremented
    stepExecutionContext.batchErrors.push(Object.assign(error, {"uri":uri}));
  }

  /**
   * Updates the batch document based on what's in the stepExecutionContext. This doesn't care about interceptors at all,
   * as those don't have any impact on the "items" that were the input to this transaction.
   *
   * @param stepExecutionContext
   * @param items
   * @param writeTransactionInfo
   */
  updateBatchDocument(stepExecutionContext, items, writeTransactionInfo) {
    const combinedOptions = stepExecutionContext.combinedOptions;
    if (!combinedOptions.noBatchWrite && !combinedOptions.disableJobOutput) {
      jobs.updateBatch(stepExecutionContext, items, writeTransactionInfo);
    }
  }

  /**
   * Writes provenance data based on what's in the writeQueue.
   *
   * @param stepExecutionContext
   */
  writeProvenanceData(stepExecutionContext) {
    const jobId = stepExecutionContext.jobId;
    const flowName = stepExecutionContext.flow.name;
    const stepDefinition = stepExecutionContext.stepDefinition;
    const flowStep = stepExecutionContext.flowStep;

    const prov = this.datahub.prov;
    if (stepExecutionContext.completedItems.length && prov.granularityLevel() !== prov.OFF_LEVEL) {
      const stepDefTypeLowerCase = (stepDefinition.type) ? stepDefinition.type.toLowerCase(): stepDefinition.type;
      const stepName = flowStep.name || flowStep.stepDefinitionName;
      const contentArray = this.writeQueue.getContentArray(stepExecutionContext.getTargetDatabase());
      for (let content of contentArray) {
        // We may want to hide some documents from provenance. e.g., we don't need provenance of mastering PROV documents
        if (content.provenance !== false) {
          const previousUris = hubUtils.normalizeToArray(content.previousUri || content.uri);
          const info = {
            derivedFrom: previousUris,
            influencedBy: stepName,
            status: (stepDefTypeLowerCase === 'ingestion') ? 'created' : 'updated',
            metadata: {}
          };

          const isFineGranularity = prov.granularityLevel() === prov.FINE_LEVEL;
          const isMappingStep = flowStep.stepDefinitionName === "entity-services-mapping";

          if (isFineGranularity && isMappingStep) {
            xdmp.trace(this.datahub.consts.TRACE_FLOW_RUNNER, `'provenanceGranularityLevel' for step '${flowStep.name}' is set to 'fine'. This is not supported for mapping steps. Coarse provenance data will be generated instead.`);
          }

          const provResult = isFineGranularity && !isMappingStep && content.provenance ?
            this.buildFineProvenanceData(jobId, flowName, stepName, flowStep.stepDefinitionName, stepDefTypeLowerCase, content, info) :
            prov.createStepRecord(jobId, flowName, stepName, flowStep.stepDefinitionName, stepDefTypeLowerCase, content.uri, info);

          if (provResult instanceof Error) {
            this.datahub.debug.log({message: provResult.message, type: 'error'});
          }
        }
      }
      this.datahub.prov.commit();
    }
  }

  buildFineProvenanceData(jobId, flowName, stepName, stepDefName, stepDefType, content, info) {
    let previousUris = fn.distinctValues(Sequence.from([Sequence.from(Object.keys(content.provenance)),Sequence.from(info.derivedFrom)]));
    let prov = this.datahub.prov;
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
}

module.exports = Flow;
