import common from "/data-hub/5/mastering/common.mjs";

'use strict';

/*
 * A class that encapsulates the configurable portions of the merging process.
 */
import hubUtil from '/data-hub/5/impl/hub-utils.mjs';
import consts from "../../impl/consts.mjs";

const sem = require("/MarkLogic/semantics.xqy");

const mergingDebugTraceEnabled = xdmp.traceEnabled(consts.TRACE_MERGING_DEBUG);
const mergingTraceEnabled = xdmp.traceEnabled(consts.TRACE_MERGING) || mergingDebugTraceEnabled;
const mergingTraceEvent = xdmp.traceEnabled(consts.TRACE_MERGING) ? consts.TRACE_MERGING : consts.TRACE_MERGING_DEBUG;
const rdfType = sem.curieExpand("rdf:type");
const rdfsIsDefinedBy = sem.curieExpand("rdfs:isDefinedBy");


export default class Mergeable {

  constructor(mergeStep, stepExecutionContext) {
    if (stepExecutionContext != null && stepExecutionContext.flowExecutionContext != null) {
      this.memoryContent = stepExecutionContext.flowExecutionContext.matchingStepContentArray;
    }
    if (mergeStep.merging) {
      const updateMergeOptions = hubUtil.requireFunction("/data-hub/5/data-services/mastering/updateMergeOptionsLib.mjs", "updateMergeOptions");
      this.mergeStep = updateMergeOptions(mergeStep);
    } else {
      this.mergeStep = mergeStep;
    }
    const targetEntityType = this.mergeStep.targetEntityType;
    if (targetEntityType) {
      const getEntityModel = hubUtil.requireFunction("/data-hub/core/models/entities.sjs", "getEntityModel");
      this._model = getEntityModel(targetEntityType);
      if (this._model && this._model.primaryEntityTypeIRI() !== targetEntityType) {
        this.mergeStep.targetEntityType = this._model.primaryEntityTypeIRI();
      }
      this.entityName = this.mergeStep.targetEntityType.substring(this.mergeStep.targetEntityType.lastIndexOf("/") + 1);
      const targetEntityTitle = this.mergeStep.targetEntityType.substring(this.mergeStep.targetEntityType.lastIndexOf("/") + 1);
      this.mergeStep.targetCollections = this.mergeStep.targetCollections || {};

      this.mergeStep.targetCollections.onMerge = this.mergeStep.targetCollections.onMerge || {};
      this.mergeStep.targetCollections.onMerge.add = [`sm-${targetEntityTitle}-merged`, `sm-${targetEntityTitle}-mastered`, targetEntityTitle].concat(this.mergeStep.targetCollections.onMerge.add || []).filter(c => c);

      this.mergeStep.targetCollections.onNoMatch = this.mergeStep.targetCollections.onNoMatch || {};
      this.mergeStep.targetCollections.onNoMatch.add = [`sm-${targetEntityTitle}-mastered`, targetEntityTitle].concat(this.mergeStep.targetCollections.onNoMatch.add || []).filter(c => c);
      this.mergeStep.targetCollections.onNoMatch.remove = [`sm-${targetEntityTitle}-archived`].concat(this.mergeStep.targetCollections.onMerge.remove || []);

      this.mergeStep.targetCollections.onNotification = this.mergeStep.targetCollections.onNotification || {};
      this.mergeStep.targetCollections.onNotification.add = [`sm-${targetEntityTitle}-notification`].concat(this.mergeStep.targetCollections.onNotification.add || []).filter(c => c);

      this.mergeStep.targetCollections.onArchive = this.mergeStep.targetCollections.onArchive || {};
      this.mergeStep.targetCollections.onArchive.add = [`sm-${targetEntityTitle}-archived`].concat(this.mergeStep.targetCollections.onArchive.add || []);
      this.mergeStep.targetCollections.onArchive.remove = [`sm-${targetEntityTitle}-mastered`, targetEntityTitle].concat(this.mergeStep.targetCollections.onArchive.remove || []).filter(c => c);

      this.mergeStep.targetCollections.onAuditing = this.mergeStep.targetCollections.onAuditing || {};
      this.mergeStep.targetCollections.onAuditing.add = [`sm-${targetEntityTitle}-auditing`].concat(this.mergeStep.targetCollections.onAuditing.add || []).filter(c => c);
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
      this._mergeRuleDefinitions = (this.mergeStep.mergeRules || []).map((mergeRule) => {
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
      const defaultRule = (this.mergeStep.mergeStrategies || []).find((strategy) => strategy.default)|| {};
      this._defaultMergeRuleDefinition = new MergeRuleDefinition(defaultRule, this);
    }
    return this._defaultMergeRuleDefinition;
  }

  /*
   * Returns a contentObject after processing multiple contentObjects
   * @param contentObjects
   * @return contentObject
   * @since 5.8.0
   */
  buildMergeDocument(contentObjects, id = "newMergeURI") {
    if (mergingTraceEnabled) {
      xdmp.trace(mergingTraceEvent, `Building merge document with mergeable: ${xdmp.toJsonString(this.mergeStep)} and content: ${xdmp.toJsonString(contentObjects)}`);
    }
    const format = xdmp.uriFormat(contentObjects[0].uri);
    const properties = [];
    // get properties that have rules defined for them
    for (const mergeRuleDefinition of this.mergeRuleDefinitions()) {
      const mergedProperties = mergeRuleDefinition.mergeProperties(contentObjects);
      const mergeXPathInformation = mergeRuleDefinition.xpathInformation();
      properties.push([mergeXPathInformation, mergedProperties]);
    }
    // set defaults for entity properties not explicitly set
    const defaultRule = (this.mergeStep.mergeStrategies || []).find((strategy) => strategy.default) || {};
    for (const topModelProperty of this.model().topLevelProperties()) {
      const existingEntity = properties.find(
        prop => prop[0].entityPropertyPath &&
          (prop[0].entityPropertyPath === topModelProperty || prop[0].entityPropertyPath.startsWith(`${prop[0].entityPropertyPath}.`))
      );
      if (!existingEntity) {
        const mergeRuleDefinition = new MergeRuleDefinition(Object.assign({entityPropertyPath: topModelProperty}, defaultRule), this);
        const mergedProperties = mergeRuleDefinition.mergeProperties(contentObjects);
        const mergeXPathInformation = mergeRuleDefinition.xpathInformation();
        properties.push([mergeXPathInformation, mergedProperties]);
      }
    }
    const documentNodes = hubUtil.normalizeToArray(contentObjects).map(contentObj => contentObj.value);
    const distinctHeaderNodeNames = fn.distinctValues(Sequence.from(documentNodes.map((doc) => doc.xpath("*:envelope/*:headers/* ! fn:node-name(.)"))));
    // merge headers
    for (const topHeader of distinctHeaderNodeNames) {
      const nameString = String(topHeader);
      const prefix = fn.contains(nameString, ":") ? nameString.substring(0, nameString.indexOf(":")): "";
      const mergeRuleDefinition = new MergeRuleDefinition(Object.assign({documentXPath: `/(es:envelope|envelope)/(es:headers|headers)/${nameString}`, namespaces: { es: "http://marklogic.com/entity-services", [prefix]: fn.namespaceUriFromQName(topHeader)}}, defaultRule), this);
      const mergedProperties = mergeRuleDefinition.mergeProperties(contentObjects);
      const mergeXPathInformation = mergeRuleDefinition.xpathInformation();
      properties.push([mergeXPathInformation, mergedProperties]);
    }
    let triples = null;
    if (this.mergeStep.tripleMerge) {
      const tripleMergeFunction = hubUtil.requireFunction(this.mergeStep.tripleMerge.at, this.mergeStep.tripleMerge.function);
      triples = tripleMergeFunction(this.mergeStep, documentNodes, properties.map(prop => prop[1].sources), this.mergeStep.tripleMerge);
    } else {
      const triplesArray = [
        Sequence.from(documentNodes.map(doc => {
          try {
            return doc.xpath("/*:envelope/(es:triples|array-node('triples'))/(object-node()|.//sem:triple) ! sem:triple(.)", {
              es: "http://marklogic.com/entity-services",
              sem: "http://marklogic.com/semantics"
            });
          } catch (e) {
            return Sequence.from([]);
          }
      }))
      ];
      const uris = hubUtil.normalizeToArray(contentObjects).map(contentObj => contentObj.uri);
      const tdeTriples = cts.triples(null, [rdfType, rdfsIsDefinedBy], null, ["=","=","="], [], cts.documentQuery(uris));
      for (const tdeTriple of tdeTriples) {
        if (!fn.string(sem.tripleObject(tdeTriple)).startsWith("http://marklogic.com/view/")) {
          if (fn.string(sem.triplePredicate(tdeTriple)) === fn.string(rdfsIsDefinedBy)) {
            triplesArray.push(sem.triple(sem.tripleSubject(tdeTriple), rdfsIsDefinedBy, id));
          } else {
            triplesArray.push(tdeTriple);
          }
        }
      }
      triples = fn.distinctValues(Sequence.from(triplesArray));
    }
    if (mergingTraceEnabled) {
      xdmp.trace(mergingTraceEvent, `Found the follow triples for merge: ${xdmp.describe(triples, Sequence.from([]), Sequence.from([]))}`);
    }
    return format === "json" ? this.mergeJsonDocuments(documentNodes, properties, id, triples):  this.mergeXmlDocuments(documentNodes, properties, id, triples);
  }

  /*
   * Returns a contentObject for a notification document
   * @param uri - uri for notification
   * @param thresholdName
   * @param payload - cts.query or uris
   * @return contentObject
   * @since 5.8.0
   */
  buildNotification(uri, thresholdName, payload, matchStepName, matchStepFlow) {
    const nodeBuilder = new NodeBuilder();
    nodeBuilder
      .startElement("sm:notification", "http://marklogic.com/smart-mastering")
      .startElement("sm:meta", "http://marklogic.com/smart-mastering")
      .startElement("sm:dateTime", "http://marklogic.com/smart-mastering")
      .addText(fn.string(fn.currentDateTime()))
      .endElement()
      .startElement("sm:user", "http://marklogic.com/smart-mastering")
      .addText(xdmp.getCurrentUser())
      .endElement()
      .startElement("sm:status", "http://marklogic.com/smart-mastering")
      .addText("unread")
      .endElement()
      .startElement("sm:entityName", "http://marklogic.com/smart-mastering")
      .addText(this.entityName || "")
      .endElement()
      .startElement("sm:matchStepName", "http://marklogic.com/smart-mastering")
      .addText(matchStepName || "")
      .endElement()
      .startElement("sm:matchStepFlow", "http://marklogic.com/smart-mastering")
      .addText(matchStepFlow || "")
      .endElement()
      .endElement()
      .startElement("sm:threshold-label", "http://marklogic.com/smart-mastering")
      .addText(thresholdName)
      .endElement();
    if (payload instanceof cts.query) {
      nodeBuilder.startElement("sm:query", "http://marklogic.com/smart-mastering");
      nodeBuilder.addNode(payload);
      nodeBuilder.endElement();
    } else {
      nodeBuilder.startElement("sm:document-uris", "http://marklogic.com/smart-mastering");
      for (const uri of payload) {
        nodeBuilder.startElement("sm:document-uri", "http://marklogic.com/smart-mastering");
        nodeBuilder.addText(uri);
        nodeBuilder.endElement();
      }
      nodeBuilder.endElement();
    }
    nodeBuilder.endElement();
    return {
      uri,
      value: nodeBuilder.toNode(),
      context: {
        collections: [],
        permissions: [xdmp.permission("data-hub-common","read"),xdmp.permission("data-hub-common","update")]
      }
    }
  }

  /*
 * Returns a contentObject for an auditing document
 * @param uri - uri
 * @param thresholdName
 * @param payload - cts.query or uris
 * @return contentObject
 * @since 5.8.0
 */
  buildAuditDocument(newUri, previousUris, action) {
    const prefix = "http://marklogic.com/smart-mastering/auditing#";
    const dateTime = fn.string(fn.currentDateTime());
    const username = xdmp.getCurrentUser();
    const newEntityId = `${prefix}${newUri}`;
    const activityId = `${prefix}${action}-${newUri}-${xdmp.request()}`;
    const userId = `${prefix}user-${username}`
    const nodeBuilder = new NodeBuilder();
    nodeBuilder
      .startElement("prov:document", "http://www.w3.org/ns/prov#")
      .addAttribute("xmlns:xsd","http://www.w3.org/2001/XMLSchema")
      .addAttribute("xmlns:xsi","http://www.w3.org/2001/XMLSchema-instance")
      .addAttribute("xmlns:foaf","http://xmlns.com/foaf/0.1/")
      .startElement("auditing:new-uri", "http://marklogic.com/smart-mastering/auditing")
      .addText(newUri)
      .endElement();
    nodeBuilder
      .startElement("prov:collection", "http://www.w3.org/ns/prov#")
      .startElement("prov:id", "http://www.w3.org/ns/prov#")
      .addText(newEntityId)
      .endElement()
      .startElement("prov:type", "http://www.w3.org/ns/prov#")
      .addAttribute("xsi:type","xsd:string")
      .addText(`result record for ${action}`)
      .endElement()
      .startElement("prov:label", "http://www.w3.org/ns/prov#")
      .addText(newUri)
      .endElement()
      .endElement();
    for (const uri of previousUris) {
      nodeBuilder
        .startElement("auditing:previous-uri", "http://marklogic.com/smart-mastering/auditing")
        .addText(uri)
        .endElement();
      const contribId = prefix + uri;
      nodeBuilder
        .startElement("prov:collection", "http://www.w3.org/ns/prov#")
        .startElement("prov:id", "http://www.w3.org/ns/prov#")
        .addText(contribId)
        .endElement()
        .startElement("prov:type", "http://www.w3.org/ns/prov#")
        .addAttribute("xsi:type","xsd:string")
        .addText(`contributing record for ${action}`)
        .endElement()
        .startElement("prov:label", "http://www.w3.org/ns/prov#")
        .addText(uri)
        .endElement()
        .endElement();
      nodeBuilder
        .startElement("prov:wasDerivedFrom", "http://www.w3.org/ns/prov#")
        .startElement("prov:generatedEntity", "http://www.w3.org/ns/prov#")
        .addAttribute("prov:ref", newEntityId)
        .endElement()
        .startElement("prov:usedEntity", "http://www.w3.org/ns/prov#")
        .addAttribute("prov:ref", contribId)
        .endElement()
        .startElement("prov:activity", "http://www.w3.org/ns/prov#")
        .addAttribute("prov:ref", activityId)
        .endElement()
        .endElement();
    }
    nodeBuilder
      .startElement("prov:agent", "http://www.w3.org/ns/prov#")
      .addAttribute("prov:id", userId)
      .startElement("prov:type", "http://www.w3.org/ns/prov#")
      .addAttribute("xsi:type","xsd:QName")
      .addText("foaf:OnlineAccount")
      .endElement()
      .startElement("foaf:accountName", "http://xmlns.com/foaf/0.1/")
      .addText(username)
      .endElement()
      .endElement();
    nodeBuilder
      .startElement("prov:wasAttributedTo", "http://www.w3.org/ns/prov#")
      .startElement("prov:entity", "http://www.w3.org/ns/prov#")
      .addAttribute("prov:ref", newEntityId)
      .endElement()
      .startElement("prov:agent", "http://www.w3.org/ns/prov#")
      .addAttribute("prov:ref", userId)
      .endElement()
      .endElement();
    nodeBuilder
      .startElement("prov:activity", "http://www.w3.org/ns/prov#")
      .startElement("prov:id", "http://www.w3.org/ns/prov#")
      .addText(activityId)
      .endElement()
      .startElement("prov:type", "http://www.w3.org/ns/prov#")
      .addText(action)
      .endElement()
      .startElement("prov:label", "http://www.w3.org/ns/prov#")
      .addText(`${action} by ${username}`)
      .endElement()
      .endElement();
    nodeBuilder
      .startElement("prov:wasGeneratedBy", "http://www.w3.org/ns/prov#")
      .startElement("prov:entity", "http://www.w3.org/ns/prov#")
      .addAttribute("prov:ref", newEntityId)
      .endElement()
      .startElement("prov:activity", "http://www.w3.org/ns/prov#")
      .addAttribute("prov:ref", activityId)
      .endElement()
      .startElement("prov:activity", "http://www.w3.org/ns/prov#")
      .addText(dateTime)
      .endElement()
      .endElement();
    nodeBuilder.endElement();
    return {
      // hidden so we don't create Data Hub provenance for these provenance documents
      hidden: true,
      uri: `/com.marklogic.smart-mastering/auditing/${action}/${sem.uuidString()}.xml`,
      value: nodeBuilder.toNode(),
      context: {
        collections: [],
        permissions: [xdmp.permission("data-hub-common","read"),xdmp.permission("data-hub-common","update")]
      }
    }
  }

  /*
   * Returns contentObject after applying respective actions to it
   * @return contentObject
   * @since 5.8.0
   */
  applyDocumentContext(contentObject, actionDetails) {
    const targetEntity = this.mergeStep.targetEntityType ? this.mergeStep.targetEntityType.substring(this.mergeStep.targetEntityType.lastIndexOf("/") + 1): "content";
    const targetCollections = this.mergeStep.targetCollections;
    const targetPermissions = this.mergeStep.targetPermissions;
    let eventName = null;
    switch (actionDetails.action) {
      case "merge" :
        eventName = "onMerge";
        break;
      case "notify":
        eventName = "onNotification";
        break;
      case "archive":
        eventName = "onArchive";
        break;
      case "audit":
        eventName = "onAuditing";
        break;
      case "no-action":
        eventName = "onNoMatch";
        break;
      default:
    }
    // set collections
    if (targetCollections && targetCollections[eventName] && targetCollections[eventName].add) {
      for (const coll of targetCollections[eventName].add) {
        if (!contentObject.context.collections.includes(coll)) {
          contentObject.context.collections.push(coll);
        }
      }
    }
    if (targetCollections && targetCollections[eventName] && targetCollections[eventName].remove) {
      contentObject.context.collections = contentObject.context.collections.filter(coll => !targetCollections[eventName].remove.includes(coll));
    }
    // set permissions
    if (targetPermissions && targetPermissions[eventName] && targetPermissions[eventName].add) {
      for (const perm of hubUtil.parsePermissions(targetPermissions[eventName].add)) {
        if (!contentObject.context.permissions.includes(perm)) {
          contentObject.context.permissions.push(perm);
        }
      }
    }
    if (targetPermissions && targetPermissions[eventName] && targetPermissions[eventName].remove) {
      const removePermissions = hubUtil.parsePermissions(targetPermissions[eventName].remove);
      contentObject.context.permissions = contentObject.context.permissions.filter(perm => !removePermissions.includes(perm));
    }
    return common.applyInterceptors("Apply Document context interceptor", contentObject, this.mergeStep.customApplyDocumentContextInterceptors, actionDetails, targetEntity);
  }

  lastTimestamp(documentNode) {
    const lastUpdatedMetadata = xdmp.nodeMetadataValue(documentNode, consts.CREATED_ON);
    if (this.mergeStep.lastUpdatedLocation && this.mergeStep.lastUpdatedLocation.documentXPath || !lastUpdatedMetadata) {
      if (!(this.mergeStep.lastUpdatedLocation && this.mergeStep.lastUpdatedLocation.documentXPath)) {
        this.mergeStep.lastUpdatedLocation = {documentXPath: "/*:envelope/*:headers/createdOn"};
      }
      return fn.string(fn.head(documentNode.xpath(this.mergeStep.lastUpdatedLocation.documentXPath, this.mergeStep.lastUpdatedLocation.namespaces)));
    }
    return lastUpdatedMetadata;
  }

  model() {
    return this._model;
  }

  mergeJsonDocuments(documentNodes, properties, id, triples) {
    const newMergeDocument = { envelope: {
        headers: {
          id,
          merges: [],
          "merge-options": {
            lang: "zxx",
            value: this.mergeStepToCompressedHex()
          }
        },
        instance: {},
        triples
      }
    };
    const merges = newMergeDocument.envelope.headers.merges;
    for (const property of properties) {
      const [propertyXPathInfo, propertyOutput] = property;
      if (fn.exists(propertyOutput)) {
        const instanceXPath = String(propertyXPathInfo.documentXPath);
        const propertyDefinitions = common.propertyDefinitionsFromXPath(instanceXPath,propertyXPathInfo.namespaces);
        let placeInInstance = newMergeDocument, lastPropertyName = "", pathCount = 0;
        for (const propertyDefinition of propertyDefinitions) {
          lastPropertyName = propertyDefinition.localname;
          placeInInstance[lastPropertyName] = placeInInstance[lastPropertyName] || {};
          if (pathCount < (propertyDefinitions.length - 1)) {
            placeInInstance = placeInInstance[lastPropertyName];
          }
          pathCount++;
        }
        let values = [];
        for (const output of hubUtil.normalizeToArray(propertyOutput)) {
          values = values.concat(hubUtil.normalizeToArray(output.values));
          this.setMergeInformation(merges, instanceXPath, output);
        }
        if (values.length <= 1 && !propertyOutput.retainArray) {
          values = values[0];
        }
        placeInInstance[lastPropertyName] = values;
      }
    }
    if (this.mergeStep.targetEntityType) {
      const targetEntityType = this.mergeStep.targetEntityType;
      const iriParts = targetEntityType.split("/");
      newMergeDocument.envelope.instance.info = {
        title: iriParts[iriParts.length - 1],
        version: iriParts[iriParts.length - 2] ? iriParts[iriParts.length - 2].split("-")[1]:"0.0.1",
      };
    }
    return new NodeBuilder().addNode(newMergeDocument).toNode();
  }

  mergeStepToCompressedHex() {
    if (this._zipHex === undefined) {
      const mergeJsonNode = xdmp.toJSON(this.mergeStep);
      const zipFile = mergeJsonNode ? xdmp.zipCreate([{"path": "merge-options.json"}], [mergeJsonNode]) : null;
      this._zipHex = zipFile ? fn.string(xs.hexBinary(zipFile)) : null;
    }
    return this._zipHex;
  }

  mergeXmlDocuments(documentNodes, properties, id, triples) {
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
      nodeBuilder.addText(iriParts[iriParts.length - 2] ? iriParts[iriParts.length - 2].split("-")[1]:"0.0.1");
      // end es:version
      nodeBuilder.endElement();
      // end es:info
      nodeBuilder.endElement();

    }
    const merges = [];
    const sortedProperties = properties.sort((a,b)=> a[0].documentXPath.localeCompare(b[0].documentXPath));
    this.mergePropertiesIntoXML(nodeBuilder, sortedProperties, /^\/(\(es:envelope\|envelope\)|(es\:)?envelope)\/(\(es:instance\|instance\)|(es\:)?instance)\//, merges);
    // end instance
    nodeBuilder.endElement();
    nodeBuilder.startElement("es:headers", "http://marklogic.com/entity-services");
    this.mergePropertiesIntoXML(nodeBuilder, sortedProperties, /^\/(\(es:envelope\|envelope\)|(es\:)?envelope)\/(\(es:headers\|headers\)|(es\:)?headers)\//, merges);
    nodeBuilder.startElement("sm:id", "http://marklogic.com/smart-mastering");
    if (id) {
      nodeBuilder.addText(id);
    }
    nodeBuilder.endElement();
    nodeBuilder.startElement("sm:merges", "http://marklogic.com/smart-mastering");
    for (const merge of merges) {
      nodeBuilder.startElement("sm:document-uri", "http://marklogic.com/smart-mastering");
      nodeBuilder.addAttribute("last-merge", merge["last-merge"]);
      nodeBuilder.addText(merge["document-uri"]);
      nodeBuilder.endElement();
    }
    // end merges
    nodeBuilder.endElement();
    nodeBuilder.startElement("sm:merge-options", "http://marklogic.com/smart-mastering");
    nodeBuilder.startElement("sm:value", "http://marklogic.com/smart-mastering");
    nodeBuilder.addAttribute("xml:lang", "zxx");
    nodeBuilder.addText(this.mergeStepToCompressedHex());
    nodeBuilder.endElement();
    nodeBuilder.endElement();
    // end headers
    nodeBuilder.endElement();
    nodeBuilder.startElement("es:triples", "http://marklogic.com/entity-services");
    if (fn.exists(triples)) {
      for (const tripleNode of sem.rdfSerialize(triples, ["triplexml"]).xpath("descendant-or-self::sem:triple", {sem: "http://marklogic.com/semantics"})) {
        nodeBuilder.addNode(tripleNode);
      }
    }
    // end triples
    nodeBuilder.endElement();
    // end envelope
    nodeBuilder.endElement();
    nodeBuilder.endDocument();
    return nodeBuilder.toNode();
  }

  mergePropertiesIntoXML(nodeBuilder, sortedProperties, prefixRegex, merges) {
    const placeInXml = [];
    for (const property of sortedProperties.filter((prop) => prefixRegex.test(prop[0].documentXPath))) {
      const [propertyXPathInfo, propertyOutput] = property;
      if (fn.exists(propertyOutput)) {
        const instanceXPath = propertyXPathInfo.documentXPath.replace(prefixRegex, "");
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
        for (const output of hubUtil.normalizeToArray(propertyOutput)) {
          for (const value of hubUtil.normalizeToArray(output.values)) {
            if (hubUtil.isNode(value)) {
              nodeBuilder.addNode(value);
            } else {
              nodeBuilder.startElement(fn.string(output.propertyName), fn.namespaceUriFromQName(output.propertyName));
              nodeBuilder.addText(String(value));
              nodeBuilder.endElement();
            }
          }
          this.setMergeInformation(merges, instanceXPath, output);
        }
      }
    }
    for (const place of placeInXml) {
      nodeBuilder.endElement();
    }
  }

  setMergeInformation(merges, instanceXPath, output) {
    const currentDateTime = fn.string(fn.currentDateTime());
    for (const source of hubUtil.normalizeToArray(output.sources)) {
      let {documentUri, dateTime, name} = source instanceof Node ? source.toObject() : source;
      // following use of fn.string is so ML 9 will compare the strings properly
      documentUri = fn.string(documentUri), dateTime = fn.string(dateTime), name = fn.string(name);
      const existingEntry = merges.find((entry) => entry["document-uri"] === documentUri && entry.name === name);
      if (existingEntry) {
        existingEntry.contributions.push(instanceXPath);
      } else {
        merges.push({ "document-uri": fn.string(documentUri), "last-merge": currentDateTime, name: fn.string(name), contributions: [ instanceXPath ]});
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
   * @param {[]ContentObject}
   * @return {[]PropertySpecifications} - {  }
   * @since 5.8.0
   */
  mergeProperties(contentObjects) {
    let mergeModulePath = "/com.marklogic.smart-mastering/survivorship/merging/standard.xqy", mergeModuleFunction = "standard";
    if (this.mergeRule.mergeModulePath) {
      mergeModulePath = this.mergeRule.mergeModulePath;
      mergeModuleFunction = this.mergeRule.mergeModuleFunction;
    }
    const convertToNode = /\.xq[yml]?$/.test(mergeModulePath);
    let isArray = false;
    let propertiesByDocument = hubUtil.normalizeToArray(contentObjects).map((contentObject) => {
      const documentUri = contentObject.uri;
      const documentNode = fn.head(contentObject.value);
      if (fn.empty(documentNode)) {
        return null;
      }
      let nodeValues;
      if (this.mergeRule.documentXPath) {
        nodeValues = documentNode.xpath(this.mergeRule.documentXPath, this.mergeRule.namespaces);
      } else {
        nodeValues = this.mergeable.model().propertyValues(this.mergeRule.entityPropertyPath, documentNode);
      }
      if (fn.empty(nodeValues)) {
        return null;
      }
      isArray = isArray || nodeValues.toArray().some(node => fn.exists(node.xpath('parent::array-node()')));
      const dateTime = this.mergeable.lastTimestamp(documentNode) || fn.string(fn.currentDateTime());
      const datahubSourceNamesFromXML = fn.distinctValues(documentNode.xpath("./*:envelope/*:headers//(*:datahubSourceName|*:sources/*:name)"));
      const name = fn.exists(datahubSourceNamesFromXML) ? fn.head(datahubSourceNamesFromXML): xdmp.nodeMetadataValue(documentNode, "datahubSourceName");
      let source = { documentUri, name, dateTime };
      if (convertToNode) {
        source = new NodeBuilder().addNode(source).toNode();
      }
      const properties = []
      for (const nodeValue of nodeValues) {
        properties.push({
          sources: source,
          values: nodeValue
        });
      }
      return properties;
    }).filter((properties) => properties)
      .reduce((prev, curr) => prev.concat(curr), [])
    if (!propertiesByDocument.length) {
      return [];
    }
    const propertyName = fn.nodeName(fn.head(propertiesByDocument[0].values));
    let passMergeRule = this.mergeRule;
    if (convertToNode) {
      passMergeRule = new NodeBuilder().addNode(passMergeRule).toNode();
      propertiesByDocument = Sequence.from(propertiesByDocument);
    }
    const mergeFunction = hubUtil.requireFunction(mergeModulePath, mergeModuleFunction);
    const results = hubUtil.normalizeToArray(mergeFunction(propertyName, propertiesByDocument, passMergeRule));
    results.retainArray = isArray;
    return results;
  }

  raw() {
    return this.mergeRule;
  }
}
