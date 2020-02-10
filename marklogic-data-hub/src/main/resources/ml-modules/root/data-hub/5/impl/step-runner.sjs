'use strict';

const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");

class StepRunner {

  runSteps(workUnit, endpointState) {
    const flowName = workUnit.flowName;
    const stepNumber = workUnit.steps[0];
    const options = workUnit.options ? workUnit.options : {};
    const jobId = workUnit.jobId ? workUnit.jobId : endpointState.jobId;

    const datahub = DataHubSingleton.instance({
      performanceMetrics: !!options.performanceMetrics
    });

    const filterQuery = endpointState.lastProcessedItem ?
      cts.rangeQuery(cts.uriReference(), ">", endpointState.lastProcessedItem) :
      null;

    options.contentDescriptorLimit = workUnit.batchSize ? workUnit.batchSize : 100;

    const content = datahub.flow.findMatchingContent(flowName, stepNumber, options, filterQuery);

    if (content == null || content.length < 1) {
      // Returning null indicates that there are no items left to be processed by this step
      null;
    } else {
      endpointState.lastProcessedItem = content[content.length - 1].uri;
      const batchResponse = datahub.flow.runFlow(flowName, jobId, content, options, stepNumber);
      endpointState.jobId = batchResponse.jobId;
      return Sequence.from([endpointState, batchResponse]);
    }
  }
}

module.exports = StepRunner;
