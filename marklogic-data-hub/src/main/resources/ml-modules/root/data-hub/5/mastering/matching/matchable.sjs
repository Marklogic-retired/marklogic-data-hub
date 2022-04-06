'use strict';
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const blocks = require("/com.marklogic.smart-mastering/matcher-impl/blocks-impl.xqy");
const cachedInterceptorModules = {};

function retrieveInterceptorFunction(interceptorObj, interceptorType) {
  let interceptorModule = cachedInterceptorModules[interceptorObj.path];
  if (!interceptorModule) {
    try {
      interceptorModule = require(interceptorObj.path);
      cachedInterceptorModules[interceptorObj.path] = interceptorModule;
    } catch (e) {
      httpUtils.throwBadRequest(`Module defined by ${interceptorType} not found: ${interceptorObj.path}`);
    }
  }
  const interceptorFunction = interceptorModule[interceptorObj.function];
  if (!interceptorFunction) {
    httpUtils.throwBadRequest(`Function defined by ${interceptorType} not exported by module: ${interceptorObj.function}#${interceptorObj.path}`);
  }
  return interceptorFunction;
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

/*
 * A class that encapsulates the configurable portions of teh matching process.
 */
class Matchable {
  constructor(matchStep, stepContext) {
    this.matchStep = matchStep;
    this.stepContext = stepContext;
  }

  /*
   * Returns a cts.query to represent the entire set of documents that should be matched against
   * @return cts.query
   * @since 5.8.0
   */
  baselineQuery() {
    if (!this._baselineQuery) {
      let firstBaseline;
      if (this.matchStep.targetEntityType) {
        const targetEntityType = this.matchStep.targetEntityType;
        const tripleQuery = cts.tripleRangeQuery(null, sem.iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), sem.iri(targetEntityType))
        // check for TDE for entity to be enabled
        if (cts.exists(tripleQuery)) {
          firstBaseline = tripleQuery;
        } else {
          firstBaseline = cts.collectionQuery(targetEntityType.substring(targetEntityType.lastIndexOf("/") + 1));
        }
      } else if (this.matchStep.collections && this.matchStep.collections.content) {
        firstBaseline = cts.collectionQuery(this.matchStep.collections.content);
      } else {
        firstBaseline = null;
      }
      this._baselineQuery = applyInterceptors("Baseline Query Interceptor", firstBaseline, this.matchStep.baselineQueryInterceptors);
    }
    return this._baselineQuery;
  }
  /*
   * Returns an array of MatchRulesetDefinition class instances that describe the rule sets for matching
   * @return []MatchRulesetDefinition
   * @since 5.8.0
   */
  matchRulesetDefinitions() {
    // TODO DHFPROD-8590
  }

  /*
   * Returns an array of ThresholdDefinition class instances that describe the thresholds matches can be grouped into
   * @return []ThresholdDefinition
   * @since 5.8.0
   */
  thresholdDefinitions() {
    // TODO DHFPROD-8592
  }

  /*
   * Returns a cts.query that filters out documents that shouldn't match with an individual document. The default is to
   * return a cts.andNotQuery(cts.query(matchStep.filterQuery), cts.documentQuery([selfDocURI, documentsBlockedByUnmerge]))
   * @param {Node} documentNode
   * @return cts.query
   * @since 5.8.0
   */
  filterQuery(documentNode) {
    let filterQuery, notDocumentQuery, stepFilterQuery;
    let excludeDocuments = Sequence.from([xdmp.nodeUri(documentNode), blocks.getBlocks(fn.baseUri(documentNode)).xpath("text()")]);
    if (fn.exists(excludeDocuments)) {
      notDocumentQuery = cts.documentQuery(excludeDocuments.toArray());
    }
    if (this.matchStep.filterQuery) {
      stepFilterQuery = cts.query(this.matchStep.filterQuery);
    }
    if (stepFilterQuery && notDocumentQuery) {
      filterQuery = cts.andNotQuery(stepFilterQuery, notDocumentQuery);
    } else if (notDocumentQuery) {
      filterQuery = cts.notQuery(notDocumentQuery);
    } else if (stepFilterQuery) {
      filterQuery = stepFilterQuery;
    }
    return applyInterceptors("Filter Query Interceptor", filterQuery, this.matchStep.filterQueryInterceptors, documentNode);
  }

  /*
   * Returns a score in the form of a double of 2 documents
   * @param {ContentObject} contentObjectA
   * @param {ContentObject} contentObjectB
   * @param {[]MatchRulesetDefinition} matchingRulesets
   * @return double
   * @since 5.8.0
   */
  scoreDocument(contentObjectA, contentObjectB, matchingRulesets) {
    // TODO DHFPROD-8609
  }
  /*
   * Returns a JSON Object with details to pass onto the merge step for use in taking action.
   * @param {[]ContentObject} matchingDocumentSet
   * @param {ThresholdDefinition} thresholdBucket
   * @param {[]MatchRulesetDefinition} matchingRulesets
   * @return {}
   * @since 5.8.0
   */
  buildActionDetails(matchingDocumentSet, thresholdBucket, matchRulesets) {
    // TODO DHFPROD-8610
  }
}

module.exports = {
  Matchable
}