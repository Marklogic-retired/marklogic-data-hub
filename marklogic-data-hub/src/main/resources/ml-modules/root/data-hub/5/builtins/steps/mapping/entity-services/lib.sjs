'use strict';

const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const es = require('/MarkLogic/entity-services/entity-services');
const inst = require('/MarkLogic/entity-services/entity-services-instance');
const mappingLib = require('/data-hub/5/builtins/steps/mapping/default/lib.sjs');
const sem = require("/MarkLogic/semantics.xqy");
const semPrefixes = {es: 'http://marklogic.com/entity-services#'};
const dhMappingTrace = 'DH-MAPPING';
const dhMappingTraceIsEnabled = xdmp.traceEnabled(dhMappingTrace);

const xmlMappingCollections = ['http://marklogic.com/entity-services/mapping', 'http://marklogic.com/data-hub/mappings/xml'];
const entitiesByTargetType = {};

const xsltPermissions = [
  xdmp.permission(datahub.config.FLOWOPERATORROLE,'execute'),
  xdmp.permission(datahub.config.FLOWDEVELOPERROLE,'execute'),
  xdmp.permission(datahub.config.FLOWOPERATORROLE,'read'),
  xdmp.permission(datahub.config.FLOWDEVELOPERROLE,'read')
];

const reservedNamespaces = ['m', 'map'];

function buildMappingXML(mappingJSON) {
  // Obtain all linked JSON mappings
  const relatedMappings = getRelatedMappings(mappingJSON).map((mappingDoc) => mappingDoc.toObject());
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, 'Building mapping XML');
  }
  // for each mapping build out the mapping XML
  const entityTemplates = [];
  const mappingJsonObj = mappingJSON.toObject();
  const parentEntity = getTargetEntity(fn.string(mappingJsonObj.targetEntityType));
  for (let mapping of relatedMappings) {
    if (dhMappingTraceIsEnabled) {
      xdmp.trace(dhMappingTrace, `Generating template for ${mapping.targetEntityType}`);
    }
    let entity = (mapping.targetEntityType.startsWith("#/definitions/")) ? parentEntity : getTargetEntity(mapping.targetEntityType);
    let entityTemplate = buildEntityMappingXML(mapping, entity);
    if (dhMappingTraceIsEnabled) {
      xdmp.trace(dhMappingTrace, `Generated template: ${entityTemplate}`);
    }
    entityTemplates.push(entityTemplate);
  }
  let entityName = getEntityName(mappingJSON.root.targetEntityType);
  const namespaces = [];
  if (mappingJsonObj.namespaces) {
    for (const prefix of Object.keys(mappingJsonObj.namespaces).sort()) {
      if (mappingJsonObj.namespaces.hasOwnProperty(prefix)) {
        if (reservedNamespaces.includes(prefix)) {
          throw new Error(`'${prefix}' is a reserved namespace.`);
        }
        namespaces.push(`xmlns:${prefix}="${mappingJsonObj.namespaces[prefix]}"`);
      }
    }
  }
  // compose the final template
  // Importing the "map" namespace fixes an issue when testing a mapping from QuickStart that hasn't been reproduced
  // yet in a unit test; it ensures that the map:* calls in the XSLT resolve to map functions.
  let finalTemplate = `
      <m:mapping xmlns:m="http://marklogic.com/entity-services/mapping" xmlns:map="http://marklogic.com/xdmp/map" ${namespaces.join(' ')}>
      ${retrieveFunctionImports()}
      ${entityTemplates.join('\n')}
      <!-- Default entity is ${entityName} -->
      <m:output>
        <m:for-each><m:select>/</m:select>
            <m:call-template name="${entityName}" />
        </m:for-each>
      </m:output>
    </m:mapping>
  `;
  return xdmp.unquote(finalTemplate);
}

function buildMapProperties(mapping, entityModel) {
  let mapProperties = mapping.properties;
  let propertyLines = [];
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, `Building mapping properties for '${mapping.targetEntityType}' with 
    '${xdmp.describe(entityModel)}'`);
  }
  let entityName = getEntityName(mapping.targetEntityType);
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, `Using entity name: ${entityName}`);
  }
  let entityDefinition = entityModel.definitions[entityName];
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, `Using entity definition: ${entityDefinition}`);
  }
  let namespacePrefix = entityDefinition.namespacePrefix ? `${entityDefinition.namespacePrefix}:` : '';
  let entityProperties = entityDefinition.properties;
  for (let prop in mapProperties) {
    if (mapProperties.hasOwnProperty(prop)) {
      if (!entityProperties.hasOwnProperty(prop)) {
        // TODO Can pass in a JSON object instead of a string message, but not able to reference the properties on it
        throw Error("The property '" + prop + "' is not defined by the entity model");
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
          let subEntityName = getEntityName(mapProperty.targetEntityType);
          propLine = `<${propTag} ${isArray? 'datatype="array"':''}><m:call-template name="${subEntityName}"/></${propTag}>`;
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

function getRelatedMappings(mapping, related = [mapping]) {
  // get references to sub mappings
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, `Getting related mappings for '${xdmp.describe(mapping)}'`);
  }
  let internalMappings = mapping.xpath('/properties//object-node()[exists(targetEntityType) and exists(properties)]');
  for (let internalMapping of internalMappings) {
    related.push(internalMapping);
  }
  return related;
}

function getTargetEntity(targetEntityType) {
  if (!entitiesByTargetType[targetEntityType]) {
    let entityModel = getModel(targetEntityType);
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

function buildEntityMappingXML(mapping, entity) {
  let entityTitle = entity.info.title;
  let entityName = getEntityName(mapping.targetEntityType);
  let entityDefinition = entity.definitions[entityName];
  let namespacePrefix = entityDefinition.namespacePrefix;
  let entityTag = namespacePrefix ? `${namespacePrefix}:${entityName}`: entityName;
  let namespaceNode = `xmlns${namespacePrefix ? `:${namespacePrefix}`: ''}="${entityDefinition.namespace || ''}"`;
  return `
      <m:entity name="${entityName}" xmlns:m="http://marklogic.com/entity-services/mapping">
        <${entityTag} ${namespaceNode} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          ${buildMapProperties(mapping, entity)}
        </${entityTag}>
      </m:entity>`;
}

function getEntityName(targetEntityType) {
  return fn.head(fn.reverse(fn.tokenize(targetEntityType,'/')));
}

function getModel(targetEntityType) {
  return fn.head(cts.search(
      cts.andQuery([
        cts.collectionQuery('http://marklogic.com/entity-services/models'),
        cts.tripleRangeQuery(sem.iri(targetEntityType), sem.curieExpand("rdf:type"), sem.curieExpand("es:EntityType",semPrefixes), "=")
      ])));
}

function fallbackLegacyEntityLookup(targetEntityType) {
  let targetArr = targetEntityType.split('/');
  let entityName = targetArr[targetArr.length - 1];
  let tVersion = targetArr[targetArr.length - 2].split('-');
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

  Object.keys(mapping.properties).forEach(propertyName => {
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
    let stylesheet = xdmp.xsltInvoke("/MarkLogic/entity-services/mapping-compile.xsl", xmlMapping);
    xdmp.xsltEval(stylesheet, [], {staticCheck: true});
  } catch (e) {
    // TODO Move this into a separate function for easier testing?
    return getErrorMessage(e);
  }
}

function runMapping(mapping, uri, propMapping={"targetEntityType":mapping.targetEntityType, "namespaces": mapping.namespaces,"properties": {}}, paths=['properties']) {
  Object.keys(mapping.properties).forEach(propertyName => {
    let mappedProperty = mapping.properties[propertyName];
    let sourcedFrom = mappedProperty.sourcedFrom;
    paths.push(propertyName);
    if(!mappedProperty.errorMessage){
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
    if(mappedProperty && !mappedProperty.errorMessage && ! mappedProperty.hasOwnProperty("targetEntityType")){
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
  let instance = doc.xpath('head((/*:envelope/(object-node("instance")|*:instance/(element() except *:info)),./object-node(),./*))');
  let mappingXslt =  xdmp.invokeFunction(function () {
      const es = require('/MarkLogic/entity-services/entity-services');
      return es.mappingCompile(xmlMapping);
     }, {database: xdmp.modulesDatabase()});

  try {
    let outputDoc = inst.canonicalJson(xdmp.xsltEval(mappingXslt, fn.head(xdmp.unquote(String(instance)))));
    resp.output = String(fn.head(outputDoc.xpath("//" + propertyName)));
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

function versionIsCompatibleWithES(version = xdmp.version()) {
  let numberSensitiveCollation = 'http://marklogic.com/collation//MO';
  let isNightly = /^[0-9]+\.[0-9]+-[0-9]{8}$/.test(version);
  if (isNightly) {
    var nightlyDate = /^[0-9]+\.[0-9]+-([0-9]{8})$/.exec(version)[1];
    return fn.compare(nightlyDate, '20190824', numberSensitiveCollation) >= 0;
  }
  else {
    var major = /^([0-9]+)\..*$/.exec(version)[1];
    if (major === "9") {
      return fn.compare(version, '9.0-11', numberSensitiveCollation) >= 0;
    }
    else if (major === "10"){
      return fn.compare(version, '10.0-2', numberSensitiveCollation) >= 0;
    }
  }
  return false;
}

module.exports = {
  xsltPermissions,
  xmlMappingCollections,
  buildMappingXML,
  buildEntityMappingXML,
  getEntityName,
  getTargetEntity,
  // Exporting retrieveFunctionImports for unit test
  retrieveFunctionImports,
  versionIsCompatibleWithES,
  validateMapping,
  validateAndRunMapping
};
