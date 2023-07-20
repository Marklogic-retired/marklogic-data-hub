import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import consts from "/data-hub/5/impl/consts.mjs";

const contentObjectsByURI = new Map();

const matchingDebugTraceEnabled = xdmp.traceEnabled(consts.TRACE_MATCHING_DEBUG);
const matchingTraceEnabled = xdmp.traceEnabled(consts.TRACE_MATCHING) || matchingDebugTraceEnabled;
const matchingTraceEvent = xdmp.traceEnabled(consts.TRACE_MATCHING) ? consts.TRACE_MATCHING : consts.TRACE_MATCHING_DEBUG;
const mergingDebugTraceEnabled = xdmp.traceEnabled(consts.TRACE_MERGING_DEBUG);

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
        cts.jsonPropertyScopeQuery(stepParts, groupQueries(query, joinFunction)) :
        cts.jsonPropertyValueQuery(stepParts, fn.distinctValues(Sequence.from(query)));
    };
  } else {
    prefix = `element:${pathJoinString}`;
    scopeQueryFunction = (stepParts, query) => {
      const qnames = stepParts.map((stepPart) => xdmp.QNameFromKey(stepPart));
      const isScope = hubUtils.normalizeToArray(query).some(q => q instanceof cts.query && !(q instanceof xs.string));
      return isScope ?
        cts.elementQuery(qnames, groupQueries(query, joinFunction)) :
        cts.elementValueQuery(qnames, fn.distinctValues(Sequence.from(query)));
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
    lastMatchCount = matchingPaths.length;
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
        return remainingPath.split(pathJoinString)
          .reverse()
          .reduce((acc, pathPart) => pathPart ? scopeQueryFunction(pathPart.split(stepJoinString), acc) : acc, query);
      } else {
        return query;
      }
    });
    if (matchingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Lower queries for shortest path ${shortestMatchingPath}: ${xdmp.toJsonString(lowerQueries)}`);
    }
    query = shortestMatchingPath.substring(prefix.length)
      .split(pathJoinString)
      .reverse()
      .reduce((acc, pathPart) => pathPart ? scopeQueryFunction(pathPart.split(stepJoinString), acc) : acc, groupQueries(lowerQueries, cts.andQuery));
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
  if (!ctsQuery || ctsQuery.length === 0) {
    return null;
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
      const query = queries[i];
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
        groupBy[key] = groupBy[key] || {index, operator, values: []};
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

function populateExistingContentObjects(contentObjects = []) {
  for (const contentObject of contentObjects) {
    contentObjectsByURI.set(String(contentObject.uri), contentObject);
  }
}

function contentObjectExistsWithDocument(uri) {
  const existing = contentObjectsByURI.get(uri);
  return existing && existing.value;
}

function populateContentObjects(uris = [], matchSummary) {
  if (uris.length === 0) {
    return;
  }
  const allActionDetails = matchSummary ? matchSummary.matchSummary.actionDetails: null;
  let allURIs = [];
  for (const uri of uris) {
    if (!contentObjectExistsWithDocument(uri)) { allURIs.push(uri); }
    if (allActionDetails && allActionDetails[uri]) {
      allURIs = allURIs.concat(allActionDetails[uri].uris.filter(u => !contentObjectExistsWithDocument(u)));
    }
  }
  if (allURIs.length > 0) {
    for (const doc of cts.search(cts.documentQuery(allURIs), ["document", "unfiltered", "score-zero", "unfaceted"], 0)) {
      populateContentObject(doc);
    }
  }
}

function addMemoryContentObjects(contentObjects) {
  if (contentObjects) {
    if (mergingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MERGING_DEBUG, `Adding in-memory content objects: ${xdmp.toJsonString(contentObjects)}`);
    }
    for (const contentObj of contentObjects) {
      contentObjectsByURI.set(contentObj.uri, contentObj);
    }
    if (mergingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MERGING_DEBUG, `Cached content objects: ${xdmp.toJsonString(contentObjectsByURI)}`);
    }
  }
}

function populateContentObject(doc, uri = xdmp.nodeUri(doc)) {
  uri = String(uri);
  if (doc) {
    const existing = contentObjectsByURI.get(uri);
    if (existing) {
      existing.value = doc;
    } else {
      contentObjectsByURI.set(uri, {
        uri,
        value: doc,
        context: {
          collections: xdmp.nodeCollections(doc),
          permissions: xdmp.nodePermissions(doc),
          metadata: xdmp.nodeMetadata(doc)
        }
      });
    }
  }
}

function getContentObject(uri) {
  uri = String(uri);
  let contentObject = contentObjectsByURI.get(uri);
  if (!contentObject) {
    populateContentObject(cts.doc(uri), uri);
    contentObject = contentObjectsByURI.get(uri);
  }
  return contentObject;
}

function releaseContentObject(uri) {
  uri = String(uri);
  if (contentObjectsByURI.has(uri)) {
    const contentObject = contentObjectsByURI.get(uri);
    hubUtils.releaseDatabaseNodeFromContentObject(contentObject);
    contentObjectsByURI.delete(uri);
  }
}

function resetPopulatedContent() {
  contentObjectsByURI.clear();
}

function retrieveInterceptorFunction(interceptorObj, interceptorType) {
  try {
    const interceptorFunction = hubUtils.requireFunction(interceptorObj.path, interceptorObj.function);
    if (!interceptorFunction) {
      httpUtils.throwBadRequest(`Function defined by ${interceptorType} not exported by module: ${interceptorObj.function}#${interceptorObj.path}`);
    }
    return interceptorFunction;
  } catch (err) {
    httpUtils.throwBadRequest(`Module defined by ${interceptorType} not found: ${interceptorObj.path}`);
  }
}

function applyInterceptors(interceptorType, accumulated, interceptors, ...additionalArguments) {
  if (!interceptors || interceptors.length === 0) {
    return accumulated;
  } else {
    const interceptorObj = interceptors.shift();
    const interceptorFunction = retrieveInterceptorFunction(interceptorObj, interceptorType);
    return applyInterceptors(interceptorType, interceptorFunction(accumulated, ...additionalArguments), interceptors, ...additionalArguments);
  }
}

class GenericMatchModel {
  constructor(matchStep, options = {}) {
    this.matchStep = matchStep;
    this.matchStep.propertyDefs = this.matchStep.propertyDefs || {properties: []};
    this._propertyDefinitionMap = {};
    this._indexesByPath = {};
    this._propertyDefinitionMap = {};
    this._namespaces = this.matchStep.propertyDefs.namespaces || {};
    const allProperties = this.matchStep.propertyDefs.hasOwnProperty("property") ? this.matchStep.propertyDefs.property: this.matchStep.propertyDefs.properties;
    for (const propertyDefinition of allProperties) {
      this._propertyDefinitionMap[propertyDefinition.name] = propertyDefinition;
    }
    const defaultCollection = matchStep.collections && matchStep.collections.content ? matchStep.collections.content : "mdm-content";
    this._instanceQuery = cts.collectionQuery(options.collection || defaultCollection);
  }

  instanceQuery() {
    return this._instanceQuery;
  }

  propertyDefinition(propertyPath) {
    return this._propertyDefinitionMap[propertyPath] || {localname: propertyPath, namespace: ""};
  }

  propertyValues(propertyPath, documentNode) {
    const propertyDefinition = this.propertyDefinition(propertyPath);
    return propertyDefinition.path ? documentNode.xpath(propertyDefinition.path, this._namespaces) : documentNode.xpath(`.//${propertyDefinition.namespace ? "ns:": ""}${propertyDefinition.localname}[string(.) ne '' or . instance of object-node()]`, {ns: propertyDefinition.namespace});
  }

  propertyIndexes(propertyPath) {
    if (!this._indexesByPath[propertyPath]) {
      const pathIndexes = [];
      const propertyDefinition = this._propertyDefinitionMap[propertyPath];
      if (propertyDefinition && propertyDefinition.indexReferences && propertyDefinition.indexReferences.length) {
        for (const indexReference of propertyDefinition.indexReferences) {
          try {
            pathIndexes.push(cts.referenceParse(indexReference));
          } catch (e) {
            xdmp.log(`Couldn't use index for property path '${propertyPath}' Reason: ${xdmp.toJsonString(e)}`);
          }
        }
      }
      this._indexesByPath[propertyPath] = pathIndexes;
    }
    return this._indexesByPath[propertyPath];
  }

  topLevelProperties() {
    return [];
  }
}

function propertyDefinitionsFromXPath(xpath, namespaces) {
  const xpathSteps = xpath.split("/").filter((step) => step);
  return xpathSteps
    .map((xpathStep, index) => {
      if (/\(.+\|.+\)/.test(xpathStep)) {
        xpathStep = xpathStep.replace(/\((.+)\|.+\)/, "$1");
      }
      if (xpathStep.includes(":")) {
        const [nsPrefix, localname] = xpathStep.split(":");
        return {
          namespace: namespaces[nsPrefix] || "",
          localname
        };
      } else {
        return {localname: xpathStep};
      }
    });
}

export default {
  applyInterceptors,
  GenericMatchModel,
  propertyDefinitionsFromXPath,
  populateContentObjects,
  populateExistingContentObjects,
  releaseContentObject,
  resetPopulatedContent,
  addMemoryContentObjects,
  getContentObject,
  optimizeCtsQueries,
  groupQueries
};