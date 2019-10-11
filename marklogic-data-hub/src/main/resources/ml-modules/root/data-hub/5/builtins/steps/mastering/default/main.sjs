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
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const mastering = require("/com.marklogic.smart-mastering/process-records.xqy");
const masteringStepLib = require("/data-hub/5/builtins/steps/mastering/default/lib.sjs");
const requiredOptionProperties = ['matchOptions', 'mergeOptions'];
const emptySequence = Sequence.from([]);

function main(content, options) {
  const filteredContent = [];
  masteringStepLib.checkOptions(content, options, filteredContent);
  let mergeOptions = new NodeBuilder().addNode({ options: options.mergeOptions }).toNode();
  let matchOptions = new NodeBuilder().addNode({ options: options.matchOptions }).toNode();
  // Data Hub will persist the results for us.
  let persistResults = false;
  if (filteredContent.length) {
    return mastering.processMatchAndMergeWithOptions(
      Sequence.from(filteredContent),
      mergeOptions,
      matchOptions,
      options.filterQuery ? cts.query(options.filterQuery) : cts.trueQuery(),
      persistResults,
      datahub.prov.granularityLevel() === datahub.prov.FINE_LEVEL
    );
  } else {
    return emptySequence;
  }
}



function jobReport(jobID, stepResponse, options) {
   return masteringStepLib.jobReport(jobID, stepResponse, options, requiredOptionProperties);
}

module.exports = {
  main,
  jobReport
};
