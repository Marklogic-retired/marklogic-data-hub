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

const config = require("/com.marklogic.hub/config.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const jobs = require("/data-hub/5/impl/jobs.sjs");

/**
 * Encapsulates a Batch object and provides convenience operations for updating the object and persisting it
 * to the jobs database.
 */
class Batch {

  constructor(jobId, flowName) {
    const timestamp = xdmp.requestTimestamp() ? xdmp.timestampToWallclock(xdmp.requestTimestamp()) : fn.currentDateTime();
    this.data = {
      batch: {
        jobId,
        batchId: sem.uuidString(),
        flowName,
        timeStarted: fn.currentDateTime(),
        hostName: xdmp.hostName(),
        reqTimeStamp: timestamp,
        reqTrnxID: xdmp.transaction()
      }
    }
  }

  /**
   * 
   * @param writeInfos For connected steps, this can be an array of zero to many writeInfo objects
   */
  persist(writeInfos) {
    if (!this.data.batch.timeEnded) {
      this.data.batch.timeEnded = fn.currentDateTime().add(xdmp.elapsedTime());
    }

    if (writeInfos && writeInfos.length > 0) {
      this.data.batch.writeTransactions = writeInfos;
    }

    const batchUri = "/jobs/batches/" + this.data.batch.batchId + ".json";
    if (xdmp.traceEnabled(consts.TRACE_FLOW_RUNNER)) {
      hubUtils.hubTrace(consts.TRACE_FLOW_RUNNER, `Inserting batch document with URI '${batchUri}'`);
    }
    hubUtils.writeDocument(batchUri, this.data, jobs.buildJobPermissions(), ['Jobs','Batch'], config.JOBDATABASE);
  }

  getBatchObject() {
    return this.data;
  }

  addStepResult(stepExecutionContext, batchItems) {
    const stepResult = {};
    this._addStepSecificData(stepResult, stepExecutionContext, batchItems);
    stepResult.stepStartDateTime = stepExecutionContext.startDateTime;
    stepResult.stepEndDateTime = fn.currentDateTime().add(xdmp.elapsedTime());
    if (!this.data.batch.stepResults) {
      this.data.batch.stepResults = [stepResult];
    } else {
      this.data.batch.stepResults.push(stepResult);
    }
  }

  /**
   * Intended for independent steps.
   * 
   * @param stepExecutionContext
   * @param batchItems 
   * @param writeTransactionInfo 
   */
  addSingleStepResult(stepExecutionContext, batchItems, writeTransactionInfo) {
    const batch = this.data.batch;
    this._addStepSecificData(batch, stepExecutionContext, batchItems);
    batch.timeEnded = fn.currentDateTime().add(xdmp.elapsedTime());
    batch.writeTimeStamp = writeTransactionInfo.transactionDateTime;
    batch.writeTrnxID = writeTransactionInfo.transactionId;
  }

  /**
   * 
   * @param target expected to be a Batch object or a step result object (for connected steps)
   * @param stepExecutionContext 
   * @param batchItems 
   */
  _addStepSecificData(target, stepExecutionContext, batchItems) {
    const flowStep = stepExecutionContext.flowStep;
    const stepId = flowStep.stepId ? flowStep.stepId : flowStep.name + "-" + flowStep.stepDefinitionType;
    const batchStatus = stepExecutionContext.getBatchStatus();

    // Per DHFPROD-2445, ensure that runtime options are included
    const flowStepWithOptions = Object.assign({}, flowStep,
      { "options": Object.assign({}, flowStep.options, stepExecutionContext.combinedOptions) }
    );

    // uris are deleted; they will exist when they're passed from the Java FlowRunner via options
    // (which is really a misuse of options); we don't need them saved because the Batch doc will save them elsewhere
    if (flowStepWithOptions.options) {
      delete flowStepWithOptions.options.uris;
    }

    target.stepId = stepId;
    target.step = flowStepWithOptions;
    target.stepNumber = stepExecutionContext.stepNumber;
    target.batchStatus = batchStatus;
    target.uris = batchItems;

    // Only store this if the step wants it, so as to avoid storing this indexed data for steps that don't need it
    if (String(stepExecutionContext.combinedOptions.enableExcludeAlreadyProcessed) === "true") {
      // stepId is lower-cased as DHF 5 doesn't guarantee that a step type is lower or upper case
      const prefix = stepExecutionContext.flow.name + "|" + fn.lowerCase(stepId) + "|" + batchStatus + "|";
      target.processedItemHashes = batchItems.map(item => xdmp.hash64(prefix + item));
    }

    const firstError = stepExecutionContext.batchErrors.length ? stepExecutionContext.batchErrors[0] : null;
    if (firstError) {
      // Sometimes we don't get the stackFrames
      if (firstError.stackFrames) {
        let stackTraceObj = firstError.stackFrames[0];
        target.fileName = stackTraceObj.uri;
        target.lineNumber = stackTraceObj.line;
      }
      // If we don't get stackFrames, see if we can get the stack
      else if (firstError.stack) {
        target.errorStack = firstError.stack;
      }
      target.error = `${firstError.name || firstError.code}: ${firstError.message}`;
      // Include the complete error so that this module doesn't have to have knowledge of everything that a step or flow
      // may add to the error, such as the URI of the failed document
      target.completeError = firstError;
    }

  }
}

module.exports = Batch;