'use strict';

const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const es = require('/MarkLogic/entity-services/entity-services');
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const inst = require('/MarkLogic/entity-services/entity-services-instance');
const mappingLib = require('/data-hub/5/builtins/steps/mapping/default/lib.sjs');
const sem = require("/MarkLogic/semantics.xqy");
const semPrefixes = {es: 'http://marklogic.com/entity-services#'};
const dhMappingTrace = 'DH-MAPPING';
const dhMappingTraceIsEnabled = xdmp.traceEnabled(dhMappingTrace);
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
 * @param mappingDoc expected to be a document-node and not an object asdfasdf
 * @return {*}
 */
function buildMappingXML(mappingDoc) {
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, 'Building mapping XML');
  }

  const mappingObject = mappingDoc.toObject();
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
    if (dhMappingTraceIsEnabled) {
      xdmp.trace(dhMappingTrace, `Generating template for propertyPath '${propertyPath}' and entityTypeId '${mapping.targetEntityType}'`);
    }
    const model = (mapping.targetEntityType.startsWith("#/definitions/")) ? parentEntity : getTargetEntity(mapping.targetEntityType);
    const template = buildEntityTemplate(mapping, model, propertyPath);
    if (dhMappingTraceIsEnabled) {
      xdmp.trace(dhMappingTrace, `Generated template: ${template}`);
    }
    return template;
  });

  const namespaces = [];
  if (mappingObject.namespaces) {
    for (const prefix of Object.keys(mappingObject.namespaces).sort()) {
      if (mappingObject.namespaces.hasOwnProperty(prefix)) {
        if (reservedNamespaces.includes(prefix)) {
          throw new Error(`'${prefix}' is a reserved namespace.`);
        }
        namespaces.push(`xmlns:${prefix}="${mappingObject.namespaces[prefix]}"`);
      }
    }
  }

  // Importing the "map" namespace fixes an issue when testing a mapping from QuickStart that hasn't been reproduced
  // yet in a unit test; it ensures that the map:* calls in the XSLT resolve to map functions.
  return xdmp.unquote(`
    <m:mapping xmlns:m="http://marklogic.com/entity-services/mapping" xmlns:map="http://marklogic.com/xdmp/map" ${namespaces.join(' ')}>
      ${retrieveFunctionImports()}
      <m:param name="URI"/>
      ${entityTemplates.join('\n')}
      <!-- Default entity is ${rootEntityTypeTitle} -->
      <m:output>
        <m:for-each><m:select>/</m:select>
            <m:call-template name="${rootEntityTypeTitle}" />
        </m:for-each>
      </m:output>
    </m:mapping>`);
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
function buildMapProperties(mapping, model, propertyPath) {
  let mapProperties = mapping.properties;
  let propertyLines = [];
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, `Building mapping properties for '${mapping.targetEntityType}' with
    '${xdmp.describe(model)}'`);
  }
  let entityName = getEntityName(mapping.targetEntityType);
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, `Using entity name: ${entityName}`);
  }
  let entityDefinition = model.definitions[entityName];
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, `Using entity definition: ${entityDefinition}`);
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
          const templateName = propertyPath == "" ? prop : propertyPath + "." + prop;
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
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, `Getting related mappings for '${xdmp.describe(mapping)}'`);
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
      datahub.debug.log({message: 'Could not find a target entity: ' + targetEntityType, type: 'error'});
      throw Error('Could not find a target entity: ' + targetEntityType);
    }
    entitiesByTargetType[targetEntityType] = entityModel;
  }
  return entitiesByTargetType[targetEntityType];
}

function retrieveFunctionImports() {
  let customImports = [];
  let shimURIs = datahub.hubUtils.queryLatest(function() {
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
function buildEntityTemplate(mapping, model, propertyPath) {
  let entityName = getEntityName(mapping.targetEntityType);
  let entityDefinition = model.definitions[entityName];
  if (!entityDefinition) {
    throw Error(`Could not find an entity type with name: ${entityName}`);
  }
  let namespacePrefix = entityDefinition.namespacePrefix;
  let entityTag = namespacePrefix ? `${namespacePrefix}:${entityName}`: entityName;
  let namespaceNode = `xmlns${namespacePrefix ? `:${namespacePrefix}`: ''}="${entityDefinition.namespace || ''}"`;
  return `
      <m:entity name="${propertyPath}" xmlns:m="http://marklogic.com/entity-services/mapping">
        <${entityTag} ${namespaceNode} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          ${buildMapProperties(mapping, model, propertyPath)}
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

function validateAndRunMapping(mapping, uri) {
  let validatedMapping = validateMapping(mapping);
  return runMapping(validatedMapping, uri);
}
/**
 * Validates all property mappings in the given mapping object.
 *
 * @param mapping
 * @return {{targetEntityType: *, properties: {}}}
 */
function validateMapping(mapping) {
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
      mappedProperty = validateMapping(mappedProperty);
    }

    // Validate the mapping expression, and if an error occurs, add it to the mapped property object
    let sourcedFrom = mappedProperty.sourcedFrom;
    let errorMessage = validatePropertyMapping(mapping, propertyName, sourcedFrom);
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
 * @param propertyName
 * @param sourcedFrom
 * @return an error message if the mapping validation fails
 */
function validatePropertyMapping(fullMapping, propertyName, sourcedFrom) {
  let mapping = {
    "namespaces": fullMapping.namespaces,
    "targetEntityType": fullMapping.targetEntityType,
    "properties": {}
  };

  mapping.properties[propertyName] = {
    "sourcedFrom": sourcedFrom
  };

  try {
    let xmlMapping = buildMappingXML(fn.head(xdmp.unquote(xdmp.quote(mapping))));
    // As of trunk 10.0-20190916, mappings are being validated against entity schemas in the schema database.
    // This doesn't seem expected, as the validation will almost always fail.
    // Thus, this is not using es.mappingCompile, which does validation, and just invokes the transform instead.
    let stylesheet = fn.head(xdmp.xsltInvoke("/MarkLogic/entity-services/mapping-compile.xsl", xmlMapping));
    xdmp.xsltEval(stylesheet, [], {staticCheck: true});
  } catch (e) {
    return getErrorMessage(e);
  }
}

function runMapping(mapping, uri, propMapping={"targetEntityType":mapping.targetEntityType, "namespaces": mapping.namespaces,"properties": {}}, paths=['properties']) {
  Object.keys(mapping.properties || {}).forEach(propertyName => {
    let mappedProperty = mapping.properties[propertyName];
    let sourcedFrom = escapeXML(mappedProperty.sourcedFrom);
    paths.push(propertyName);
    //Don't run mapping if the property is unset (sourcedFrom.length==0) or if the validation returns errors
    if(!mappedProperty.errorMessage && sourcedFrom.length > 0){
      if (mappedProperty.hasOwnProperty("targetEntityType")) {
        propMapping = addNode(propMapping, paths, mappedProperty, true);
        paths.push("properties");
        mappedProperty = runMapping(mappedProperty, uri, propMapping, paths);
        paths.pop();
      }
      else {
        propMapping = addNode(propMapping, paths, mappedProperty,  false);
      }
    }
    if(mappedProperty && !mappedProperty.errorMessage && ! mappedProperty.hasOwnProperty("targetEntityType") && sourcedFrom.length > 0){
      let resp = getCanonicalInstance(propMapping, uri, propertyName);
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

//es.nodeMapToCanonical can be used after server bug #53497 is fixed
function getCanonicalInstance(mapping, uri, propertyName) {
  let resp = {};
  let xmlMapping = buildMappingXML(fn.head(xdmp.unquote(xdmp.quote(mapping))));
  let doc = cts.doc(uri);
  let instance = extractInstance(doc);
  let mappingXslt = xdmp.invokeFunction(function () {
      const es = require('/MarkLogic/entity-services/entity-services');
      return es.mappingCompile(xmlMapping);
     }, {database: xdmp.modulesDatabase()});

  try {
    let inputDoc = instance;
    if (!(inputDoc instanceof Document)) {
      inputDoc = fn.head(xdmp.unquote(String(instance)));
    }

    const userParams = {"URI":uri};
    let outputDoc = inst.canonicalJson(xdmp.xsltEval(mappingXslt, inputDoc, userParams));
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
    resp.errorMessage = getErrorMessage(e);
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

function getErrorMessage(e) {
  let errorMessage = e.message;
  if (e.data != null && e.data.length > 0) {
    errorMessage += ": " + e.data[0];
  }
  return errorMessage;
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
  return fn.head(datahub.hubUtils.queryLatest(function() {
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
