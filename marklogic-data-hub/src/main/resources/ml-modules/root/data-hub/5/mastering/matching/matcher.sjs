'use strict';
const consts = require("/data-hub/5/impl/consts.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const getBlocksOfUris = hubUtils.requireFunction("/com.marklogic.smart-mastering/matcher-impl/blocks-impl.xqy", "getBlocksOfUris");
const matchingDebugTraceEnabled = xdmp.traceEnabled(consts.TRACE_MATCHING_DEBUG);
const matchingTraceEnabled = xdmp.traceEnabled(consts.TRACE_MATCHING) || matchingDebugTraceEnabled;
const matchingTraceEvent = xdmp.traceEnabled(consts.TRACE_MATCHING) ? consts.TRACE_MATCHING : consts.TRACE_MATCHING_DEBUG;
const pathJoinString = "##";
const stepJoinString = "|";

function groupQueries(queries, joinFunction) {
  queries = hubUtils.normalizeToArray(queries);
  if (queries.length === 0) {
    return null;
  }
  if (queries.length === 1) {
    return queries[0];
  }
  return joinFunction(queries);
}

function consolidateScopeQueries(groupBy, groupByKey, groupByKeys, isJSON, joinFunction) {
  if (matchingDebugTraceEnabled) {
    xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Consolidating query group ${groupByKey} with groups: ${xdmp.toJsonString(groupBy)}`);
  }
  let prefix, scopeQueryFunction;
  if (isJSON) {
    prefix = `json:${pathJoinString}`;
    scopeQueryFunction = (stepParts, query) => {
      const isScope = hubUtils.normalizeToArray(query).some(q => q instanceof cts.query && !(q instanceof xs.string));
      return isScope ?
        cts.jsonPropertyScopeQuery(stepParts, groupQueries(query, joinFunction)) : cts.jsonPropertyValueQuery(stepParts, fn.distinctValues(Sequence.from(query)));
    }
  } else {
    prefix = `element:${pathJoinString}`;
    scopeQueryFunction = (stepParts, query) => {
      const qnames = stepParts.map((stepPart) => xdmp.QNameFromKey(stepPart));
      const isScope = hubUtils.normalizeToArray(query).some(q => q instanceof cts.query && !(q instanceof xs.string));
      return isScope ?
        cts.elementQuery(qnames, groupQueries(query, joinFunction)): cts.elementValueQuery(qnames, fn.distinctValues(Sequence.from(query)));
    };
  }
  const suffix = groupByKey.substring(prefix.length);
  const pathParts = suffix.split(pathJoinString);
  let matchingPaths = [];
  let shortestMatchingPath = "";
  let lastMatchCount = 1;
  for (let j = 0; j < pathParts.length; j++) {
    const path = `${prefix}${pathParts.slice(0, j + 1).join(pathJoinString)}`;
    matchingPaths = groupByKeys.filter((gKey) => gKey !== path && gKey.startsWith(path));
    if (matchingPaths.length === 0 || matchingPaths.length < lastMatchCount) {
      break;
    }
    shortestMatchingPath = path;
    lastMatchCount = matchingPaths.length
  }
  if (!shortestMatchingPath) {
    shortestMatchingPath = groupByKey;
  }
  let query = null;
  if (shortestMatchingPath === groupByKey || (!groupByKeys.includes(shortestMatchingPath) && groupByKey === groupByKeys.find((gk) => gk.startsWith(shortestMatchingPath)))) {
    const uniqueMatchingPaths = matchingPaths.filter((path, index, array) => array.indexOf(path) === index);
    if (!uniqueMatchingPaths.includes(groupByKey)) {
      uniqueMatchingPaths.push(groupByKey);
    }
    if (matchingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Unique matching paths for ${groupByKey}: ${xdmp.toJsonString(uniqueMatchingPaths)}`);
    }
    const lowerQueries = groupByKeys.filter((key) => key.startsWith(shortestMatchingPath)).map((matchingPath) => {
      let remainingPath = matchingPath.substring(shortestMatchingPath.length);
      const query = groupBy[matchingPath];
      delete groupBy[matchingPath];
      if (remainingPath) {
        return remainingPath.split(pathJoinString).reverse().reduce((acc, pathPart) => pathPart ? scopeQueryFunction(pathPart.split(stepJoinString), acc) : acc, query);
      } else {
        return query;
      }
    });
    if (matchingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Lower queries for shortest path ${shortestMatchingPath}: ${xdmp.toJsonString(lowerQueries)}`);
    }
    query = shortestMatchingPath.substring(prefix.length).split(pathJoinString).reverse().reduce((acc, pathPart) => pathPart ? scopeQueryFunction(pathPart.split(stepJoinString), acc) : acc, groupQueries(lowerQueries, cts.andQuery));
  }
  if (matchingDebugTraceEnabled) {
    xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Consolidated query for ${groupByKey} is ${xdmp.toJsonString(query)}`);
  }
  return query;
}

/*
 * Optimizes a cts.query by collapsing nested cts.orQuery and cts.andQuery types and groups element/property scope queries together.
 * @param {cts.query} ctsQuery
 * @return {cts.query}
 * @since 5.8.0
 */
function optimizeCtsQueries(ctsQuery) {
  if (matchingTraceEnabled) {
    xdmp.trace(matchingTraceEvent, `Optimizing cts query: ${xdmp.describe(ctsQuery, Sequence.from([]), Sequence.from([]))}`);
  }
  const isAndQuery = ctsQuery instanceof cts.andQuery;
  const isOrQuery = ctsQuery instanceof cts.orQuery;
  if (isAndQuery || isOrQuery) {
    let joinFunction, queriesFunction;
    if (isAndQuery) {
      joinFunction = cts.andQuery;
      queriesFunction = cts.andQueryQueries;
    } else {
      joinFunction = cts.orQuery;
      queriesFunction = cts.orQueryQueries;
    }
    let queries = hubUtils.normalizeToArray(queriesFunction(ctsQuery));
    if (matchingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Sub queries to group for optimization: ${xdmp.describe(queries)}`);
    }
    const groupBy = {other: []};
    for (let i = 0; i < queries.length; i++) {
      let query = queries[i];
      if (query instanceof cts.andQuery || query instanceof cts.orQuery) {
        if (matchingDebugTraceEnabled) {
          xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Sub-query group to optimize found: ${xdmp.describe(query)}`);
        }
        if ((query instanceof cts.andQuery && isAndQuery) || (query instanceof cts.orQuery && isOrQuery)) {
          if (matchingDebugTraceEnabled) {
            xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Flattening query: ${xdmp.describe(query)}`);
          }
          queries.splice(i, 1, hubUtils.normalizeToArray(queriesFunction(query)));
          i--;
        } else {
          groupBy.other.push(optimizeCtsQueries(query));
        }
      } else if (query instanceof cts.elementQuery) {
        if (matchingDebugTraceEnabled) {
          xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Element scope query found to group: ${xdmp.describe(query)}`);
        }
        let key = "element:";
        const groupFunction = (scopeQuery) => {
          if (scopeQuery instanceof cts.elementQuery) {
            key = key + `${pathJoinString}${cts.elementQueryElementName(scopeQuery).toArray().map((qname) => xdmp.keyFromQName(qname)).join(stepJoinString)}`;
            groupFunction(cts.elementQueryQuery(scopeQuery));
          } else if (scopeQuery instanceof cts.elementValueQuery) {
            key = key + `${pathJoinString}${cts.elementValueQueryElementName(scopeQuery).toArray().map((qname) => xdmp.keyFromQName(qname)).join(stepJoinString)}`;
            groupFunction(cts.elementValueQueryText(scopeQuery));
          } else {
            groupBy[key] = groupBy[key] || [];
            groupBy[key].push(scopeQuery);
          }
        };
        groupFunction(query);
      } else if (query instanceof cts.jsonPropertyScopeQuery) {
        if (matchingDebugTraceEnabled) {
          xdmp.trace(consts.TRACE_MATCHING_DEBUG, `JSON property scope query found to group: ${xdmp.describe(query)}`);
        }
        let key = "json:";
        const groupFunction = (scopeQuery) => {
          if (scopeQuery instanceof cts.jsonPropertyScopeQuery) {
            key = key + `${pathJoinString}${cts.jsonPropertyScopeQueryPropertyName(scopeQuery).toArray().join(stepJoinString)}`;
            groupFunction(cts.jsonPropertyScopeQueryQuery(scopeQuery));
          } else if (scopeQuery instanceof cts.jsonPropertyValueQuery) {
            key = key + `${pathJoinString}${cts.jsonPropertyValueQueryPropertyName(scopeQuery).toArray().join(stepJoinString)}`;
            groupFunction(cts.jsonPropertyValueQueryValue(scopeQuery));
          } else {
            groupBy[key] = groupBy[key] || [];
            groupBy[key].push(scopeQuery);
          }
        };
        groupFunction(query);
      } else if (query instanceof cts.jsonPropertyValueQuery && isOrQuery) {
        if (matchingDebugTraceEnabled) {
          xdmp.trace(consts.TRACE_MATCHING_DEBUG, `JSON property value query found to group: ${xdmp.describe(query)}`);
        }
        let key = `json:${pathJoinString}${cts.jsonPropertyValueQueryPropertyName(query).toArray().join(stepJoinString)}`;
        groupBy[key] = groupBy[key] || [];
        const value = cts.jsonPropertyValueQueryValue(query);
        if (!groupBy[key].includes(value)) {
          groupBy[key].push(value);
        }
      } else if (query instanceof cts.elementValueQuery && isOrQuery) {
        if (matchingDebugTraceEnabled) {
          xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Element value query found to group: ${xdmp.describe(query)}`);
        }
        let key = `element:${pathJoinString}${cts.elementValueQueryElementName(query).toArray().map((qname) => xdmp.keyFromQName(qname)).join(stepJoinString)}`;
        groupBy[key] = groupBy[key] || [];
        const value = cts.elementValueQueryText(query);
        if (!groupBy[key].includes(value)) {
          groupBy[key].push(value);
        }
      } else if (query instanceof cts.rangeQuery && isOrQuery) {
        if (matchingDebugTraceEnabled) {
          xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Range query found to group: ${xdmp.describe(query)}`);
        }
        const index = cts.rangeQueryIndex(query);
        const operator = cts.rangeQueryOperator(query);
        let key = `range:${xdmp.describe(index, Sequence.from([]), Sequence.from([]))}${xdmp.describe(operator, Sequence.from([]), Sequence.from([]))}`;
        groupBy[key] = groupBy[key] || { index, operator, values: []};
        const value = cts.rangeQueryValue(query);
        if (!groupBy[key].values.includes(value)) {
          groupBy[key].values.push(value);
        }
      } else {
          if (matchingDebugTraceEnabled) {
            xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Other query found: ${xdmp.describe(query)}`);
          }
          groupBy.other.push(query);
        }
      }
    if (matchingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Grouped queries for optimization: ${xdmp.toJsonString(groupBy)}`);
    }
    let finalQueries = [];
    const groupByKeys = Object.keys(groupBy).sort();
    for (const groupByKey of groupByKeys) {
      if (!groupBy[groupByKey]) {
        continue;
      }
      if (groupByKey.startsWith(`element:${pathJoinString}`)) {
        finalQueries = finalQueries.concat(consolidateScopeQueries(groupBy, groupByKey, groupByKeys, false, joinFunction));
      } else if (groupByKey.startsWith(`json:${pathJoinString}`)) {
        finalQueries = finalQueries.concat(consolidateScopeQueries(groupBy, groupByKey, groupByKeys, true, joinFunction));
      } else if (groupByKey.startsWith("range:")) {
        const rangeInfo = groupBy[groupByKey];
        finalQueries.push(cts.rangeQuery(rangeInfo.index, rangeInfo.operator, rangeInfo.values));
      }
    }
    finalQueries = finalQueries.concat(groupBy.other);
    if (matchingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Final set of queries for optimization: ${xdmp.describe(finalQueries, Sequence.from([]), Sequence.from([]))}`);
    }
    const optimizedQuery = groupQueries(finalQueries, joinFunction);
    if (matchingTraceEnabled) {
      xdmp.trace(matchingTraceEvent, `Optimized cts query: ${xdmp.describe(optimizedQuery, Sequence.from([]), Sequence.from([]))}`);
    }
    return optimizedQuery;
  } else {
    if (matchingTraceEnabled) {
      xdmp.trace(matchingTraceEvent, "No query optimization necessary");
    }
    return ctsQuery;
  }
}

/*
 * Returns a cts.query based on the document node and the array of MatchRulesetDefinition
 * @param {Node} documentNode
 * @param {[]MatchRulesetDefinition} matchRulesets
 * @return {cts.query}
 * @since 5.8.0
 */
function buildQueryFromMatchRuleset(documentNode, matchRulesets) {
  const queries = [];
  for (const matchRuleset of matchRulesets) {
    const query = matchRuleset.buildCtsQuery(documentNode);
    if (query) {
      queries.push(query);
    }
  }
  return groupQueries(queries, cts.andQuery);
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
  matchable.matchStep.dataFormat = xdmp.uriFormat(fn.head(content).uri);
  const dataFormat = matchable.matchStep.dataFormat;
  let urisToActOn = [];
  const allActionDetails = {};
  const uriToMerged = {};
  const baselineQuery = matchable.baselineQuery();
  // get thresholds with actions associated with them
  const thresholdDefinitions = matchable.thresholdDefinitions().filter((def => def.action()));
  const lowestThresholdDefinition = thresholdDefinitions[0];
  const minimumRulesetCombinations = lowestThresholdDefinition.minimumMatchCombinations();
  // prime triple cache on blocked merges
  getBlocksOfUris(Sequence.from(hubUtils.normalizeToArray(content).map((c) => c.uri)));

  for (const contentObject of content) {
    let documentIsMerged = false;
    const filterQuery = matchable.filterQuery(contentObject.value);
    const matchCtsQuery = optimizeCtsQueries(groupQueries(
      minimumRulesetCombinations
        .map((minimumRulesetCombination) => buildQueryFromMatchRuleset(contentObject.value, minimumRulesetCombination)),
      cts.orQuery
    ));
    if (fn.empty(matchCtsQuery)) {
      if (matchingTraceEnabled) {
        xdmp.trace(matchingTraceEvent, `No minimum match query for ${xdmp.describe(contentObject.value)}`);
      }
      continue;
    }
    const thresholdGroups = {};
    const finalMatchQuery = cts.andQuery([baselineQuery, filterQuery, matchCtsQuery]);
    const formatOption = `format-${dataFormat}`;
    const total = cts.estimate(finalMatchQuery);
    if (matchingTraceEnabled) {
      xdmp.trace(matchingTraceEvent, `Found ${total} results for ${xdmp.describe(contentObject.value)} with query ${xdmp.describe(finalMatchQuery, Sequence.from([]), Sequence.from([]))}`);
      xdmp.trace(matchingTraceEvent, `Searching with format option: ${formatOption}.`);
    }
    const maxScan = matchable.maxScan();
    if (total > maxScan) {
      xdmp.log(`Large number of documents (${total}) matching ${xdmp.describe(finalMatchQuery, Sequence.from([]), Sequence.from([]))}`);
    }
    for (const matchingDocument of fn.subsequence(cts.search(finalMatchQuery, [formatOption, "filtered", "score-zero"], 0), 1, maxScan)) {
      const matchingContentObject = {uri: xdmp.nodeUri(matchingDocument), value: matchingDocument};
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
        xdmp.trace(matchingTraceEvent, `${xdmp.describe(contentObject.value)} and ${xdmp.describe(matchingDocument)} placed in the threshold ${currentThresholdDefinition ? currentThresholdDefinition.name(): "null"} with score ${score}.`);
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
    const thresholdNames = Object.keys(thresholdGroups);
    for (const thresholdName of thresholdNames) {
      const matchingDocumentSet = thresholdGroups[thresholdName];
      matchingDocumentSet.unshift(contentObject);
      const thresholdDefinition = thresholdDefinitions.find((def) => thresholdName === def.name());
      const actionDetails = matchable.buildActionDetails(matchingDocumentSet, thresholdDefinition);
      const actionURI = Object.keys(actionDetails)[0];
      if (allActionDetails[actionURI]) {
        allActionDetails[actionURI].uris = allActionDetails[actionURI].uris.concat(actionDetails[actionURI].uris).filter((uri, index, uris) => index === uris.indexOf(uri));
      } else {
        Object.assign(allActionDetails, actionDetails);
      }
      if (thresholdDefinition.action() === "merge") {
        for (const uri of allActionDetails[actionURI].uris) {
          uriToMerged[uri] = actionURI;
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
  // substitute notification URIs
  for (const actionURI of Object.keys(allActionDetails)) {
    const actionDetail = allActionDetails[actionURI];
    if (actionDetail.action === "notify") {
      actionDetail.uris = actionDetail.uris.map((uri) => uriToMerged[uri] || uri).filter((uri, index, array) => array.indexOf(uri) === index);
    }
  }
  urisToActOn = urisToActOn.concat(Object.keys(allActionDetails));
  const matchSummary = {
    matchSummary: {
      matchStepId: matchable.matchStep.stepId,
      matchStepName: matchable.matchStepNode.stepName,
      matchStepFlow: matchable.matchStep.flow,
      URIsToProcess: urisToActOn,
      actionDetails: allActionDetails
    }
  };
  if (matchingTraceEnabled) {
    xdmp.trace(matchingTraceEvent, `Match summary created: ${xdmp.toJsonString(matchSummary)}`);
  }
  return matchSummary;
}

module.exports = {
  buildMatchSummary,
  groupQueries,
  optimizeCtsQueries
}
