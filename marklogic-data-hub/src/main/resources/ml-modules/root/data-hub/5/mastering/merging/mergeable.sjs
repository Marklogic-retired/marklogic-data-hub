const common = require("/data-hub/5/mastering/common.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

'use strict';

/*
 * A class that encapsulates the configurable portions of the merging process.
 */
const {requireFunction, normalizeToArray} = require("../../impl/hub-utils.sjs");

class Mergeable {

  constructor(mergeStep, options) {
    this.mergeStep = mergeStep;
    this.options = options;
    const targetEntityType = this.mergeStep.targetEntityType;
    if (targetEntityType) {
      const getEntityModel = hubUtils.requireFunction("/data-hub/core/models/entities.sjs", "getEntityModel");
      this._model = getEntityModel(targetEntityType);
    }
    if (!this._model) {
      this._model = new common.GenericMatchModel(this.mergeStep, {collection: targetEntityType ? targetEntityType.substring(targetEntityType.lastIndexOf("/") + 1):null});
    }

  }

  /*
   * Returns an array of MergeRuleDefinitions class instances that describe the rule sets for merging
   * @return []MergeRuleDefinitions
   * @since 5.8.0
   */
  mergeRuleDefinitions() {
    if (!this._mergeRuleDefinitions) {
      this._mergeRuleDefinitions = this.mergeStep.mergeRules.map((mergeRule) => {
        if (mergeRule.mergeStrategyName) {
          const mergeStrategy = (this.mergeStep.mergeStrategies || []).find((strategy) => strategy.strategyName === mergeRule.mergeStrategyName);
          Object.assign(mergeRule, mergeStrategy);
        }
        return new MergeRuleDefinition(mergeRule, this);
      });
    }
    return this._mergeRuleDefinitions;
  }

  /*
   * Returns a contentObject after processing multiple contentObjects
   * @return contentObject
   * @since 5.8.0
   */
  buildMergeDocument(contentObject) {
  }

  /*
   * Returns contentObject after applying respective actions to it
   * @return contentObject
   * @since 5.8.0
   */
  applyDocumentContext(contentObject, actionDetails) {
    const targetEntity = this.options.targetEntityType || this.options.targetEntityTitle;
    switch (actionDetails.action) {
      case "merge" :
        contentObject.context.collections.push(`sm-${targetEntity}-merged`);
        contentObject.context.collections.push(`sm-${targetEntity}-mastered`);
        break;
      case "notify":
        contentObject.context.collections.push(`sm-${targetEntity}-notification`);
        break;
      case "no-action":
        contentObject.context.collections.push(`sm-${targetEntity}-mastered`);
        break;
      default:
    }
    return common.applyInterceptors("Apply Document context interceptor", contentObject, this.mergeStep.customApplyDocumentContextInterceptors, actionDetails, targetEntity);
  }

  lastTimestamp(documentNode) {
    return documentNode.xpath(this.mergeStep.lastUpdatedLocation.documentXPath, this.mergeStep.lastUpdatedLocation.namespaces);
  }

  model() {
    return this._model;
  }
}

class MergeRuleDefinition {

  constructor(mergeRule, mergeable) {
    this.mergeRule = mergeRule;
    this.mergeable = mergeable;
  }

  name() {
    return this.mergeRule.entityPropertyPath || this.mergeRule.documentXPath;
  }

  /*
   * Returns an array of MergeRuleDefinitions class instances that describe the rule sets for merging
   * @param {[]DocumentNode}
   * @return {[]PropertySpecifications} - {  }
   * @since 5.8.0
   */
  mergeProperties(documentNodes) {
    let mergeModulePath = "/com.marklogic.smart-mastering/survivorship/merging/standard.xqy", mergeModuleFunction = "standard";
    if (this.mergeRule.mergeModulePath) {
      mergeModulePath = this.mergeRule.mergeModulePath;
      mergeModuleFunction = this.mergeRule.mergeModuleFunction;
    }
    const convertToNode = /\.xq[yml]?$/.test(mergeModulePath);
    let propertiesByDocument = documentNodes.map((documentNode) => {
      const documentUri = xdmp.nodeUri(documentNode);
      let nodeValues;
      if (this.mergeRule.documentXPath) {
        nodeValues = documentNode.xpath(this.mergeRule.documentXPath, this.mergeRule.namespaces);
      } else {
        nodeValues = this.mergeable.model().propertyValues(this.mergeRule.entityPropertyPath, documentNode);
      }
      if (fn.empty(nodeValues)) {
        return null;
      }
      const dateTime = this.mergeable.lastTimestamp(documentNode);
      const names = fn.distinctValues(documentNode.xpath(".//*:datahubSourceName"));
      const sources = names.toArray().map((name) => {
        let sourceObject = { documentUri, name, dateTime };
        if (convertToNode) {
          sourceObject = new NodeBuilder().addNode(sourceObject).toNode();
        }
        return sourceObject;
      })
      return {
        sources: convertToNode ? Sequence.from(sources): sources,
        values: nodeValues
      };
    }).filter((properties) => properties)
    if (!propertiesByDocument.length) {
      return [];
    }
    const propertyName = fn.nodeName(fn.head(propertiesByDocument[0].values));
    let passMergeRule = this.mergeRule;
    if (convertToNode) {
      passMergeRule = new NodeBuilder().addNode(passMergeRule).toNode();
      propertiesByDocument = Sequence.from(propertiesByDocument);
    }
    const mergeFunction = requireFunction(mergeModulePath, mergeModuleFunction);
    return normalizeToArray(mergeFunction(propertyName, propertiesByDocument, passMergeRule));
  }

  raw() {
    return this.mergeRule;
  }
}

module.exports = {
  Mergeable,
  MergeRuleDefinition
}