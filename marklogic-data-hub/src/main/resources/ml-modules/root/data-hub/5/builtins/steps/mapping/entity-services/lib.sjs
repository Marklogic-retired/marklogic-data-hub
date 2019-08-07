'use strict';

const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
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

function buildMappingXML(mappingJSON) {
  // Obtain all linked JSON mappings
  const relatedMappings = getRelatedMappings(mappingJSON).map((mappingDoc) => mappingDoc.toObject());
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, 'Building mapping XML');
  }
  // for each mapping build out the mapping XML
  const entityTemplates = [];
  for (let mapping of relatedMappings) {
    if (dhMappingTraceIsEnabled) {
      xdmp.trace(dhMappingTrace, `Generating template for ${mapping.targetEntityType}`);
    }
    let entity = getTargetEntity(mapping.targetEntityType);
    let entityTemplate = buildEntityMappingXML(mapping, entity);
    if (dhMappingTraceIsEnabled) {
      xdmp.trace(dhMappingTrace, `Generated template: ${entityTemplate}`);
    }
    entityTemplates.push(entityTemplate);
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
      let sourcedFrom = `(${escapeXML(mapProperties[prop].sourcedFrom)})`;
      if (externalMappingRef || isArray) {
        let propLine;
        if (externalMappingRef) {
          let externalMapping = mappingLib.getMappingWithVersion(externalMappingRef.externalName, externalMappingRef.externalVersion).toObject();
          let externalEntityName = getEntityName(externalMapping.targetEntityType);
          propLine = `<${prop} ${isArray? 'datatype="array"':''}><m:call-template name="${externalEntityName}">
            <m:with-param name="context" select="."/>
          </m:call-template></${prop}>`;
        } else {
          propLine = `<${prop} datatype="array" xsi:type="xs:${dataType}"><m:val>. ! xs:${dataType}(.)</m:val></${prop}>`;
        }
        propertyLines.push(`<m:for-each><m:select>$context ! ${sourcedFrom}</m:select>
            ${propLine}
          </m:for-each>`);
      } else {
        let propLine = `<${prop} xsi:type="xs:${dataType}"><m:val>$context ! ${sourcedFrom} ! xs:${dataType}(.)</m:val></${prop}>`;
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
  if (dhMappingTraceIsEnabled) {
    xdmp.trace(dhMappingTrace, `Getting related mappings for '${xdmp.describe(mapping)}'`);
  }
  let externalReferences = mapping.xpath('/properties/*/externalMapping');
  for (let mappingRef of externalReferences) {
    let name = mappingRef.externalName;
    let version = mappingRef.externalVersion;
    if (dhMappingTraceIsEnabled) {
      xdmp.trace(dhMappingTrace, `Found external mapping name '${name}', version '${version}'`);
    }
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
        <${entityTitle} xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
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

module.exports = {
  xsltPermissions,
  xmlMappingCollections,
  buildMappingXML,
  buildEntityMappingXML,
  getEntityName,
  getTargetEntity
};
