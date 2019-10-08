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
const ps = require('/MarkLogic/provenance');
const op = require('/MarkLogic/optic');

function matchDetailsByMergedQuery(mergedQuery) {
  let mergedURIs = cts.uris(null, [], mergedQuery);
  let output = {};
  datahub.hubUtils.queryLatest(
    function () {
      for (let docURI of mergedURIs) {
        let match = {
          attributes: {
            destination: docURI
          }
        };
        let out = {
          dateTime: '?',              // date and time record was recorded
          attributes: {'destination': '?', 'matchedDocuments': '?'}
        };
        let kvPattern = ps.opTriplePattern(match, out);
        let result = op.fromTriples(kvPattern).result().toArray()[0];
        output[docURI] = result && result.matchedDocuments  ? xdmp.unquote(result.matchedDocuments) : null;
      }
    },
    datahub.config.JOBDATABASE
  );
  return output;
}

module.exports = {
  matchDetailsByMergedQuery
};
