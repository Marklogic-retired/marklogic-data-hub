import consts from "/data-hub/5/impl/consts.mjs";
import common from "/data-hub/5/mastering/common.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";

const {populateContentObjects, populateExistingContentObjects, getContentObject, releaseContentObject, groupQueries, optimizeCtsQueries} = common;

const getBlocksOfUris = hubUtils.requireFunction("/com.marklogic.smart-mastering/matcher-impl/blocks-impl.xqy", "getBlocksOfUris");

const queryHashPredicate = sem.iri("http://marklogic.com/data-hub/mastering#hasMatchingHash");
const hashBelongToPredicate = sem.iri("http://marklogic.com/data-hub/mastering#belongsTo");

const fuzzyMatchHashesCollection = "http://marklogic.com/data-hub/matching/fuzzy-hashes";

const matchingDebugTraceEnabled = xdmp.traceEnabled(consts.TRACE_MATCHING_DEBUG);
const matchingTraceEnabled = xdmp.traceEnabled(consts.TRACE_MATCHING) || matchingDebugTraceEnabled;
const matchingTraceEvent = xdmp.traceEnabled(consts.TRACE_MATCHING) ? consts.TRACE_MATCHING : consts.TRACE_MATCHING_DEBUG;

/*
 * Returns a cts.query based on the document node and the array of MatchRulesetDefinition
 * @param {Node} documentNode
 * @param {[]MatchRulesetDefinition} matchRulesets
 * @return {cts.query}
 * @since 5.8.0
 */
function buildQueryFromMatchRuleset(contentObject, matchRulesets) {
  const queries = [];
  for (const matchRuleset of matchRulesets) {
    const query = matchRuleset.buildCtsQuery(contentObject);
    if (query) {
      queries.push(query);
    }
  }
  return queries.length === 0 ? null: groupQueries(queries, cts.andQuery);
}

function gatherThresholdQueryFunctions(thresholdDefinitions) {
  return thresholdDefinitions.map((def, index, array) => {
    const nextDef = array[index + 1];
    const notQuery = (nextDef) ? nextDef.minimumMatchCombinations(): null;
    const minimumCombos = def.minimumMatchCombinations();
    return (contentObject) => {
      const positiveComboQueries = minimumCombos.map(ruleset => buildQueryFromMatchRuleset(contentObject, ruleset));
      const positiveQuery = (positiveComboQueries && positiveComboQueries.length > 0) ? groupQueries(positiveComboQueries, cts.orQuery): null;
      const negativeComboQueries = (notQuery && notQuery.length > 0)  ? notQuery.map(ruleset => buildQueryFromMatchRuleset(contentObject, ruleset)): null;
      const negativeQuery = (negativeComboQueries && negativeComboQueries.length > 0) ? groupQueries(negativeComboQueries, cts.orQuery): null;
      if (negativeQuery && positiveQuery) {
        return cts.andNotQuery(
          positiveQuery,
          negativeQuery
        );
      } else {
        return positiveQuery;
      }
    };
  });
}

function addHashesToTripleArray(contentObject, matchRulesetDefinitions, triplesByUri, inMemoryTriples) {
  for (const matchRuleset of matchRulesetDefinitions) {
    const queryHashes = matchRuleset.queryHashes(contentObject);
    for (const queryHash of queryHashes) {
      let uriTriples = triplesByUri.get(contentObject.uri);
      if (!uriTriples) {
        uriTriples = [];
        triplesByUri.set(contentObject.uri, uriTriples);
      }
      const uriToHashTriple = sem.triple(contentObject.uri, queryHashPredicate, queryHash, fuzzyMatchHashesCollection);
      const hashToRulesetTriple = sem.triple(queryHash, hashBelongToPredicate, matchRuleset.name(), fuzzyMatchHashesCollection);
      inMemoryTriples.push(uriToHashTriple, hashToRulesetTriple);
      //uriTriples.push(uriToHashTriple, hashToRulesetTriple);
    }
  }
}

function getMatchingURIs(matchable, contentObject, baselineQuery, filterQuery, thresholdQueryFunctions) {
  let allMatchingBatchUris = [];

  for (const thresholdQueryFunction of thresholdQueryFunctions) {
    const thresholdQuery = thresholdQueryFunction(contentObject);
    if (!thresholdQuery) {
      continue;
    }
    const finalMatchQuery = optimizeCtsQueries(cts.andQuery([baselineQuery, filterQuery, thresholdQuery]));
    const total = cts.estimate(finalMatchQuery);
    if (matchingTraceEnabled) {
      xdmp.trace(matchingTraceEvent, `Found ${total} results for ${xdmp.describe(contentObject.value)} with query ${xdmp.describe(finalMatchQuery, Sequence.from([]), Sequence.from([]))}`);
    }
    if (total === 0) {
      break;
    }
    const maxScan = Math.min(matchable.maxScan(), total);
    let matchingUris;
    let uriOptions = ["score-zero", "concurrent", "item-order"];
    if (total > maxScan) {
      const halfMaxScan = Math.ceil(maxScan / 2);
      matchingUris = Sequence.from([
        cts.uris(contentObject.uri, uriOptions.concat([`limit=${halfMaxScan}`, "ascending"]), finalMatchQuery, 0),
        cts.uris(contentObject.uri, uriOptions.concat([`limit=${halfMaxScan}`, "descending"]), finalMatchQuery, 0)
      ]).toArray();
    } else {
      matchingUris = cts.uris(null, uriOptions, finalMatchQuery, 0).toArray();
    }
    allMatchingBatchUris = allMatchingBatchUris.concat(matchingUris);
  }
  return allMatchingBatchUris;
}

/*
 * Returns a match summary document using Matchable and an iterable set of content objects
 * @param {Matchable} matchable
 * @param {[]ContentObject} content
 * @return {Object}
 * @since 5.8.0
 */
function buildMatchSummary(matchable, content) {
  if (matchingTraceEnabled) {
    xdmp.trace(matchingTraceEvent, `Building match summary with matchable: ${xdmp.describe(matchable, Sequence.from([]), Sequence.from([]))} and content: ${xdmp.toJsonString(content)}`);
  }
  const matchRulesetDefinitions = matchable.matchRulesetDefinitions();
  const thresholdDefinitions = matchable.thresholdDefinitions().filter(def => def.action());
  const thresholdQueryFunctions = gatherThresholdQueryFunctions(thresholdDefinitions);
  const thresholdNames = thresholdDefinitions.map(def => def.name());
  const triplesByUri = new Map();
  const hashMatchInfo = {
    matchRulesetScores: matchRulesetDefinitions.reduce((scores, def) => {
      scores[def.name()] = def.reduce() ? -(fn.abs(def.weight())): def.weight();
      return scores;
    }, {}),
    thresholds: thresholdDefinitions.map((def) => def.raw())
  };

  const allUris = hubUtils.normalizeToArray(content).map((c) => c.uri);
  let urisToActOn = [];
  // prime triple cache on blocked merges
  getBlocksOfUris(Sequence.from(allUris));
  const inMemoryTriples = [];
  const allActionDetails = {};
  matchable.matchStep.dataFormat = xdmp.uriFormat(fn.head(content).uri);
  const dataFormat = matchable.matchStep.dataFormat;
  const baselineQuery = cts.registeredQuery(cts.register(matchable.baselineQuery()));
  const uriToMerged = new Map();
  populateExistingContentObjects(content);
  const useFuzzyMatching = matchRulesetDefinitions.some(def => def.fuzzyMatch());
  for (const contentObject of content) {
    // We don't want to generate hashes for mastering documents.
    if (fn.startsWith(contentObject.uri, "/com.marklogic.smart-mastering/")) {
      continue;
    }
    if (useFuzzyMatching) {
      addHashesToTripleArray(contentObject, matchRulesetDefinitions, triplesByUri, inMemoryTriples);
    }
    let documentIsMerged = false;
    const filterQuery = matchable.filterQuery(contentObject.value);
    const thresholdGroups = {};
    const allMatchingBatchUris = getMatchingURIs(matchable, contentObject, baselineQuery, filterQuery, thresholdQueryFunctions);
    const urisToSearch = allMatchingBatchUris.filter(uri => !allUris.includes(uri));
    if (urisToSearch.length > 0) {
      populateContentObjects(urisToSearch);
    }
    for (const matchingUri of allMatchingBatchUris) {
      if (dataFormat !== xdmp.uriFormat(matchingUri)) {
        continue;
      }
      const matchingContentObject = getContentObject(matchingUri);
      const score = matchable.scoreDocument(contentObject, matchingContentObject);
      let currentThresholdDefinition = null;
      for (const thresholdDefinition of thresholdDefinitions) {
        if (score >= thresholdDefinition.score()) {
          currentThresholdDefinition = thresholdDefinition;
        } else {
          break;
        }
      }
      if (matchingTraceEnabled) {
        xdmp.trace(matchingTraceEvent, `${xdmp.describe(contentObject.value)} and ${xdmp.describe(matchingContentObject.value)} placed in the threshold ${currentThresholdDefinition ? currentThresholdDefinition.name(): "null"} with score ${score}.`);
      }
      matchingContentObject.score = score;
      if (currentThresholdDefinition) {
        if (!documentIsMerged && currentThresholdDefinition.action() === "merge") {
          documentIsMerged = true;
        }
        thresholdGroups[currentThresholdDefinition.name()] = thresholdGroups[currentThresholdDefinition.name()] || [];
        thresholdGroups[currentThresholdDefinition.name()].push(matchingContentObject);
      }
    }
    for (const thresholdName of thresholdNames) {
      const matchingDocumentSet = thresholdGroups[thresholdName];
      if (matchingDocumentSet) {
        const allDocsSet = [contentObject, ...matchingDocumentSet];
        const thresholdDefinition = thresholdDefinitions.find((def) => thresholdName === def.name());
        const actionDetails = matchable.buildActionDetails(allDocsSet, thresholdDefinition);
        const actionURI = Object.keys(actionDetails)[0];
        actionDetails[actionURI].uris = actionDetails[actionURI].uris.map((uri) => uriToMerged.has(uri) ? uriToMerged.get(uri): uri);
        if (allActionDetails[actionURI]) {
          allActionDetails[actionURI].uris = allActionDetails[actionURI].uris.concat(actionDetails[actionURI].uris).filter((uri, index, uris) => index === uris.indexOf(uri) && uri !== actionURI);
        } else {
          Object.assign(allActionDetails, actionDetails);
        }
        if (thresholdDefinition.action() === "merge") {
          for (const uri of allActionDetails[actionURI].uris) {
            uriToMerged.set(uri, actionURI);
          }
        }
      }
    }
    if (!documentIsMerged) {
      urisToActOn.push(contentObject.uri);
    }
  }
  if (matchingDebugTraceEnabled) {
    xdmp.trace(consts.TRACE_MATCHING_DEBUG, `URIs mapped to merge URIs: ${JSON.stringify(uriToMerged, null, 2)}`);
  }
  urisToActOn = urisToActOn.concat(Object.keys(allActionDetails));
  const matchSummary = {
    matchSummary: {
      matchStepId: matchable.matchStep.stepId,
      matchStepName: matchable.matchStepNode.stepName,
      matchStepFlow: matchable.matchStep.flow,
      URIsToProcess: urisToActOn,
      actionDetails: allActionDetails,
      hashMatchInfo
    }
  };
  if (useFuzzyMatching) {
    addHashMatchesToMatchSummary(matchable, matchSummary, urisToActOn, inMemoryTriples);
  }
  // substitute notification URIs
  for (const actionURI of Object.keys(allActionDetails)) {
    const actionDetail = allActionDetails[actionURI];
    if (actionDetail.action === "notify") {
      actionDetail.uris = actionDetail.uris
        .map((uri) => uriToMerged.get(uri) || uri)
        .filter((uri, index, array) => array.indexOf(uri) === index && uri !== actionURI);
    }
    actionDetail.uris.forEach(releaseContentObject);
  }
  allUris.forEach(releaseContentObject);
  const output = [matchSummary];
  if (useFuzzyMatching) {
    const fuzzyMatchEntries = triplesByUri.entries();
    for (let fuzzyMatchEntry of fuzzyMatchEntries) {
      output.push({
        uri: `/matching/data-hub/fuzzy-hashes/${xdmp.hash64(fuzzyMatchEntry[0])}.json`,
        value: {
          triples: fuzzyMatchEntry[1]
        },
        context: {
          collections: [fuzzyMatchHashesCollection],
          permissions: [xdmp.permission(consts.DATA_HUB_COMMON_ROLE, "read"), xdmp.permission(consts.DATA_HUB_MATCHING_READ_ROLE, "update")]
        }
      });
    }
  }
  if (matchingTraceEnabled) {
    xdmp.trace(matchingTraceEvent, `Match summary created: ${xdmp.toJsonString(matchSummary)}`);
  }
  return output;
}

function addHashMatchesToMatchSummary(matchable, matchSummary, uris, inMemoryTriples) {
  const hashMatchInfo = matchSummary.matchSummary.hashMatchInfo;
  const actionDetails = matchSummary.matchSummary.actionDetails;
  const thresholds = hashMatchInfo.thresholds;
  const thresholdNames = hashMatchInfo.thresholds.map(threshold => threshold.thresholdName);
  const thresholdDefinitionsByName = matchable.thresholdDefinitions().reduce((definitions, def) => {
    definitions[def.name()] = def;
    return definitions;
  }, {});

  const matchRulesetScores = hashMatchInfo.matchRulesetScores;
  const results = sem.sparql(`SELECT DISTINCT ?originalUri ?matchingUri ?matchRuleset FROM <http://marklogic.com/data-hub/matching/fuzzy-hashes> WHERE {
        ?matchingUri <http://marklogic.com/data-hub/mastering#hasMatchingHash> ?uriHash.
        ?uriHash <http://marklogic.com/data-hub/mastering#belongsTo> ?matchRuleset.
        ?originalUri <http://marklogic.com/data-hub/mastering#hasMatchingHash> ?uriHash.
        FILTER (?matchingUri = $uris)
    }`, {uris}, [], [sem.inMemoryStore(inMemoryTriples), sem.store(["document"], cts.collectionQuery(fuzzyMatchHashesCollection))]).toArray().reduce((hashMatches, triple) => {
      let {originalUri, matchingUri, matchRuleset} = triple;
      originalUri = fn.string(originalUri), matchingUri = fn.string(matchingUri), matchRuleset = fn.string(matchRuleset);
      let currentHashMatch = hashMatches[originalUri];
      if (!currentHashMatch) {
        currentHashMatch = {matches: {}};
        hashMatches[originalUri] = currentHashMatch;
      }
      const uriMatches = currentHashMatch.matches;
      if (matchingUri === originalUri) {
        return hashMatches;
      }
      let match = uriMatches[matchingUri];
      if (!match) {
        match = {matchedRulesets: []};
        uriMatches[matchingUri] = match;
      }
      match.matchedRulesets.push(matchRuleset);
      return hashMatches;
    }, {});
  const contentUris = Object.keys(results);
  populateContentObjects(contentUris);
  for (const matchUri of contentUris) {
    const matches = results[matchUri];
    const currentContentObject = getContentObject(matchUri);
    if (!currentContentObject) {
      continue;
    }
    const groupByThreshold = {};
    const matchedUris = Object.keys(matches.matches);
    for (const matchedUri of matchedUris) {
      const match = matches.matches[matchedUri];
      if (!(match && match.matchedRulesets)) {
        continue;
      }
      const score = match.matchedRulesets.map(ruleset => matchRulesetScores[ruleset] || 0).reduce((sum, score) => sum + score, 0);
      let currentThreshold = null;
      for (const threshold of thresholds) {
        if (score >= threshold.score) {
          currentThreshold = threshold;
          continue;
        }
        break;
      }
      if (currentThreshold) {
        groupByThreshold[currentThreshold.thresholdName] = groupByThreshold[currentThreshold.thresholdName] || [];
        groupByThreshold[currentThreshold.thresholdName].push(matchedUri);
        if (currentThreshold.action === "merge") {
          const matchedUriIndex = uris.indexOf(matchedUri);
          if (matchedUriIndex >= 0) {
            uris.splice(matchedUriIndex, 1);
          }
        }
      }
    }
    const additionalUris = [];
    for (const thresholdName of thresholdNames) {
      if (groupByThreshold[thresholdName]) {
        additionalUris.push(...groupByThreshold[thresholdName]);
      }
    }
    populateContentObjects(additionalUris);
    for (const thresholdName of thresholdNames) {
      let existingDetails = actionDetails[matchUri];
      let thresholdMatches = groupByThreshold[thresholdName];
      if (!thresholdMatches) {
        continue;
      }
      const thresholdDefinition = thresholdDefinitionsByName[thresholdName];
      const matchDocSet = [matchUri, ...thresholdMatches].map((uri) => getContentObject(uri)).filter((content) => {
        return content && (matchable.scoreDocument(currentContentObject, content) >= thresholdDefinition.score());
      });
      thresholdMatches = matchDocSet.map(content => content.uri);
      if (thresholdMatches.length === 0) {
        continue;
      }
      const threshold = thresholdDefinition.raw();
      if (threshold.action === "merge") {
        const matchedUriIndex = uris.indexOf(matchUri);
        if (matchedUriIndex >= 0) {
          uris.splice(matchedUriIndex, 1);
        }
      }
      // if action already exists for the uri then add matching URIs and continue
      if (existingDetails && existingDetails.action === threshold.action) {
        existingDetails.uris.push(...thresholdMatches);
        continue;
      }
      const action = matchable.buildActionDetails(matchDocSet, thresholdDefinition);

      const actionUri = Object.keys(action)[0];
      if (actionDetails[actionUri]) {
        actionDetails[actionUri].uris.push(...(action[actionUri].uris));
        actionDetails[actionUri].uris = actionDetails[actionUri].uris.filter((uri, index, array) => array.indexOf(uri) === index);
      } else {
        uris.push(actionUri);
        Object.assign(actionDetails, action);
      }
    }
  }
}

export default {
  buildMatchSummary
};
