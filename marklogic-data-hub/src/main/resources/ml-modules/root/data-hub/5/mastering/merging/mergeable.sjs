const common = require("/data-hub/5/mastering/common.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

'use strict';

/*
 * A class that encapsulates the configurable portions of the merging process.
 */
const {requireFunction, normalizeToArray} = require("../../impl/hub-utils.sjs");
const consts = require("../../impl/consts.sjs");
const {merge} = require("../../../third-party/fast-xml-parser/src/util");

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
   * Returns a default merge strategy if it exists
   * @return MergeRuleDefinition
   * @since 5.8.0
   */
  defaultMergeRuleDefinition() {
    if (!this._defaultMergeRuleDefinition) {
      const defaultRule = (this.mergeStep.mergeStrategies || []).find((strategy) => (strategy.default) || {});
      this._defaultMergeRuleDefinition = new MergeRuleDefinition(defaultRule, this);
    }
    return this._defaultMergeRuleDefinition;
  }

  /*
   * Returns a contentObject after processing multiple contentObjects
   * @return contentObject
   * @since 5.8.0
   */
  buildMergeDocument(contentObjects) {
    const format = xdmp.uriFormat(contentObjects[0].uri);
    const documentNodes = contentObjects.map(contentObj => contentObj.value);
    const properties = [];
    // get properties that have rules defined for them
    for (const mergeRuleDefinition of this.mergeRuleDefinitions()) {
      const mergedProperties = mergeRuleDefinition.mergeProperties(documentNodes);
      const mergeXPathInformation = mergeRuleDefinition.xpathInformation();
      properties.push([mergeXPathInformation, mergedProperties]);
    }
    // set defaults for entity properties not explicitly set
    const defaultRule = (this.mergeStep.mergeStrategies || []).find((strategy) => (strategy.default) || {});
    for (const topModelProperty of this.model().topLevelProperties()) {
      const existingEntity = properties.find(
        prop => prop[0].entityPropertyPath &&
          (prop[0].entityPropertyPath === topModelProperty || prop[0].entityPropertyPath.startsWith(`${prop[0].entityPropertyPath}.`))
      );
      if (!existingEntity) {
        const mergeRuleDefinition = new MergeRuleDefinition(Object.assign({entityPropertyPath: topModelProperty}, defaultRule), this);
        const mergedProperties = mergeRuleDefinition.mergeProperties(documentNodes);
        const mergeXPathInformation = mergeRuleDefinition.xpathInformation();
        properties.push([mergeXPathInformation, mergedProperties]);
      }
    }
    return format === "json" ? this.mergeJsonDocuments(documentNodes, properties):  this.mergeXmlDocuments(documentNodes, properties);
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
    const lastUpdatedMetadata = xdmp.nodeMetadataValue(documentNode, consts.CREATED_ON);
    if (this.mergeStep.lastUpdatedLocation || !lastUpdatedMetadata) {
      if (!this.mergeStep.lastUpdatedLocation) {
        this.mergeStep.lastUpdatedLocation = {documentXPath: "/*:envelope/*:headers/createdOn"}
      }
      return fn.string(fn.head(documentNode.xpath(this.mergeStep.lastUpdatedLocation.documentXPath, this.mergeStep.lastUpdatedLocation.namespaces)));
    }
    return lastUpdatedMetadata;
  }

  model() {
    return this._model;
  }

  mergeJsonDocuments(documentNodes, properties) {
    const newMergeDocument = { envelope: {
        headers: {
          merges: {}
        },
        instance: {},
        triples: []
      }
    };
    const merges = newMergeDocument.envelope.headers.merges;
    const instance = newMergeDocument.envelope.instance;
    for (const property of properties) {
      const [propertyXPathInfo, propertyOutput] = property;
      if (fn.exists(propertyOutput)) {
        const instanceXPath = String(propertyXPathInfo.documentXPath).replace(/^\/\(es:envelope\|envelope\)\/\(es:instance\|instance\)\//, "");
        const propertyDefinitions = common.propertyDefinitionsFromXPath(instanceXPath,propertyXPathInfo.namespaces);
        let placeInInstance = instance, lastPropertyName = "", pathCount = 0;
        for (const propertyDefinition of propertyDefinitions) {
          lastPropertyName = propertyDefinition.localname;
          placeInInstance[lastPropertyName] = placeInInstance[lastPropertyName] || {};
          if (pathCount < (propertyDefinitions.length - 1)) {
            placeInInstance = placeInInstance[lastPropertyName];
          }
          pathCount++;
        }
        let values = [];
        for (const output of hubUtils.normalizeToArray(propertyOutput)) {
          values = values.concat(hubUtils.normalizeToArray(output.values));
          this.setMergeInformation(merges, instanceXPath, output);
        }
        if (values.length <= 1) {
          values = values[0];
        }
        placeInInstance[lastPropertyName] = values;
      }
    }
    return new NodeBuilder().addNode(newMergeDocument).toNode();
  }

  mergeXmlDocuments(documentNodes, properties) {
    const nodeBuilder = new NodeBuilder();
    nodeBuilder.startDocument();
    nodeBuilder.startElement("es:envelope", "http://marklogic.com/entity-services");
    nodeBuilder.startElement("es:instance", "http://marklogic.com/entity-services");
    if (this.mergeStep.targetEntityType) {
      const targetEntityType = this.mergeStep.targetEntityType;
      const iriParts = targetEntityType.split("/");
      nodeBuilder.startElement("es:info", "http://marklogic.com/entity-services");
      nodeBuilder.startElement("es:title", "http://marklogic.com/entity-services");
      nodeBuilder.addText(iriParts[iriParts.length - 1]);
      // end es:title
      nodeBuilder.endElement();
      nodeBuilder.startElement("es:version", "http://marklogic.com/entity-services");
      nodeBuilder.addText(iriParts[iriParts.length - 2].split("-")[1]);
      // end es:version
      nodeBuilder.endElement();
      // end es:info
      nodeBuilder.endElement();

    }
    const merges = {};
    const placeInXml = [];
    for (const property of properties.sort((a,b)=> a[0].documentXPath.localeCompare(b[0].documentXPath))) {
      const [propertyXPathInfo, propertyOutput] = property;
      if (fn.exists(propertyOutput)) {
        const instanceXPath = propertyXPathInfo.documentXPath.replace(/^\/\(es:envelope\|envelope\)\/\(es:instance\|instance\)\//, "");
        const propertyDefinitions = common.propertyDefinitionsFromXPath(instanceXPath,propertyXPathInfo.namespaces);
        // don't want the last property definition to be included as it will come as part of addNode.
        propertyDefinitions.pop();
        // close out elements we've moved on from
        for (let placeIndex = placeInXml.length - 1; placeIndex >= 0; placeIndex--) {
          const place = placeInXml[placeIndex];
          if (!(propertyDefinitions[placeIndex] && place === propertyDefinitions[placeIndex].localname)) {
            nodeBuilder.endElement();
            placeInXml.pop();
          }
        }
        let propDefIndex = 0;
        // get to the proper level of the XML document
        for (const propertyDefinition of propertyDefinitions) {
          if (placeInXml[propDefIndex] !== propertyDefinition.localname) {
            placeInXml.push(propertyDefinition.localname);
            nodeBuilder.startElement(propertyDefinition.localname, propertyDefinition.namespace);
          }
          propDefIndex++;
        }
        // add values
        for (const output of hubUtils.normalizeToArray(propertyOutput)) {
          for (const value of hubUtils.normalizeToArray(output.values)) {
            nodeBuilder.addNode(value);
          }
          this.setMergeInformation(merges, instanceXPath, output);
        }
      }
    }
    for (const place of placeInXml) {
      nodeBuilder.endElement();
    }
    // end instance
    nodeBuilder.endElement();
    nodeBuilder.startElement("es:headers", "http://marklogic.com/entity-services");
    nodeBuilder.startElement("merges", "");
    this.jsonToJsonXML(nodeBuilder, merges);
    // end merges
    nodeBuilder.endElement();
    // end headers
    nodeBuilder.endElement();
    // end envelope
    nodeBuilder.endElement();
    nodeBuilder.endDocument();
    return nodeBuilder.toNode();
  }

  jsonToJsonXML(nodeBuilder, json) {
    if (Array.isArray(json)) {
      nodeBuilder.startElement("json:array", "http://marklogic.com/xdmp/json");
      for (const item of json) {
        this.jsonToJsonXML(nodeBuilder, item);
      }
      nodeBuilder.endElement();
    } else if (typeof json === "object") {
      nodeBuilder.startElement("json:object", "http://marklogic.com/xdmp/json");
      nodeBuilder.addAttribute("xmlns:xs","http://www.w3.org/2001/XMLSchema");
      for (const key of Object.keys(json)) {
        nodeBuilder.startElement("json:entry", "http://marklogic.com/xdmp/json");
        nodeBuilder.startElement("json:key", "http://marklogic.com/xdmp/json");
        nodeBuilder.addText(key);
        nodeBuilder.endElement();
        this.jsonToJsonXML(nodeBuilder, json[key]);
        nodeBuilder.endElement();
      }
      nodeBuilder.endElement();
    } else {
      const type = xdmp.type(json);
      nodeBuilder.startElement("json:value", "http://marklogic.com/xdmp/json");
      nodeBuilder.addAttribute("xsi:type",`xs:${fn.string(type)}`, "http://www.w3.org/2001/XMLSchema-instance");
      nodeBuilder.addText(json);
      nodeBuilder.endElement();
    }
  }

  setMergeInformation(merges, instanceXPath, output) {
    for (const source of output.sources) {
      const {documentUri, dateTime, name} = source instanceof Node ? source.toObject() : source;
      merges[dateTime] = merges[dateTime] || [];
      const existingEntry = merges[dateTime].find((entry) => entry.documentUri === documentUri && entry.name === name);
      if (existingEntry) {
        existingEntry.contributions.push(instanceXPath);
      } else {
        merges[dateTime].push({documentUri, name, contributions: [ instanceXPath ]});
      }
    }
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

  xpathInformation() {
    if (!this.mergeRule.documentXPath) {
      Object.assign(this.mergeRule, {
        documentXPath: this.mergeable.model().propertyPathXPath(this.mergeRule.entityPropertyPath),
        namespaces: this.mergeable.model().namespaces()
      });
    }
    return this.mergeRule;
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
      const dateTime = this.mergeable.lastTimestamp(documentNode) || fn.string(fn.currentDateTime());
      const datahubSourceNamesFromXML = fn.distinctValues(documentNode.xpath(".//*:datahubSourceName"));
      const names = fn.exists(datahubSourceNamesFromXML) ? datahubSourceNamesFromXML: xdmp.nodeMetadataValue(documentNode, "datahubSourceName");
      const sources = normalizeToArray(names).map((name) => {
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