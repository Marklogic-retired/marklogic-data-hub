'use strict';

const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const mappingLib = require('/data-hub/5/builtins/steps/mapping/default/lib.sjs');
const sem = require("/MarkLogic/semantics.xqy");
const semPrefixes = {es: 'http://marklogic.com/entity-services#'};

const xmlMappingCollections = ['http://marklogic.com/entity-services/mapping', 'http://marklogic.com/data-hub/mappings/xml'];
const entitiesByTargetType = {};

function buildMappingXML(mappingJSON) {
  // Obtain all linked JSON mappings
  const relatedMappings = getRelatedMappings(mappingJSON).map((mappingDoc) => mappingDoc.toObject());

  // for each mapping build out the mapping XML
  const entityTemplates = [];
  for (let mapping of relatedMappings) {
    let entity = getTargetEntity(mapping.targetEntityType);
    entityTemplates.push(buildEntityMappingXML(mapping, entity));
  }
  let entityName = getEntityName(mappingJSON.root.targetEntityType);
  // compose the final template
  let finalTemplate = `
      <m:mapping xmlns:m="http://marklogic.com/entity-services/mapping">
      ${retrieveFunctionImports()}
      <m:variable name="context"><m:select>head((/*:envelope/(*:instance[count(* except *:info) gt 1]|*:instance/(* except *:info)),./object-node(),./*))</m:select></m:variable>
      ${entityTemplates.join('\n')}
      <!-- Default entity is ${entityName} -->
      <m:output>
        <m:call-template name="${entityName}"><m:with-param name="context"><m:select>$context</m:select></m:with-param></m:call-template>
      </m:output>
    </m:mapping>
  `;
  return xdmp.unquote(finalTemplate);
}

function buildMapProperties(mapping, entityModel) {
  let mapProperties = mapping.properties;
  let propertyLines = [];
  let entityName = getEntityName(mapping.targetEntityType);
  let entityDefinition = entityModel.definitions[entityName];
  let requiredProps = entityDefinition.required || [entityModel.primaryKey];
  if (!requiredProps.includes(entityModel.primaryKey)) {
    requiredProps.push(entityModel.primaryKey);
  }
  let entityProperties = entityDefinition.properties;
  for (let prop in mapProperties) {
    if (mapProperties.hasOwnProperty(prop)) {
      let isRequired = requiredProps.includes(prop);
      let dataType = entityProperties[prop].datatype;
      let isArray = false;
      if (dataType === 'array') {
        isArray = true;
        dataType = entityProperties[prop].items.datatype;
      }
      let externalMappingRef = mapProperties[prop].externalMapping;
      let sourcedFrom = mapProperties[prop].sourcedFrom;
      if (externalMappingRef || isArray) {
        let propLine;
        if (externalMappingRef) {
          let externalMapping = mappingLib.getMappingWithVersion(externalMappingRef.name, externalMappingRef.version).toObject();
          let externalEntityName = getEntityName(externalMapping.targetEntityType);
          propLine = `<${prop} ${isArray? 'datatype="array"':''}><m:call-template name="${externalEntityName}">
            <m:with-param name="$context" select="."/>
          </m:call-template></${prop}>`;
        } else {
          propLine = `<${prop} datatype="array"><m:val>. ! xs:${dataType}(.)</m:val></${prop}>`;
        }
        propertyLines.push(`<m:for-each><m:select>$context ! ${sourcedFrom}</m:select>
            ${propLine}
          </m:for-each>`);
      } else {
        let propLine = `<${prop}><m:val>$context ! ${sourcedFrom} ! xs:${dataType}(.)</m:val></${prop}>`;
        if (!isRequired) {
          propLine = `<m:optional>${propLine}</m:optional>`
        }
        propertyLines.push(propLine);
      }
    }
  }
  return propertyLines.join('\n');
}

function getRelatedMappings(mapping, related = [mapping]) {
  // get references to external mappings
  let externalReferences = mapping.xpath('/properties/*/externalMapping');
  for (let mappingRef of externalReferences) {
    let name = mappingRef.name;
    let version = mapping;
    if (!related.includes((mapping) => mapping.root.name === name && mapping.root.version === version)) {
      let externalMapping = mappingLib.getMappingWithVersion(name, version);
      related.push(externalMapping);
      related = getRelatedMappings(externalMapping, related);
    }
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
  return `
      <m:entity name="${entityTitle}" xmlns:m="http://marklogic.com/entity-services/mapping">
        <m:param name="context"><m:select>$context</m:select></m:param>
        <${entityTitle}>
          ${buildMapProperties(mapping, entity)}
        </${entityTitle}>
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

module.exports = {
  xmlMappingCollections,
  buildMappingXML,
  buildEntityMappingXML,
  getEntityName,
  getTargetEntity
};
