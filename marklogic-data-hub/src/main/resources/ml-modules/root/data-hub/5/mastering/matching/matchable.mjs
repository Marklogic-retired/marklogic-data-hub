'use strict';
import consts from "/data-hub/5/impl/consts.mjs";
import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import common from "/data-hub/5/mastering/common.mjs";
const matchingDebugTraceEnabled = xdmp.traceEnabled(consts.TRACE_MATCHING_DEBUG);
const matchingTraceEnabled = xdmp.traceEnabled(consts.TRACE_MATCHING) || matchingDebugTraceEnabled;
const matchingTraceEvent = xdmp.traceEnabled(consts.TRACE_MATCHING) ? consts.TRACE_MATCHING : consts.TRACE_MATCHING_DEBUG;
import { groupQueries } from "./matcher.mjs";

const queryHashPredicate = sem.iri("http://marklogic.com/data-hub/mastering#hasMatchingHash");
/*
 * A class that encapsulates the configurable portions of the matching process.
 */
class Matchable {
  constructor(matchStep, stepContext) {
    // update the match step if using the legacy format
    if (matchStep.scoring) {
      const updateMatchOptions = hubUtils.requireFunction("/data-hub/5/data-services/mastering/updateMatchOptionsLib.mjs", "updateMatchOptions");
      this.matchStep = updateMatchOptions(matchStep);
    } else {
      this.matchStep = matchStep;
    }
    this.matchStepNode = xdmp.toJSON(this.matchStep).root;
    this.stepContext = stepContext;
    const targetEntityType = this.matchStep.targetEntityType;
    this._genericModel = new common.GenericMatchModel(this.matchStep, {collection: targetEntityType ? targetEntityType.substring(targetEntityType.lastIndexOf("/") + 1):null});
    if (targetEntityType) {
      const getEntityModel = hubUtils.requireFunction("/data-hub/core/models/entities.sjs", "getEntityModel");
      this._model = getEntityModel(targetEntityType);
    }
    if (!this._model) {
      this._model = this._genericModel;
    }
    this._propertyQueryFunctions = {};
  }

  /*
   * Returns a Model class instance that defines how match queries should be built
   * @return Model class instance
   * @since 5.8.0
   */
  model() {
    return this._model;
  }

  /*
   * Returns a cts.query to represent the entire set of documents that should be matched against
   * @return cts.query
   * @since 5.8.0
   */
  baselineQuery() {
    if (!this._baselineQuery) {
      const firstBaseline = this._model.instanceQuery();
      this._baselineQuery = common.applyInterceptors("Baseline Query Interceptor", firstBaseline, this.matchStep.baselineQueryInterceptors);
      if (matchingTraceEnabled) {
        xdmp.trace(matchingTraceEvent, `Initializing the baseline match query: ${xdmp.describe(this._baselineQuery, Sequence.from([]), Sequence.from([]))}`);
      }
    }
    return this._baselineQuery;
  }
  /*
   * Returns an array of MatchRulesetDefinition class instances that describe the rule sets for matching
   * @return []MatchRulesetDefinition
   * @since 5.8.0
   */
  matchRulesetDefinitions() {
    if (!this._matchRulesetDefinitions) {
      this._matchRulesetDefinitions = this.matchStepNode.xpath("matchRulesets").toArray()
        .map((rulesetNode) => new MatchRulesetDefinition(rulesetNode, this))
        .sort((a, b) => b.weight() - a.weight());
      if (matchingTraceEnabled) {
        xdmp.trace(matchingTraceEvent, `Initializing the match ruleset definitions: ${xdmp.toJsonString(this._matchRulesetDefinitions.map((def) => def.raw()))}`);
      }
    }
    return this._matchRulesetDefinitions;
  }

  /*
   * Returns an array of ThresholdDefinition class instances that describe the thresholds matches can be grouped into
   * @return []ThresholdDefinition
   * @since 5.8.0
   */
  thresholdDefinitions() {
    if (!this._thresholdDefinitions) {
      const thresholds = this.matchStep.thresholds && this.matchStep.thresholds.threshold ? this.matchStep.thresholds.threshold: this.matchStep.thresholds;
      this._thresholdDefinitions = thresholds.map((thresholdObj) => {
        return new ThresholdDefinition(thresholdObj, this);
      }).sort((a, b) => a.score() - b.score());
      if (matchingTraceEnabled) {
        xdmp.trace(matchingTraceEvent, `Initializing the threshold definitions: ${xdmp.toJsonString(this._thresholdDefinitions.map((def) => def.raw()))}`);
      }
    }
    return this._thresholdDefinitions;
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
    const uri = xdmp.nodeUri(documentNode);
    const getBlocks = hubUtils.requireFunction("/com.marklogic.smart-mastering/matcher-impl/blocks-impl.xqy", "getBlocks");
    const excludeDocuments = fn.exists(uri) ? Sequence.from([uri, Sequence.from(getBlocks(uri))]): null;
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
    if (matchingTraceEnabled) {
      xdmp.trace(matchingTraceEvent, `Base filter query set to ${xdmp.describe(filterQuery, Sequence.from([]), Sequence.from([]))} for ${xdmp.describe(documentNode, Sequence.from([]), Sequence.from([]))}`);
    }
    return common.applyInterceptors("Filter Query Interceptor", filterQuery, this.matchStep.filterQueryInterceptors, documentNode);
  }

  /*
   * Returns a score in the form of a double of 2 documents
   * @param {ContentObject} contentObjectA
   * @param {ContentObject} contentObjectB
   * @param {[]MatchRulesetDefinition} matchingRulesets
   * @return double
   * @since 5.8.0
   */
  scoreDocument(contentObjectA, contentObjectB) {
    const matchingRulesetDefinitions = this.matchRulesetDefinitions();
    let defaultScore = 0;
    for (const matchRuleset of matchingRulesetDefinitions) {
      const rulesetScore = matchRuleset.score(contentObjectA, contentObjectB);
      if (matchingDebugTraceEnabled) {
        xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Applying rule ${matchRuleset.name()} for ${xdmp.describe(contentObjectA.value, Sequence.from([]), Sequence.from([]))} and ${xdmp.describe(contentObjectB.value, Sequence.from([]), Sequence.from([]))} with score ${rulesetScore}`);
      }
      if (rulesetScore !== 0) {
        if (matchRuleset.reduce()) {
          if (matchingDebugTraceEnabled) {
            xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Decreasing score by ${rulesetScore} for ${xdmp.describe(contentObjectA.value, Sequence.from([]), Sequence.from([]))} and ${xdmp.describe(contentObjectB.value, Sequence.from([]), Sequence.from([]))}`);
          }
          defaultScore -= rulesetScore;
        } else {
          if (matchingDebugTraceEnabled) {
            xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Increasing score by ${rulesetScore}  for ${xdmp.describe(contentObjectA.value, Sequence.from([]), Sequence.from([]))} and ${xdmp.describe(contentObjectB.value, Sequence.from([]), Sequence.from([]))}`);
          }
          defaultScore += rulesetScore;
        }
      }
    }
    if (matchingTraceEnabled) {
      xdmp.trace(matchingTraceEvent, `Base score set to ${defaultScore} for ${xdmp.describe(contentObjectA.value, Sequence.from([]), Sequence.from([]))} and ${xdmp.describe(contentObjectB.value, Sequence.from([]), Sequence.from([]))}`);
    }
    return common.applyInterceptors("Score Document Interceptor", defaultScore, this.matchStep.scoreDocumentInterceptors, contentObjectA, contentObjectB, matchingRulesetDefinitions);
  }
  /*
   * Returns a JSON Object with details to pass onto the merge step for use in taking action.
   * @param {[]ContentObject} matchingDocumentSet
   * @param {ThresholdDefinition} thresholdBucket
   * @return {}
   * @since 5.8.0
   */
  buildActionDetails(matchingDocumentSet, thresholdBucket) {
    const action = thresholdBucket.action();
    const actionUri = thresholdBucket.generateActionURI(matchingDocumentSet);
    const thresholdName = thresholdBucket.name();
    const uris = matchingDocumentSet
        .map((contentObj) => {
          if (contentObj.uri.startsWith("/com.marklogic.smart-mastering/merged/")) {
            return fn.distinctValues(contentObj.value.xpath("/*:envelope/*:headers/*:merges/*:document-uri")).toArray();
          }
          return contentObj.uri;
        })
        .reduce((acc, cur) => acc.concat(cur), [])
        .filter((uri, index, uris) => index === uris.indexOf(uri))
        .sort();
    let hashes;
    const fuzzyMatchRulesets = thresholdBucket.minimumMatchCombinations()
      .map((combo) => combo.filter(matchRuleset => matchRuleset.fuzzyMatch()))
      .filter(combo => combo.length)
      .reduce((prev, curr) => prev.concat(curr), []);
    if (fuzzyMatchRulesets.length > 0) {
      const firstMatchingDoc = matchingDocumentSet[0];
      const firstMatchingDocUri = firstMatchingDoc.uri;
      const firstMatchingDocNode = firstMatchingDoc.value;
      hashes = [];
      for (const fuzzyMatchRuleset of fuzzyMatchRulesets) {
        for (const queryHash of fuzzyMatchRuleset.queryHashes(firstMatchingDocNode)) {
          hashes.push(sem.triple(firstMatchingDocUri, queryHashPredicate, queryHash));
        }
      }
      hashes = fn.distinctValues(Sequence.from(hashes));
    }
    let actionBody;
    // TODO: when we refactor merging code we can likely clean up the awkward "function", "at" property names and remove the namespace property
    if (action === "custom") {
      actionBody = {
        action: "customActions",
        actions: [
          {
            thresholdName,
            uris,
            "function": thresholdBucket.actionModuleFunction(),
            "at": thresholdBucket.actionModulePath(),
            "namespace": thresholdBucket.actionModuleNamespace(),
            matchResults: matchingDocumentSet.filter((match) => match.uri !== actionUri)
          }
        ],
        hashes
      };
    } else {
      actionBody = {
        action,
        // TODO This should be consistent with thresholdName in custom actions
        threshold: thresholdName,
        uris,
        hashes
      };
    }
    return {
      [actionUri]: actionBody
    };
  }

  /*
   * Returns a query given a property path a set of values based on the model associated with Matchable.
   * This will likely be reused and so can be moved to a common at some point.
   * @param {string} propertyPath
   * @param {item*} values
   * @return {cts.query}
   * @since 5.8.0
   */
  propertyQuery(propertyPath, values) {
    if (matchingTraceEnabled) {
      xdmp.trace(matchingTraceEvent, `Property query for ${propertyPath} with values ${xdmp.describe(values, Sequence.from([]), Sequence.from([]))}`);
    }
    const valuesAreQueries = hubUtils.normalizeToArray(values).every(val => val instanceof cts.query);
    if (matchingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Property query for ${propertyPath} has query values? ${valuesAreQueries}`);
    }
    if (valuesAreQueries) {
      return values;
    }
    if (!this._propertyQueryFunctions[propertyPath]) {
      let indexes = this.model().propertyIndexes(propertyPath);
      if (this._genericModel && !(indexes && indexes.length)) {
        indexes = this._genericModel.propertyIndexes(propertyPath);
      }
      if (indexes && indexes.length) {
        const scalarType = cts.referenceScalarType(indexes[0]);
        const collation = (scalarType === "string") ? cts.referenceCollation(indexes[0]) : null;
        this._propertyQueryFunctions[propertyPath] = (values) => {
          let typedValues = [];
          for (const value of values) {
            if (xdmp.castableAs("http://www.w3.org/2001/XMLSchema", scalarType, value)) {
              typedValues.push(xs[scalarType](value));
            }
          }
          if (typedValues.length === 0) {
            return values;
          }
          if (collation) {
            const extendedValues = [];
            for (const value of typedValues) {
              extendedValues.push(cts.valueMatch(indexes, value, ["case-insensitive"]));
            }
            typedValues = Sequence.from(extendedValues);
          }
          return cts.rangeQuery(indexes, "=", typedValues)
        };
      } else {
        const pathParts = propertyPath.split(".").filter((path) => path);
        const propertyDefinitions = pathParts
          .map((propertyPart, index) => this.model().propertyDefinition(pathParts.slice(0, index + 1).join(".")));
        if (matchingDebugTraceEnabled) {
          xdmp.trace(matchingTraceEvent, `Property for ${propertyPath} has property definitions ${xdmp.describe(propertyDefinitions, Sequence.from([]), Sequence.from([]))}`);
        }
        this._propertyQueryFunctions[propertyPath] = (values) => {
          const propertyQuery = this._buildQueryFromPropertyDefinitionsAndValues(propertyDefinitions, values);
          if (matchingTraceEnabled) {
            xdmp.trace(matchingTraceEvent, `Property query for ${propertyPath} is ${xdmp.describe(propertyQuery, Sequence.from([]), Sequence.from([]))}`);
          }
          return propertyQuery;
        };
      }
    }
    return this._propertyQueryFunctions[propertyPath](values);
  }

  /*
   * Returns a query given an XPath and a set of values based on the model associated with Matchable.
   * This will likely be reused and so can be moved to a common at some point.
   * @param {string} XPath
   * @param {item*} values
   * @return {cts.query}
   * @since 5.8.0
   */
  xpathQuery(xpath, values, localNamespaces = {}) {
    if (matchingTraceEnabled) {
      xdmp.trace(matchingTraceEvent, `XPath query for ${xpath} with values ${xdmp.describe(values, Sequence.from([]), Sequence.from([]))}`);
    }
    const propertyDefinitions = common.propertyDefinitionsFromXPath(xpath, localNamespaces);
    const xpathQuery = this._buildQueryFromPropertyDefinitionsAndValues(propertyDefinitions, values);
    if (matchingTraceEnabled) {
      xdmp.trace(matchingTraceEvent, `XPath query for ${xpath} is ${xdmp.describe(xpathQuery, Sequence.from([]), Sequence.from([]))}`);
    }
    return xpathQuery;
  }

  /*
 * Returns the max scan size.
 * @return {integer}
 * @since 5.8.0
 */
  maxScan() {
    if (!this._maxScan) {
      this._maxScan = 25;//fn.number((this.matchStep.tuning && this.matchStep.tuning.maxScan) || 500);
    }
    return this._maxScan;
  }

  _buildQueryFromPropertyDefinitionsAndValues(propertyDefinitions, values) {
    if (values instanceof Function) return values;
    const lastPropertyDefinitionIndex = propertyDefinitions.length - 1;
    const lastPropertyDefinition = propertyDefinitions[lastPropertyDefinitionIndex];
    const parentPropertyDefinitions = propertyDefinitions.slice(0,lastPropertyDefinitionIndex).reverse();
    const localname = lastPropertyDefinition.localname;
    const valuesArray = hubUtils.normalizeToArray(values).filter(val => val instanceof cts.query || fn.normalizeSpace(fn.string(val)));
    if (valuesArray.length === 0) {
      return null;
    }
    const queryValues = valuesArray.filter(val => (val instanceof cts.query));
    if (queryValues.length === valuesArray.length) {
      return values;
    }
    let atomicValues = valuesArray.filter(val => !(val instanceof cts.query));
    if (matchingDebugTraceEnabled) {
      xdmp.trace(matchingTraceEvent, `Parent property definitions for ${localname}: ${JSON.stringify(parentPropertyDefinitions, null, 2)}.`);
      xdmp.trace(matchingTraceEvent, `Query values for ${localname}: ${xdmp.describe(queryValues, Sequence.from([]), Sequence.from([]))}.`);
      xdmp.trace(matchingTraceEvent, `Atomic values for ${localname}: ${xdmp.describe(atomicValues, Sequence.from([]), Sequence.from([]))}.`);
    }
    if (this.matchStep.dataFormat === "json") {
      const lastQuery = groupQueries(queryValues.concat(atomicValues.length ? [cts.jsonPropertyValueQuery(localname, atomicValues, ["case-insensitive"])]: []), cts.orQuery);
      return parentPropertyDefinitions.reduce((acc, propertyDef) => propertyDef.localname ? cts.jsonPropertyScopeQuery(propertyDef.localname, acc) : acc, lastQuery);
    } else {
      atomicValues = atomicValues.map((val) => fn.string(val));
      const lastQuery = groupQueries(queryValues.concat(atomicValues.length ? [cts.elementValueQuery(fn.QName(lastPropertyDefinition.namespace, localname), atomicValues, ["case-insensitive"])]: []), cts.orQuery);
      return parentPropertyDefinitions.reduce((acc, propertyDef) => propertyDef.localname ? cts.elementQuery(fn.QName(propertyDef.namespace, propertyDef.localname), acc) : acc, lastQuery);
    }
  }
}

const cachedPropertyValues = {};

class MatchRulesetDefinition {
  constructor(matchRulesetNode, matchable) {
    this.matchRulesetNode = matchRulesetNode
    this.matchRulesNodes = this.matchRulesetNode.xpath("matchRules");
    this.matchRuleset = matchRulesetNode.toObject();
    this.matchable = matchable;
    this._matchRuleFunctions = [];
    this._cachedCtsQueries = {};
    this._cachedQueryHashes = {};
  }

  name() {
    return this.matchRuleset.name;
  }

  reduce() {
    return !!this.matchRuleset.reduce;
  }

  _valueFunction(matchRule, model) {
    if (!matchRule._valueFunction) {
      matchRule._valueFunction = (documentNode) => {
        const key = `${xdmp.nodeUri(documentNode)}:${matchRule.documentXPath || matchRule.entityPropertyPath}`;
        if (!cachedPropertyValues[key]) {
          if (matchRule.documentXPath) {
            cachedPropertyValues[key] = documentNode.xpath(matchRule.documentXPath, matchRule.namespaces);
          } else {
            cachedPropertyValues[key] = model.propertyValues(matchRule.entityPropertyPath, documentNode);
          }
        }
        return cachedPropertyValues[key];
      }
    }
    return matchRule._valueFunction;
  }

  synonymMatchFunction(value, passMatchRule) {
    let matchRule = passMatchRule.toObject();
    let thesaurus = matchRule.options.thesaurusURI;
    let expandOptions = hubUtils.normalizeToArray(value).map((val) => fn.string(val).toLowerCase());
    const queryLookup = hubUtils.requireFunction("/MarkLogic/thesaurus.xqy", "queryLookup");
    let entries = queryLookup(thesaurus, cts.elementValueQuery(fn.QName("http://marklogic.com/xdmp/thesaurus", "term"), expandOptions, "case-insensitive"), "elements");
    let options = matchRule.options;
    let allEntries = [];
    let filterNode;
    //check if filter is present in options
    if(fn.exists(options.filter)) {
      filterNode = xdmp.unquote(options.filter);
    }
    for(const entry of entries) {
      let meetsQualifier = false;
      if (filterNode) {
        for (let node of entry.xpath(".//*")) {
          //comparing each node of entry with filerNode
          if (fn.deepEqual(node, fn.head(filterNode).root)) {
            meetsQualifier = true;
            break;
          }
        }
      } else {
        meetsQualifier = true;
      }
      if (meetsQualifier) {
        for (let syn of entry.xpath("(thsr:term|thsr:synonym/thsr:term)", {thsr: "http://marklogic.com/xdmp/thesaurus"})) {
          allEntries.push(fn.string(syn));
        }
      }
    }
    //returning unique values of all matching entries
    return Array.from(new Set(allEntries));
  }


  doubleMetaphoneMatchFunction(value, passMatchRule) {
    let matchRule = passMatchRule.toObject();
    let dictionary = matchRule.options.dictionaryURI;
    let spellOption = {
      distanceThreshold : matchRule.options.distanceThreshold
    };
    const suggest = hubUtils.requireFunction("/MarkLogic/spell.xqy", "suggest");
    let results = hubUtils.normalizeToArray(value).map((val) => suggest(dictionary, fn.string(val), spellOption));
    return Sequence.from(results);
  }

  zipMatchFunction(value, passMatchRule) {
    let node =  hubUtils.normalizeToArray(value).map((val) => fn.string(val)).toString();
    let result = [node];
    if(node.length === 5) {
      let wildcardValue = node + "-*";
      result.push(wildcardValue);
    }
    else {
      let val = (node).substring(0,5);
      result.push(val);
    }
    return result;
  }

  _matchFunction(matchRule, model) {
    if (!matchRule._matchFunction) {
      let passMatchRule = matchRule.node;
      let passMatchStep = this.matchable.matchStepNode;
      let convertToNode = false;
      let matchFunction;
      let propertyQueryFunction = (values) => this.matchable.propertyQuery(matchRule.entityPropertyPath, values);
      if (matchRule.documentXPath) {
        propertyQueryFunction = (values) => this.matchable.xpathQuery(matchRule.documentXPath, values, matchRule.namespaces);
      }
      switch (matchRule.matchType) {
        case "exact":
          matchFunction = propertyQueryFunction;
          convertToNode = true;
          break;
        case "doubleMetaphone":
          matchFunction = this.doubleMetaphoneMatchFunction;
          convertToNode = true;
          break;
        case "synonym":
          matchFunction = this.synonymMatchFunction;
          convertToNode = true;
          break;
        case "zip":
          matchFunction = this.zipMatchFunction;
          convertToNode = true;
          break;
        case "custom":
          matchFunction = hubUtils.requireFunction(matchRule.algorithmModulePath, matchRule.algorithmFunction);
          convertToNode = /\.xq[yml]?$/.test(matchRule.algorithmModulePath);
          break;
        default:
          httpUtils.throwBadRequest(`Undefined match type "${matchRule.matchType}" provided.`);
      }
      matchRule._matchFunction = (values) => {
        const results = matchFunction(values, passMatchRule, passMatchStep);
        if (!results) {
          return null;
        }
        return propertyQueryFunction(results);
      };
    }
    return matchRule._matchFunction;
  }

  score(contentObjectA, contentObjectB) {
    const query = this.buildCtsQuery(contentObjectA.value);
    const model = this.matchable.model();

    let pos = 1;
    for (const matchRule of this.matchRuleset.matchRules) {
      if (!matchRule.node) {
        matchRule.node = fn.head(fn.subsequence(this.matchRulesNodes, pos, 1));
      }
      pos++;
      const valueFunction = this._valueFunction(matchRule, model);
      const matchFunction = this._matchFunction(matchRule, model);
      const values = valueFunction(contentObjectA.value);
      const query = fn.exists(values) ? matchFunction(values): null;
      if(query instanceof Function) {
        this._matchRuleFunctions.push(query);
      }
    }
    if (matchingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MATCHING_DEBUG, `Scoring ${xdmp.describe(contentObjectA.value)} with ${xdmp.describe(contentObjectB.value)} using cts.query: ${xdmp.describe(query, Sequence.from([]), Sequence.from([]))}.`);
    }
    if (fn.exists(query) && cts.contains(contentObjectB.value, query) && this._matchRuleFunctions.every((rule)=> rule(contentObjectB.value))) {
      if (matchingDebugTraceEnabled) {
        xdmp.trace(consts.TRACE_MATCHING_DEBUG, "Query matched!");
      }
      return this.weight();
    }
    if (matchingDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_MATCHING_DEBUG, "Query didn't match!");
    }
    return 0;
  }

  buildCtsQuery(documentNode) {
    if (matchingTraceEnabled) {
      xdmp.trace(matchingTraceEvent, `Building cts.query for ${xdmp.describe(documentNode)} with match ruleset ${this.name()}`);
    }
    const uri = xdmp.nodeUri(documentNode);
    if (!this._cachedCtsQueries[uri]) {
      const queries = [];
      const model = this.matchable.model();
      const groupQueries = hubUtils.requireFunction("/data-hub/5/mastering/matching/matcher.mjs", "groupQueries");
      let pos = 1;
      for (const matchRule of this.matchRuleset.matchRules) {
        if (!matchRule.node) {
          matchRule.node = fn.head(fn.subsequence(this.matchRulesNodes, pos, 1));
        }
        pos++;
        const valueFunction = this._valueFunction(matchRule, model);
        const matchFunction = this._matchFunction(matchRule, model);
        const values = valueFunction(documentNode);
        const query = fn.exists(values) ? matchFunction(values) : null;
        if (fn.empty(query)) {
          return null;
        }
        if (query instanceof cts.query) {
          queries.push(query);
        }
      }
      if (matchingDebugTraceEnabled) {
        xdmp.trace(consts.TRACE_MATCHING_DEBUG, `cts.query for ${xdmp.describe(documentNode)} with match ruleset ${this.name()} before optimization is ${xdmp.describe(queries)}`);
      }
      const optimizeCtsQueries = hubUtils.requireFunction("/data-hub/5/mastering/matching/matcher.mjs", "optimizeCtsQueries");
      const optimizedCtsQuery = optimizeCtsQueries(groupQueries(queries, cts.andQuery));
      if (matchingTraceEnabled) {
        xdmp.trace(matchingTraceEvent, `cts.query for ${xdmp.describe(documentNode)} with match ruleset ${this.name()} returned ${xdmp.describe(optimizedCtsQuery, Sequence.from([]), Sequence.from([]))}`);
      }
      this._cachedCtsQueries[uri] = optimizedCtsQuery;
    }
    return this._cachedCtsQueries[uri];
  }

  queryHashes(documentNode) {
    const uri = xdmp.nodeUri(documentNode);
    if (!this._cachedQueryHashes[uri]) {
      const query = this.buildCtsQuery(documentNode);
      const queryHasher = hubUtils.requireFunction("/data-hub/5/mastering/matching/queryHasher.xqy", "queryToHashes");
      this._cachedQueryHashes[uri] = queryHasher(query);
    }
    return this._cachedQueryHashes[uri];
  }

  weight() {
    return fn.number(this.matchRuleset.weight);
  }

  fuzzyMatch() {
    return !!this.matchRuleset.fuzzyMatch;
  }

  raw() {
    return this.matchRuleset;
  }
}

class ThresholdDefinition {
  constructor(threshold, matchable) {
    this.threshold = threshold;
    this.matchable = matchable;
  }

  /*
   * Returns a string that is the threshold's name.
   * @return {string}
   * @since 5.8.0
   */
  name() {
    return this.threshold.thresholdName;
  }

  /*
   * Returns a number that is the threshold's score.
   * @return {number}
   * @since 5.8.0
   */
  score() {
    return this.threshold.score;
  }

  // this is a helper function to find combinations of rulesets that match a threshold
  _otherCombinations(remainingRulesets = []) {
    let combinations = [];
    for (let i = 0; i < remainingRulesets.length; i++) {
      const ruleset = remainingRulesets[i];
      let combinationsStartingWith = [ruleset];
      let combinedWeight = ruleset.weight();
      const followingRulesets = remainingRulesets.slice(i + 1);
      for (const followingRuleset of followingRulesets) {
        combinedWeight = combinedWeight + followingRuleset.weight();
        combinationsStartingWith.push(followingRuleset);
        if (combinedWeight >= this.score()) {
          // add the combination to the list because the score is matched.
          combinations.push(combinationsStartingWith);
          // undo the last weight to so we can see if later rulesets will also push us to the threshold
          combinationsStartingWith = [...combinationsStartingWith];
          combinationsStartingWith.pop();
          combinedWeight = combinedWeight - followingRuleset.weight();
        }
      }
    }
    return combinations;
  }

  /*
   * Returns an array of arrays with each sub-array being a minimum combination of rulesets needed to meet this threshold.
   * @return {[][]MatchRulesetDefinition}
   * @since 5.8.0
   */
  minimumMatchCombinations() {
    if (!this._minimumMatchCombinations) {
      const score = this.score();
      const matchingRulesetDefinitions = this.matchable.matchRulesetDefinitions();
      if (score === 0) {
        this._minimumMatchCombinations = matchingRulesetDefinitions;
      } else {
        const rulesetsGreaterOrEqualToScore = [];
        const rulesetsLessThanScore = [];
        for (const rulesetDef of matchingRulesetDefinitions) {
          // if weight is not specified, we assume the rule is important and custom scoring after retrieval will take place.
          if (rulesetDef.weight() === undefined || rulesetDef.weight() >= score) {
            rulesetsGreaterOrEqualToScore.push(rulesetDef);
          } else {
            rulesetsLessThanScore.push(rulesetDef);
          }
        }
        this._minimumMatchCombinations = rulesetsGreaterOrEqualToScore.map((rulesetDef) => [rulesetDef]);
        const lessCombinations = this._otherCombinations(rulesetsLessThanScore);
        this._minimumMatchCombinations = this._minimumMatchCombinations.concat(lessCombinations);
      }
    }
    return this._minimumMatchCombinations;
  }

  /*
   * Returns a string that indicates the threshold's action.
   * @return {string}
   * @since 5.8.0
   */
  action() {
    return this.threshold.action;
  }

  generateMD5Key(documentSet, salt) {
    const values = documentSet.map((contentObj) => contentObj.uri).sort();
    if (salt) {
      values.unshift(salt);
    }
    return xdmp.md5(values.join("##"));
  }

  generateActionURI(matchingDocumentSet) {
    const action = this.action();
    const firstUri = matchingDocumentSet[0].uri;
    let key;
    switch (action) {
      case "merge":
        const currentMergeDoc = matchingDocumentSet.find((contentObj) => contentObj.uri.startsWith("/com.marklogic.smart-mastering/merged/"));
        if (currentMergeDoc) {
          return currentMergeDoc.uri;
        }
        key = this.generateMD5Key(matchingDocumentSet);
        const format = firstUri.substr(firstUri.lastIndexOf(".") + 1);
        return `/com.marklogic.smart-mastering/merged/${key}.${format}`;
      case "notify":
        key = this.generateMD5Key(matchingDocumentSet, this.name());
        return `/com.marklogic.smart-mastering/matcher/notifications/${key}.xml`;
      default:
        return firstUri;
    }
  }

  raw() {
    return this.threshold;
  }

  actionModuleFunction() {
    return this.threshold.actionModuleFunction;
  }

  actionModulePath() {
    return this.threshold.actionModulePath;
  }

  actionModuleNamespace() {
    return this.threshold.actionModuleNamespace;
  }
}

export default {
  Matchable,
  MatchRulesetDefinition
}
