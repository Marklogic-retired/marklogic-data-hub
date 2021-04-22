'use strict';

const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const inst = require('/MarkLogic/entity-services/entity-services-instance');
const mappingLib = require('/data-hub/5/builtins/steps/mapping/default/lib.sjs');

const infoEvent = datahub.consts.TRACE_MAPPING;
const infoEnabled = xdmp.traceEnabled(infoEvent);
const debugEvent = datahub.consts.TRACE_MAPPING_DEBUG;
const debugEnabled = xdmp.traceEnabled(debugEvent);

let xqueryLib = null;

const xmlMappingCollections = ['http://marklogic.com/entity-services/mapping', 'http://marklogic.com/data-hub/mappings/xml'];
const entitiesByTargetType = {};

const xsltPermissions = [
  xdmp.permission(datahub.config.FLOWOPERATORROLE,'execute'),
  xdmp.permission(datahub.config.FLOWDEVELOPERROLE,'execute'),
  xdmp.permission(datahub.config.FLOWOPERATORROLE,'read'),
  xdmp.permission(datahub.config.FLOWDEVELOPERROLE,'read'),
  xdmp.permission("data-hub-common",'execute'),
  xdmp.permission("data-hub-common",'read'),
  xdmp.permission(datahub.consts.DATA_HUB_DEVELOPER_ROLE,'execute'),
  xdmp.permission(datahub.consts.DATA_HUB_DEVELOPER_ROLE,'read'),
  xdmp.permission("data-hub-module-reader", "execute"),
  // In the absence of this, ML will report an error about standard-library.xqy not being found. This is misleading; the
  // actual problem is that a mapping will fail if the XML or XSLT representation of a mapping does not have this
  // permission on it, which is expected to be on every other DHF module
  xdmp.permission("rest-extension-user", "execute")
];

const reservedNamespaces = ['m', 'map'];

/**
 * Build an XML mapping template in the http://marklogic.com/entity-services/mapping namespace, which can then be the
 * input to the Entity Services mappingPut function that generates an XSLT template.
 *
 * @param mappingStepDocument expected to be a document-node and not an object
 * @param userParameterNames
 * @return {*}
 */
function buildMappingXML(mappingStepDocument, userParameterNames) {
  if (debugEnabled) {
    hubUtils.hubTrace(debugEvent, 'Building mapping XML');
  }

  const mappingStep = mappingStepDocument.toObject();
  let allEntityMap = [];
  let targetEntityMapping = {};

  targetEntityMapping.targetEntityType = mappingStep.targetEntityType;
  targetEntityMapping.properties = mappingStep.properties;
  targetEntityMapping.expressionContext = mappingStep.expressionContext ? mappingStep.expressionContext : "/";
  targetEntityMapping.uriExpression = mappingStep.uriExpression ? mappingStep.uriExpression : "$URI";

  allEntityMap.push(targetEntityMapping);
  if(mappingStep["relatedEntityMappings"] && mappingStep["relatedEntityMappings"].length > 0){
    mappingStep["relatedEntityMappings"].forEach(entityMap => {
      entityMap.uriExpression = entityMap.uriExpression ? entityMap.uriExpression : "hubURI('" + getEntityName(entityMap.targetEntityType) + "')";
      allEntityMap.push(entityMap)
    });
  }

  const namespaces = fetchNamespacesFromMappingStep(mappingStep);

  let entityTemplates = "";
  for(var i=0; i< allEntityMap.length; i++){
    entityTemplates += generateEntityTemplates(i, allEntityMap[i]).join('\n') + "\n";
  }

  let xml =
    `<m:mapping xmlns:m="http://marklogic.com/entity-services/mapping" xmlns:instance="http://marklogic.com/datahub/entityInstance" xmlns:map="http://marklogic.com/xdmp/map" ${namespaces.join(' ')}>
      ${retrieveFunctionImports()}
      ${makeParameterElements(mappingStep, userParameterNames)}
      ${entityTemplates}
      <m:output>
      ${allEntityMap.map((entityMap, index) =>
        `<instance:mapping${index}Instances>
           <m:for-each>
           <m:select>${entityMap["expressionContext"] ? entityMap["expressionContext"]: "/" }</m:select>
           <instance:entityInstance>
               <uri>
                    <m:val>${entityMap.uriExpression}</m:val>
                </uri>
                <value>
                    <m:call-template name="mapping${index}-${getEntityName(entityMap.targetEntityType)}"/>
                </value>
            </instance:entityInstance>
           </m:for-each>
        </instance:mapping${index}Instances>`).join("\n")}
      </m:output>
    </m:mapping>`;
  return xdmp.unquote(xml);
}

function fetchNamespacesFromMappingStep(mappingStep){
  let namespaces = [];
  if (mappingStep.namespaces) {
    for (const prefix of Object.keys(mappingStep.namespaces).sort()) {
      if (mappingStep.namespaces.hasOwnProperty(prefix)) {
        if (reservedNamespaces.includes(prefix)) {
          throw new Error(`'${prefix}' is a reserved namespace.`);
        }
        namespaces.push(`xmlns:${prefix}="${mappingStep.namespaces[prefix]}"`);
      }
    }
  }
  return namespaces;
}

/**
 * Makes parameter elements for the XML mapping template, which are then converted into XSLT parameter elements.
 *
 * @param mappingStep
 * @param userParameterNames can be passed in for a scenario where the caller has already determined the user parameter
 * names based on the mapping step; if null, then the mapping step will be checked to see if user parameters are available
 * @returns {string} stringified XML, with one m:param element per parameter
 */
function makeParameterElements(mappingStep, userParameterNames) {
  let elements = '<m:param name="URI"/>';
  if (userParameterNames) {
    userParameterNames.forEach(param => elements += `<m:param name="${param}"/>`);
  }
  else {
    const modulePath = mappingStep.mappingParametersModulePath;
    if (modulePath) {
      if (infoEnabled) {
        hubUtils.hubTrace(infoEvent, `Applying mapping parameters module at path '${modulePath}`);
      }
      try {
        const paramsFunction = require(modulePath)["getParameterDefinitions"];
        const userParams = paramsFunction(mappingStep);
        userParams.forEach(userParam => elements += `<m:param name="${userParam.name}"/>`);
      } catch (error) {
        throw Error(`getParameterDefinitions failed in module '${modulePath}'; cause: ${error.message}`);
      }
    }
  }
  return elements;
}

/*
Every m:entity template that gets created will have a 'name' attribute whose value will be  mapping{index}-{entityName}.
For example, mapping0-Customer for a 'Customer' mapping. 'index' 0 implies the mapping corresponding to the targetEntity.
'index' value  > 0 is generated by related entity mappings.
 */
function generateEntityTemplates(index, mappingObject) {
  const rootEntityTypeTitle = getEntityName(mappingObject.targetEntityType);

  // For the root mapping and for each nested object property (regardless of depth), build an object with a single
  // property of the path of the mapping and a value of the mapping. Each of these will then become an XML m:entity template.
  const rootMapping = {};
  rootMapping[rootEntityTypeTitle] = mappingObject;
  let mappings = [rootMapping];
  mappings = mappings.concat(getObjectPropertyMappings(mappingObject, rootEntityTypeTitle));

  const parentEntity = getTargetEntity(fn.string(mappingObject.targetEntityType));

  // For each mapping, build an m:entity template
  const entityTemplates = mappings.map(objectPropertyMapping => {
    const propertyPath = Object.keys(objectPropertyMapping)[0];
    const mapping = objectPropertyMapping[propertyPath];
    if (debugEnabled) {
      hubUtils.hubTrace(debugEvent, `Generating template for propertyPath '${propertyPath}' and entityTypeId '${mapping.targetEntityType}'`);
    }
    const model = (mapping.targetEntityType.startsWith("#/definitions/")) ? parentEntity : getTargetEntity(fn.string(mapping.targetEntityType));
    const template = buildEntityTemplate(mapping, model, propertyPath, index);
    if (debugEnabled) {
      hubUtils.hubTrace(debugEvent, `Generated template: ${template}`);
    }
    return template;
  });
  return entityTemplates;
}

/**
 * Returns a string of XML. The XML contains elements in the http://marklogic.com/entity-services/mapping namespace,
 * each of which represents a mapping expression in the given mapping.
 *
 * @param mapping a JSON mapping with a properties array containing mapping expressions
 * @param model the ES model, containing a definitions array of entity types
 * @param propertyPath the path in the entity type for the property being mapped. This is used for nested object
 * properties, where a call-template element must be built that references a template constructed by buildEntityTemplate
 * @return {string}
 */
function buildMapProperties(mapping, model, propertyPath, index) {
  let mapProperties = mapping.properties;
  let propertyLines = [];
  if (debugEnabled) {
    hubUtils.hubTrace(debugEvent, `Building mapping properties for '${mapping.targetEntityType}' with
    '${xdmp.describe(model)}'`);
  }
  let entityName = getEntityName(mapping.targetEntityType);
  if (debugEnabled) {
    hubUtils.hubTrace(debugEvent, `Using entity name: ${entityName}`);
  }
  let entityDefinition = model.definitions[entityName];
  if (debugEnabled) {
    hubUtils.hubTrace(debugEvent, `Using entity definition: ${entityDefinition}`);
  }
  let namespacePrefix = entityDefinition.namespacePrefix ? `${entityDefinition.namespacePrefix}:` : '';
  let entityProperties = entityDefinition.properties;
  for (let prop in mapProperties) {
    if (mapProperties.hasOwnProperty(prop)) {
      if (!entityProperties.hasOwnProperty(prop)) {
        datahub.debug.log({message: "The property '" + prop + "' is not defined by the entity model", type: "warn"});
        continue;
      }

      let mapProperty = mapProperties[prop];
      let sourcedFrom = escapeXML(mapProperty.sourcedFrom);
      if (sourcedFrom == null || sourcedFrom == undefined || sourcedFrom == "") {
        datahub.debug.log({message: 'sourcedFrom not specified for mapping property with name "' + prop + '"; will not map', type: 'warn'});
        continue;
      }

      let dataType = entityProperties[prop].datatype;
      let isArray = false;
      if (dataType === 'array') {
        isArray = true;
        dataType = entityProperties[prop].items.datatype;
      }
      let propTag = namespacePrefix + prop;

      let isInternalMapping = mapProperty.targetEntityType && mapProperty.properties;
      if (isInternalMapping || isArray) {
        let propLine;
        if (isInternalMapping) {
          // The template name will match one of the templates constructed by getObjectPropertyTemplates
          const templateName = propertyPath == "" ? prop : "mapping" + index + "-" + propertyPath + "." + prop;
          propLine = `<${propTag} ${isArray? 'datatype="array"':''}><m:call-template name="${templateName}"/></${propTag}>`;
        } else {
          propLine = `<${propTag} datatype="array" xsi:type="xs:${dataType}"><m:val>.</m:val></${propTag}>`;
        }
        propertyLines.push(`<m:for-each><m:select>${sourcedFrom}</m:select>
            ${propLine}
          </m:for-each>`);
      } else {
        let propLine = `<${propTag} xsi:type="xs:${dataType}"><m:val>${sourcedFrom}</m:val></${propTag}>`;
        // If a property is required but not marked as optional, it will always be added, and then entity validation
        // will not fail because the property exists with an empty string as the value.
        propLine = `<m:optional>${propLine}</m:optional>`
        propertyLines.push(propLine);
      }
    }
  }
  return propertyLines.join('\n');
}

/**
 * Recursive function that returns a mapping for each property with a targetEntityType, which signifies that it is
 * mapping to an object property. Each of these will need to be converted into an m:entity XML template. The name of
 * each template is guaranteed to be unique by being based on the propertyPath and the title of each object property
 * being mapped. This ensures that we have uniquely-named templates in the XSLT transform that's generated from the
 * XML mapping template.
 *
 * @param mapping
 * @param propertyPath
 * @param objectPropertyMappings
 * @return {*[]}
 */
function getObjectPropertyMappings(mapping, propertyPath, objectPropertyMappings = []) {
  if (debugEnabled) {
    hubUtils.hubTrace(debugEvent, `Getting related mappings for '${xdmp.describe(mapping)}'`);
  }
  if (mapping.properties) {
    Object.keys(mapping.properties).forEach(propertyTitle => {
      const property = mapping.properties[propertyTitle];
      if (property.targetEntityType && property.properties) {
        const propertyMapping = {};
        const nestedPropertyPath = propertyPath == "" ? propertyTitle : propertyPath + "." + propertyTitle;
        propertyMapping[nestedPropertyPath] = property;
        objectPropertyMappings.push(propertyMapping);

        getObjectPropertyMappings(property, nestedPropertyPath, objectPropertyMappings);
      }
    });
  }
  return objectPropertyMappings;
}

function getTargetEntity(targetEntityType) {
  if (!entitiesByTargetType[targetEntityType]) {
    let entityModel = entityLib.findModelForEntityTypeId(targetEntityType);
    if (fn.empty(entityModel)) {
      entityModel = fallbackLegacyEntityLookup(targetEntityType)
    }
    if (entityModel && (entityModel.constructor.name === "Document" || entityModel.constructor.name === "ObjectNode")) {
      entityModel = entityModel.toObject();
    }
    if(!entityModel) {
      datahub.debug.log({message: 'Could not find target entity type: ' + targetEntityType, type: 'error'});
      throw Error('Could not find target entity type: ' + targetEntityType);
    }
    entitiesByTargetType[targetEntityType] = entityModel;
  }
  return entitiesByTargetType[targetEntityType];
}

function retrieveFunctionImports() {
  let customImports = [];
  let shimURIs = hubUtils.invokeFunction(function() {
    return cts.uris(null, null, cts.collectionQuery('http://marklogic.com/entity-services/function-metadata/compiled'));
  }, xdmp.databaseName(xdmp.modulesDatabase()));
  for (let uri of shimURIs) {
    customImports.push(`<m:use-functions href="${fn.string(uri).replace(/\.xslt?$/, '')}"/>`);
  }
  return customImports.join('\n');
}

/**
 * Build an "entity template", defined by an entity element in the http://marklogic.com/entity-services/mapping
 * namespace, for the given property mapping.
 *
 * @param mapping
 * @param model
 * @param propertyPath the path in the entity type for the property being mapped. This is used as the name of the
 * entity template, and thus it will also be used in call-template references to this template.
 *
 * @return {string}
 */
function buildEntityTemplate(mapping, model, propertyPath, index) {
  let entityName = getEntityName(mapping.targetEntityType);
  let entityDefinition = model.definitions[entityName];
  if (!entityDefinition) {
    throw Error(`Could not find an entity type with name: ${entityName}`);
  }
  let namespacePrefix = entityDefinition.namespacePrefix;
  let entityTag = namespacePrefix ? `${namespacePrefix}:${entityName}`: entityName;
  let namespaceNode = `xmlns${namespacePrefix ? `:${namespacePrefix}`: ''}="${entityDefinition.namespace || ''}"`;
  return `
      <m:entity name="mapping${index}-${propertyPath}" xmlns:m="http://marklogic.com/entity-services/mapping">
        <${entityTag} ${namespaceNode} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          ${buildMapProperties(mapping, model, propertyPath, index)}
        </${entityTag}>
      </m:entity>`;
}

function getEntityName(targetEntityType) {
  return fn.head(fn.reverse(fn.tokenize(targetEntityType,'/')));
}

function fallbackLegacyEntityLookup(targetEntityType) {
  let targetArr = String(targetEntityType).split('/');
  let entityName = targetArr[targetArr.length - 1];
  let tVersion = targetArr[targetArr.length - 2] ? targetArr[targetArr.length - 2].split('-') : '';
  let modelVersion = tVersion[tVersion.length - 1];
  return fn.head(mappingLib.getModel(entityName, modelVersion));
}

function escapeXML(input = '') {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;');
}

/**
 * Main purpose of this function is for testing a mapping against a persisted document, identified by the uri parameter.
 * This is not used when a mapping step is run; this functionality is independent of flows/steps, and should really be moved
 * into a mapping-specific library that is not under "steps".
 *
 * @param mapping
 * @param uri
 * @returns
 */
function validateAndRunMapping(mapping, uri) {
  if (!fn.docAvailable(uri)) {
    throw Error(`Unable to validate and run mapping; could not find source document with URI '${uri}'`);
  }

  const sourceDocument = cts.doc(uri);

  const modulePath = mapping.mappingParametersModulePath;
  let userParameterNames = [];
  let userParameterMap = {};
  try {
    if (modulePath) {
      const contentArray = [{"uri": uri, "value": sourceDocument}];
      const moduleLib = require(modulePath);
      userParameterNames = moduleLib["getParameterDefinitions"]().map(def => def.name);
      userParameterMap = moduleLib["getParameterValues"](contentArray, {});
    }
  } catch (error) {
    // Need to throw an HTTP error so that the testMapping endpoint returns a proper error
    httpUtils.throwBadRequest(`Unable to apply mapping parameters module at path '${modulePath}'; cause: ${error.message}`);
  }

  const parameterMap = Object.assign({}, {"URI":uri}, userParameterMap);

  const validatedMapping = validateMapping(mapping, userParameterNames);
  const sourceInstance = extractInstance(sourceDocument);
  return testMapping(validatedMapping, sourceInstance, userParameterNames, parameterMap);
}

/**
 * Validates all property mappings in the given mapping object. For any invalid mapping expression, the object representing that expression is given an "errorMessage" property that
 * captures the validation error.
 *
 * @param mapping
 * @param {array} userParameterNames
 * @return {{targetEntityType: *, properties: {}}}
 */
function validateMapping(mapping, userParameterNames) {
  // Rebuild the mapping without its "properties"
  // Those will be rebuilt next, but with each property mapping validated
  let validatedMapping = {};
  Object.keys(mapping).forEach(key => {
    if (key != "properties") {
      validatedMapping[key] = mapping[key];
    }
  });
  validatedMapping.properties = {};

  Object.keys(mapping.properties || {}).forEach(propertyName => {
    let mappedProperty = mapping.properties[propertyName];

    // If this is a nested property, validate its child properties first
    if (mappedProperty.hasOwnProperty("targetEntityType")) {
      if (mappedProperty.targetEntityType.startsWith('#/definitions/')) {
        const definitionName = mappedProperty.targetEntityType.substring(mappedProperty.targetEntityType.lastIndexOf('/') + 1);
        const fullTargetEntity = mapping.targetEntityType.substring(0, mapping.targetEntityType.lastIndexOf('/') + 1) + definitionName;
        mappedProperty.targetEntityType = fullTargetEntity;
      }
      mappedProperty.namespaces = mapping.namespaces;
      mappedProperty = validateMapping(mappedProperty, userParameterNames);
    }

    // Validate the mapping expression, and if an error occurs, add it to the mapped property object
    let sourcedFrom = mappedProperty.sourcedFrom;
    let errorMessage = validatePropertyMapping(mapping, userParameterNames, propertyName, sourcedFrom);
    if (errorMessage != null) {
      mappedProperty.errorMessage = errorMessage;
    }

    validatedMapping.properties[propertyName] = mappedProperty;
  });

  return validatedMapping;
}

/**
 * Validate a single property mapping by constructing a mapping consisting of just the given property mapping.
 *
 * @param fullMapping
 * @param {array} userParameterNames
 * @param propertyName
 * @param sourcedFrom
 * @return an error message if the mapping validation fails
 */
function validatePropertyMapping(fullMapping, userParameterNames, propertyName, sourcedFrom) {
  let mapping = {
    "namespaces": fullMapping.namespaces,
    "targetEntityType": fullMapping.targetEntityType,
    "properties": {}
  };

  mapping.properties[propertyName] = {
    "sourcedFrom": sourcedFrom
  };

  try {
    const mappingDocument = fn.head(xdmp.unquote(xdmp.quote(mapping)));
    const xmlMapping = buildMappingXML(mappingDocument, userParameterNames);
    // As of trunk 10.0-20190916, mappings are being validated against entity schemas in the schema database.
    // This doesn't seem expected, as the validation will almost always fail.
    // Thus, this is not using es.mappingCompile, which does validation, and just invokes the transform instead.
    let stylesheet = fn.head(xdmp.xsltInvoke("/MarkLogic/entity-services/mapping-compile.xsl", xmlMapping));
    xdmp.xsltEval(stylesheet, [], {staticCheck: true});
  } catch (e) {
    return hubUtils.getErrorMessage(e);
  }
}

/**
 * Tests the given mapping against the given source instance by returning the mapping with
 * each mapping expression containing an "output" property or an "errorMessage" property.
 * This is not used when running a mapping step; it's only used when testing a mapping.
 *
 * @param {object} mapping The mapping step
 * @param {document} sourceInstance the instance to be mapped; assumed to have been extracted from a source document
 * @param {array} userParameterNames
 * @param {object} parameterMap
 * @param propMapping
 * @param paths
 * @returns
 */
function testMapping(mapping, sourceInstance, userParameterNames, parameterMap,
  propMapping={"targetEntityType":mapping.targetEntityType, "namespaces": mapping.namespaces,"properties": {}},
  paths=['properties'])
{
  Object.keys(mapping.properties || {}).forEach(propertyName => {
    let mappedProperty = mapping.properties[propertyName];
    let sourcedFrom = escapeXML(mappedProperty.sourcedFrom);
    paths.push(propertyName);
    //Don't run mapping if the property is unset (sourcedFrom.length==0) or if the validation returns errors
    if(!mappedProperty.errorMessage && sourcedFrom.length > 0){
      if (mappedProperty.hasOwnProperty("targetEntityType")) {
        propMapping = addNode(propMapping, paths, mappedProperty, true);
        paths.push("properties");
        mappedProperty = testMapping(mappedProperty, sourceInstance, userParameterNames, parameterMap, propMapping, paths);
        paths.pop();
      }
      else {
        propMapping = addNode(propMapping, paths, mappedProperty,  false);
      }
    }
    if(mappedProperty && !mappedProperty.errorMessage && ! mappedProperty.hasOwnProperty("targetEntityType") && sourcedFrom.length > 0){
      let resp = testMappingExpression(propMapping, propertyName, sourceInstance, userParameterNames, parameterMap);
      if(resp && resp.output) {
        mappedProperty["output"] = resp.output;
      }
      else {
        mappedProperty["errorMessage"] = resp.errorMessage;
      }
    }
    eval('delete propMapping.' + paths.join('.')) ;
    paths.pop();
  });
  return mapping;
}

/**
 * Tests the given mapping against the given source document, only executing the mapping
 * expression associated with the given property name.
 *
 * @param mapping
 * @param propertyName
 * @param sourceInstance
 * @param {array} userParameterNames
 * @param {object} parameterMap
 * @returns
 */
// TODO Figure out relevancy of this comment
//es.nodeMapToCanonical can be used after server bug #53497 is fixed
function testMappingExpression(mapping, propertyName, sourceInstance, userParameterNames, parameterMap) {
  let resp = {};
  const mappingDocument = fn.head(xdmp.unquote(xdmp.quote(mapping)));
  const xmlMapping = buildMappingXML(mappingDocument, userParameterNames);
  let mappingXslt = xdmp.invokeFunction(function () {
      const es = require('/MarkLogic/entity-services/entity-services');
      return es.mappingCompile(xmlMapping);
     }, {database: xdmp.modulesDatabase()});

  try {
    let inputDoc = sourceInstance;
    if (!(inputDoc instanceof Document)) {
      inputDoc = fn.head(xdmp.unquote(String(sourceInstance)));
    }

    /*
    Running the xslt will return an xml doc which looks like
    <instance:entityInstance0><entityName>
    ....
    </entityName></instance:entityInstance0>. The xpath extracts only the first instance, will be modified in later when UI supports
    multiple instances
     */

    let outputDoc = inst.canonicalJson(xdmp.unquote(xdmp.quote(fn.head(xdmp.xsltEval(mappingXslt, inputDoc, parameterMap)).xpath('/instance:mapping0Instances/instance:entityInstance/*:value/node()', {"instance":"http://marklogic.com/datahub/entityInstance"}))));
    let output = outputDoc.xpath("//" + propertyName);
    let arr = output.toArray();
    if(arr.length <= 1) {
      resp.output = String(fn.head(output));
    }
    else {
      resp.output = arr.map(String);
    }
  }
  catch(e){
    resp.errorMessage = hubUtils.getErrorMessage(e);
  }
  return resp;
}

function addNode(obj, paths, mappedProperty, isNested ) {
  let res=obj;
  const namespaces = res.namespaces;
  for (let i=0;i<paths.length -1;i++) {
    obj=obj[paths[i]];
  }
  if(isNested){
    obj[paths[paths.length -1]] = {"targetEntityType" : mappedProperty.targetEntityType, namespaces,"sourcedFrom": mappedProperty.sourcedFrom,"properties": {}};
  }
  else {
   obj[paths[paths.length -1]] = {"sourcedFrom": mappedProperty.sourcedFrom};
  }
  return res;
}

function extractInstance(docNode) {
  let instance = docNode.xpath('/*:envelope/(object-node("instance")|*:instance/(element() except *:info))');
  if (fn.empty(instance)) {
    instance = docNode;
  } else if (fn.count(instance) > 1) {
    // can't use node builder here as it won't allow multiple root nodes
    instance = fn.head(getXQueryLib().documentWithNodes(instance));
  }
  return fn.head(instance);
}

function getXQueryLib() {
  if (!xqueryLib) {
    xqueryLib = require('/data-hub/5/builtins/steps/mapping/entity-services/xquery-lib.xqy');
  }
  return xqueryLib;
}

function getMarkLogicMappingFunctions() {
  return fn.head(hubUtils.invokeFunction(function() {
    let fnMetadata = fn.collection("http://marklogic.com/entity-services/function-metadata")
    let ns = {"m":"http://marklogic.com/entity-services/mapping"};
    const functionMap = new Map();
    let output = [];

    for (const metaData of fnMetadata){
      if(metaData.xpath("/m:function-defs",ns)) {
        let j = 1;
        let fnLocation = metaData.xpath("/m:function-defs/@location",ns)
        for (const mlFunction of metaData.xpath("/m:function-defs/m:function-def",ns )){
          let funcName = String(metaData.xpath("/m:function-defs/m:function-def["+j+"]/@name", ns));
          let params = String(metaData.xpath("/m:function-defs/m:function-def["+j+"]/m:parameters/m:parameter/@name",ns)).replace("\n",",");
          j++;

          let singleFunction ={};
          singleFunction["functionName"] = funcName;
          singleFunction["signature"] = funcName +"("+params+")";
          singleFunction["category"] = (String(fnLocation).includes("/data-hub/5/mapping-functions")) ? "builtin" : "custom";
          functionMap.set(funcName, singleFunction);
        }
      }
    }
    for (let value of functionMap.values()){
      output.push(value);
    }
    return output;
  }, datahub.config.MODULESDATABASE));
}

/**
 * Per DHFPROD-5084, these have been identified as functions that do not work in mapping expressions. See the unit
 * test for this function to see how they have been identified.
 * @returns {string[]}
 */
function getXpathFunctionsThatDoNotWorkInMappingExpressions() {
  return [
    "unparsed-text",
    "nilled",
    "unparsed-text-available",
    "in-scope-prefixes",
    "collection",
    "type-available",
    "error",
    "default-collation",
    "static-base-uri",
    "doc"
  ];
}

function getXpathMappingFunctions() {
  const xpathFunctions = xdmp.functions().toObject();
  // The *-uri functions are excluded because the object being mapped is in memory and these functions won't work on it
  const excludeFunctions = ["base-uri", "document-uri", "distinct-values"].concat(getXpathFunctionsThatDoNotWorkInMappingExpressions());
  return getFunctionsWithSignatures(xpathFunctions, excludeFunctions);
}

function getFunctionsWithSignatures(xpathFunctions, excludeFunctions) {
  const response = [];
  //used to prevent duplicates(overloaded functions) in the response
  const functionMap = new Map();
  for (let i = 0; i < xpathFunctions.length; i++) {
    if (String(xpathFunctions[i]).includes("fn:")) {
      let signature = xdmp.functionSignature(xpathFunctions[i]).replace("function", xdmp.functionName(xpathFunctions[i]));
      signature = signature.match(/fn:(.*?) as.*?/)[1];
      let fn = String(xdmp.functionName(xpathFunctions[i])).replace("fn:", "");
      if (!excludeFunctions.includes(fn)) {
        let xpathFunction = {};
        xpathFunction["functionName"] = fn;
        xpathFunction["signature"] = signature;
        xpathFunction["category"] = "xpath";
        functionMap.set(fn, xpathFunction);
      }
    }
  }
  for (let value of functionMap.values()){
    response.push(value);
  }
  return response;
}

module.exports = {
  xsltPermissions,
  xmlMappingCollections,
  buildMappingXML,
  buildEntityTemplate,
  extractInstance,
  getEntityName,
  getFunctionsWithSignatures,
  getMarkLogicMappingFunctions,
  getTargetEntity,
  getXpathFunctionsThatDoNotWorkInMappingExpressions,
  getXpathMappingFunctions,
  // Exporting retrieveFunctionImports for unit test
  retrieveFunctionImports,
  validateMapping,
  validateAndRunMapping
};
