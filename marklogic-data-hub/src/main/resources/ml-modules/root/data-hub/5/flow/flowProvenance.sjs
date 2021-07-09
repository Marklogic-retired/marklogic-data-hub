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

/**
 * This module contains functions that used to be in data-hub/5/impl/flow.sjs, but they needed to be reused by
 * flowRunner.sjs without having to instantiate a "Flow" object. If you need to see the history of the logic in here,
 * please look at the version history of the flow.sjs file.
 */

const consts = require("/data-hub/5/impl/consts.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const provLib = require("/data-hub/5/impl/prov.sjs");


/**
 * Generates and writes provenance records based on the given content array.
 *
 * @param stepExecutionContext
 * @param outputContentArray
 */
function writeProvenanceData(stepExecutionContext, outputContentArray) {
  queueProvenanceData(stepExecutionContext, outputContentArray);
  provLib.commit();
}

/**
 * Adds provenance records to the given provLib object, which is expected to be an instance of the Provenance class.
 *
 * @param stepExecutionContext
 * @param outputContentArray
 */
function queueProvenanceData(stepExecutionContext, outputContentArray) {
  const jobId = stepExecutionContext.jobId;
  const flowName = stepExecutionContext.flow.name;
  const stepDefinition = stepExecutionContext.stepDefinition;
  const flowStep = stepExecutionContext.flowStep;
  // This is a temporary runtime option to enable the updated record provenance until it becomes the default
  const latestProvenance = stepExecutionContext.combinedOptions.latestProvenance;

  if (xdmp.traceEnabled(consts.TRACE_FLOW)) {
    hubUtils.hubTrace(consts.TRACE_FLOW, `Generating provenance records for ${stepExecutionContext.describe()}`);
  }

  const stepDefTypeLowerCase = (stepDefinition.type) ? stepDefinition.type.toLowerCase() : stepDefinition.type;
  const stepName = flowStep.name || flowStep.stepDefinitionName;
  for (let content of outputContentArray) {
    // We may want to hide some documents from provenance. e.g., we don't need provenance of mastering PROV documents
    if (content.provenance !== false) {
      const previousUris = hubUtils.normalizeToArray(content.previousUri || content.uri);
      const info = {
        derivedFrom: previousUris,
        influencedBy: latestProvenance ? `step:${stepName}` : stepName,
        status: (stepDefTypeLowerCase === 'ingestion') ? 'created' : 'updated',
        metadata: {}
      };

      const isFineGranularity = stepExecutionContext.fineProvenanceIsEnabled();
      const isMappingStep = flowStep.stepDefinitionName === "entity-services-mapping";

      if (isFineGranularity && isMappingStep) {
        hubUtils.hubTrace(consts.TRACE_FLOW, `'provenanceGranularityLevel' for step '${flowStep.name}' is set to 'fine'. This is not supported for mapping steps. Coarse provenance data will be generated instead.`);
      }

      let provResult;
      if (isFineGranularity && !isMappingStep && content.provenance) {
        provResult = buildFineProvenanceData(jobId, flowName, stepName, flowStep.stepDefinitionName, stepDefTypeLowerCase, content, info);
      } else if (latestProvenance) {
        provResult = provLib.buildRecordEntity(stepExecutionContext, content, [], info);
      } else {
        provResult = provLib.createStepRecord(jobId, flowName, stepName, flowStep.stepDefinitionName, stepDefTypeLowerCase, content.uri, info);
      }

      if (provResult instanceof Error) {
        hubUtils.error(provResult.message);
      }
    }
  }
}

function buildFineProvenanceData(jobId, flowName, stepName, stepDefName, stepDefType, content, info) {
  let previousUris = fn.distinctValues(Sequence.from([Sequence.from(Object.keys(content.provenance)), Sequence.from(info.derivedFrom)]));
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
      let docPropRecords = provLib.createStepPropertyRecords(jobId, flowName, stepName, stepDefName, stepDefType, prevUri, docProperties, info);
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
    let newPropertyProvID = provLib.createStepPropertyAlterationRecord(jobId, flowName, stepName, stepDefName, stepDefType, prop, docProvDocumentIDs, docProvPropertyIDs, propInfo);
    newPropertyProvIDs.push(newPropertyProvID);
  }

  // Now create the merged document record from both the original document records & the merged property records
  return provLib.createStepDocumentAlterationRecord(jobId, flowName, stepName, stepDefName, stepDefType, newDocURI, docProvIDs, newPropertyProvIDs, info);
}

module.exports = {
  queueProvenanceData,
  writeProvenanceData
}
