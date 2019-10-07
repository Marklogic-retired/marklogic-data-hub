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
const masteringMainStep = require("/data-hub/5/builtins/steps/mastering/default/main.sjs");
const requiredOptionProperties = ['matchOptions'];
const emptySequence = Sequence.from([]);

function main(content, options) {
  masteringMainStep.checkOptions(null, options, null, requiredOptionProperties);
  let matchOptions = new NodeBuilder().addNode({ options: options.matchOptions }).toNode();
  let matchSummaryJson = mastering.buildMatchSummary(
    content,
    matchOptions,
    options.filterQuery ? cts.query(options.filterQuery) : cts.trueQuery(),
    datahub.prov.granularityLevel() === datahub.prov.FINE_LEVEL
  );
  let collections = ['datahubMasteringMatchSummary'];
  if (options.targetEntity) {
    collections.push(`datahubMasteringMatchSummary-${options.targetEntity}`);
  }
  return {
    uri: `/datahub/5/mastering/match-summary/${sem.uuidString()}.json`,
    value: matchSummaryJson,
    context: {
      collections
    }
  };
}

module.exports = {
  main
};
