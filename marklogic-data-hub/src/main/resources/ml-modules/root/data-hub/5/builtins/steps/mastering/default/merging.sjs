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
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const merger = require("/data-hub/5/mastering/merging/merger.sjs");
const masteringStepLib = require("/data-hub/5/builtins/steps/mastering/default/lib.sjs");
const {Mergeable} = require("/data-hub/5/mastering/merging/mergeable.sjs");

const quickStartRequiredOptionProperty = 'mergeOptions';
const hubCentralRequiredOptionProperty = 'mergeRules';
const requiredOptionProperties = [[quickStartRequiredOptionProperty, hubCentralRequiredOptionProperty]];

const queryHashPredicate = sem.iri("http://marklogic.com/data-hub/mastering#hasMatchingHash");

function main(content, options, stepExecutionContext) {

  // These index references can't be out this function scope or the jobReport will error, since they don't exist for the jobs DB
  if (options.stepId) {
    const stepDoc = fn.head(cts.search(cts.andQuery([
      cts.collectionQuery("http://marklogic.com/data-hub/steps"),
      cts.jsonPropertyValueQuery("stepId", options.stepId, "case-insensitive")
    ])));
    if (stepDoc) {
      options = stepDoc.toObject();
    } else {
      httpUtils.throwBadRequestWithArray([`Could not find step with stepId ${options.stepId}`]);
    }
  }

  const mergeOptions = options.mergeOptions || options;
  mergeOptions.targetEntityType = mergeOptions.targetEntityType || options.targetEntityType || options.targetEntity;
  const mergeable = new Mergeable(mergeOptions, stepExecutionContext);
  const matchingStepContentExists = !!mergeable.memoryContent;
  const urisPathReference = cts.pathReference('/matchSummary/URIsToProcess', ['type=string', 'collation=http://marklogic.com/collation/']);
  const datahubCreatedOnRef = cts.fieldReference('datahubCreatedOn', ['type=dateTime']);
  const thisMatchSummaryURI = content.uri;
  const matchSummaryCollection = `datahubMasteringMatchSummary${options.targetEntityType ? `-${options.targetEntityType}` : ''}`;
  const collectionQuery = cts.collectionQuery(matchSummaryCollection);

  const urisToProcess = [];

  let thisMatchSummary = content.value ? content.value : cts.doc(thisMatchSummaryURI);
  if (!(thisMatchSummary && thisMatchSummary.root.matchSummary)) {
    return [];
  }
  thisMatchSummary = thisMatchSummary.toObject();
  let theseURIsToProcess = thisMatchSummary.matchSummary.URIsToProcess;

  for (let uriToProcess of theseURIsToProcess) {
    // If we found matching step content, then we're running connected steps, and we don't care about any
    // other match summaries (and we likely only have 1, as a matching step just ran and produced 1 summary).
    if (!matchingStepContentExists) {
      // don't process this "URIsToProcess" URI unless we are processing the last matchSummary document
      // (in URI order) that contains it
      let lastSummaryWithURI = cts.uris(null, ["descending", "limit=1", "score-zero"],
        cts.pathRangeQuery("/matchSummary/URIsToProcess", "=" , uriToProcess, ['score-function=zero'], 0), 0);
      if (lastSummaryWithURI != thisMatchSummaryURI) {
        continue;
      }
    }

    let uriActionDetails = thisMatchSummary.matchSummary.actionDetails[uriToProcess];
    const searchForAdditionalDetails = uriActionDetails && (uriActionDetails.uris || uriActionDetails.hashes);
    // If the action is merge, ensure we create the merge with the most URIs
    if (searchForAdditionalDetails) {
      const urisQuery = (uriActionDetails.uris && uriActionDetails.uris.length) ? cts.pathRangeQuery('/matchSummary/actionDetails/*/uris', '=', uriActionDetails.uris, ['score-function=zero'], 0): null;
      const positiveQuery =
        cts.andQuery([
          cts.jsonPropertyValueQuery('action', 'merge'),
          urisQuery,
          collectionQuery
        ]);
      const detailsXPath = `/matchSummary/actionDetails/*[action = '${uriActionDetails.action}']`;
      const otherMergesForURI =
        cts.search(
          cts.andNotQuery(
            positiveQuery,
            cts.rangeQuery(urisPathReference, '=', uriToProcess, ['score-function=zero'], 0)
          ),
          ['unfiltered',cts.indexOrder(datahubCreatedOnRef, 'descending'), 'score-zero'],
          0
        ).toArray()
          // get the actionNode for the URI
          .map(
            (result) => result.xpath(detailsXPath).toArray()
              .filter((actionNode) => cts.contains(actionNode, urisQuery))[0]
          )
          // filter out false positives that don't have merge actions for the given URI
          .filter((actionNode) => !!actionNode)
          // convert node to JSON object
          .map((actionNode) => {
            const uriToActOn = fn.string(fn.nodeName(actionNode));
            const actionNodeObj = actionNode.toObject();
            actionNodeObj.uriToActOn = uriToActOn;
            return actionNodeObj;
          });
      if (otherMergesForURI.some((otherMerge) => otherMerge.uris.length > uriActionDetails.uris.length || (otherMerge.uris.length === uriActionDetails.uris.length && otherMerge.uriToActOn.localeCompare(uriToProcess) < 0))) {
        continue;
      }
      otherMergesForURI.forEach((actionDetails) => actionDetails.uris.forEach(
        (uri) => {
          if (!uriActionDetails.uris.includes(uri)) {
            uriActionDetails.uris.push(uri);
          }
        }
      ));
    }
    urisToProcess.push(uriToProcess);
  }
  let results = [];
  if (urisToProcess.length) {
    results = merger.buildContentObjectsFromMatchSummary(
        urisToProcess,
        thisMatchSummary,
        mergeable,
        stepExecutionContext != null ? stepExecutionContext.fineProvenanceIsEnabled() : false
    );  
  }

  content["$delete"] = true;
  results.push(content);
  applyPermissionsFromOptions(results, options);
  return results;
}

function applyPermissionsFromOptions(results, options) {
  if (options.permissions) {
    const parsedPermissions = hubUtils.parsePermissions(options.permissions);
    for (var result of results) {
      if (result['$delete'] == true) {
        continue;
      }
      if (result.context) {
        result.context.permissions = parsedPermissions;
      } else {
        result.context = {
          permissions: parsedPermissions
        };
      }

      result.context.permissions = result.context.permissions.concat(xdmp.defaultPermissions());
    }
  }
}

function jobReport(jobID, stepResponse, options, outputContentArray) {
  return masteringStepLib.jobReport(jobID, stepResponse, options, outputContentArray, requiredOptionProperties);
}

module.exports = {
  main,
  jobReport,
  applyPermissionsFromOptions
};
