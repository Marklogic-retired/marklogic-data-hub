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

import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import core from "/data-hub/5/artifacts/core.mjs";
import common from "/data-hub/5/mastering/common.mjs";
import {Matchable} from "/data-hub/5/mastering/matching/matchable.mjs";
import matcher from "/data-hub/5/mastering/matching/matcher.mjs";
const hent = require("/data-hub/5/impl/hub-entities.xqy");

const {populateContentObjects, getContentObject} = common;

const previewMatchingActivityLib = require("/data-hub/5/mastering/preview-matching-activity-lib.xqy");

const stepName = external.stepName;
const sampleSize = external.sampleSize || 100;
const restrictToUris = external.restrictToUris;
const uris = external.uris && (restrictToUris || external.uris.length > 0) ? external.uris: null;
const nonMatches = external.nonMatches;

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-match-merge", "execute");


const step = core.getArtifact("matching", stepName);

const sourceQuery = hubUtils.evalInDatabase(step.sourceQuery, step.sourceDatabase);

let resultFunction = function() {
  if (nonMatches) {
    const minMatchRuleWeight = step.matchRulesets
      .map(matchRuleset => matchRuleset.weight || 1)
      .reduce((minWeight, currentWeight) => minWeight > currentWeight ? currentWeight: minWeight, 1);
    step.thresholds.push({
      thresholdName: "Not Matched",
      action: "none",
      score: minMatchRuleWeight
    });
  }
  
  const allUris = new Set();
  const encounteredPairs = new Set();
  const matchable = new Matchable(step);
  
  let pairCount = 0;
  const output = [];
  const maxPages = uris && uris.length >= 0 ? 1: 5;
  const originalFilterQuery = step.filterQuery;
  for (let i = 0; i < maxPages; i++) {
    const urisSelection = uris ? uris: cts.uris(null, ["score-zero", "concurrent", `skip=${sampleSize * i}`, `truncate=${sampleSize}`], sourceQuery, 0);
    if (!urisSelection || fn.empty(urisSelection)) {
      break;
    }
    populateContentObjects(urisSelection);
    const urisQuery = cts.documentQuery(urisSelection);

    if (restrictToUris) {
      step.filterQuery = originalFilterQuery ? cts.andQuery([cts.query(originalFilterQuery), urisQuery]) : urisQuery;
    }
    const content = Sequence.from(hubUtils.queryToContentDescriptorArray(urisQuery));
    const results = fn.exists(content) ? matcher.buildMatchSummary(matchable, content)[0]: {matchSummary: {actionDetails: {}}};
    for (const [actionUri,  actionDetails] of Object.entries(results.matchSummary.actionDetails)) {
      if (nonMatches && actionDetails.thresholdName !== "Not Matched") {
        continue;
      }
      const uris = actionDetails.uris;
      uris.forEach(uri => allUris.add(uri));
      populateContentObjects(uris);
      let comparingUri = actionDetails.uris[0];
      const referenceMatchResult = actionDetails.matchResults.find(matchingResult => matchingResult.score === "referenceDocument");
      if (referenceMatchResult && referenceMatchResult.uri) {
        comparingUri = referenceMatchResult.uri;
      }
      for (const matchingResult of actionDetails.matchResults) {
        const pairKey = [matchingResult.uri, comparingUri].sort().join(":");
        if (matchingResult.uri === comparingUri || encounteredPairs.has(pairKey)) {
          continue;
        }
        encounteredPairs.add(pairKey);
        output.push({
          name: actionDetails.thresholdName,
          action: actionDetails.action,
          score: matchingResult.score,
          uris: [comparingUri, matchingResult.uri],
          matchRulesets: matchingResult.matchedRulesets.map(matched => matched.rulesetName)
        });
        if (++pairCount === sampleSize) {
          break;
        }
      }
      if (pairCount === sampleSize) {
        break;
      }
    }
    if (pairCount >= sampleSize) {
      break;
    }
  }
  return {
    sampleSize,
    uris,
    primaryKeys: hent.findEntityIdentifiers(Sequence.from(allUris), step.targetEntityType),
    actionPreview: output.sort((a, b) => b.score - a.score)
  };
};

if (!step.sourceDatabase || xdmp.database() === xdmp.database(step.sourceDatabase)) {
  resultFunction();
} else {
  hubUtils.invokeFunction(resultFunction, step.sourceDatabase);
}
