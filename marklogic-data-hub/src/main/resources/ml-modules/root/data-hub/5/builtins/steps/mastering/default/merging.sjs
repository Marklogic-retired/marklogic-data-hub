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
 const mastering = require("/com.marklogic.smart-mastering/process-records.xqy");
const masteringStepLib = require("/data-hub/5/builtins/steps/mastering/default/lib.sjs");
const utilImpl = require("/com.marklogic.smart-mastering/impl/util.xqy");

const quickStartRequiredOptionProperty = 'mergeOptions';
const hubCentralRequiredOptionProperty = 'mergeRules';
const requiredOptionProperties = [[quickStartRequiredOptionProperty, hubCentralRequiredOptionProperty]];

function main(content, options, stepExecutionContext) {

  let matchingStepContentExists = false;
  if (stepExecutionContext != null && stepExecutionContext.flowExecutionContext != null) {
    const contentArray = stepExecutionContext.flowExecutionContext.matchingStepContentArray;
    if (contentArray && Array.isArray(contentArray)) {
      matchingStepContentExists = true;
      addMatchingStepContentToCache(contentArray);
    }
  }

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
  
  const urisPathReference = cts.pathReference('/matchSummary/URIsToProcess', ['type=string', 'collation=http://marklogic.com/collation/']);
  const datahubCreatedOnRef = cts.fieldReference('datahubCreatedOn', ['type=dateTime']);
  const thisMatchSummaryURI = content.uri;
  masteringStepLib.checkOptions(null, options, null, requiredOptionProperties);
  const matchSummaryCollection = `datahubMasteringMatchSummary${options.targetEntityType ? `-${options.targetEntityType}` : ''}`;
  const collectionQuery = cts.collectionQuery(matchSummaryCollection);

  const urisToProcess = [];

  let thisMatchSummary = content.value ? content.value : cts.doc(thisMatchSummaryURI);
  if (!thisMatchSummary) {
    xdmp.log(`matchSummary '${thisMatchSummaryURI}' not found`);
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
      let lastSummaryWithURI = cts.uris(null, ["descending", "limit=1"],
        cts.pathRangeQuery("/matchSummary/URIsToProcess", "=" , uriToProcess));
      if (lastSummaryWithURI != thisMatchSummaryURI) {
        continue;
      }
    }

    let uriActionDetails = thisMatchSummary.matchSummary.actionDetails[uriToProcess];
    // If the action is merge, ensure we create the merge with the most URIs
    if (uriActionDetails && uriActionDetails.action === 'merge') {
      const urisQuery = cts.pathRangeQuery('/matchSummary/actionDetails/*/uris', '=', uriActionDetails.uris)
      const positiveQuery =
        cts.andQuery([
          cts.jsonPropertyValueQuery('action', 'merge'),
          urisQuery,
          collectionQuery
        ]);
      const otherMergesForURI =
        cts.search(
          cts.andNotQuery(
            positiveQuery,
            cts.rangeQuery(urisPathReference, '=', uriToProcess)
          ),
          ['unfiltered',cts.indexOrder(datahubCreatedOnRef, 'descending')]
        ).toArray()
          // get the actionNode for the URI
          .map(
            (result) => result.xpath(`/matchSummary/actionDetails/*[action = 'merge']`).toArray()
              .filter((actionNode) => cts.contains(actionNode, urisQuery))[0]
          )
          // filter out false positives that don't have merge actions for the given URI
          .filter((actionNode) => !!actionNode)
          // convert node to JSON object
          .map((actionNode) => actionNode.toObject());
      if (otherMergesForURI.some((otherMerge) => otherMerge.uris.length > uriActionDetails.uris.length)) {
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
    results = mastering.buildContentObjectsFromMatchSummary(
        Sequence.from(urisToProcess),
        thisMatchSummary,
        options,
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

/**
 * If matching step content exists from the flowExecutionContext, then we want to add that to the
 * "write object" catch in util.xqy so that calls to retrieve-write-object will find it, as opposed
 * to checking the database.
 * 
 * @param contentArray
 */
 function addMatchingStepContentToCache(contentArray) {
  contentArray.forEach(contentObject => {
    // Collections must be converted to a sequence so that it's handled properly in XQuery 
    if (contentObject.context && contentObject.context.collections) {
      contentObject.context.collections = Sequence.from(contentObject.context.collections);
    }
  });
  utilImpl.addAllWriteObjects(contentArray);  
}

module.exports = {
  main,
  jobReport,
  applyPermissionsFromOptions
};
