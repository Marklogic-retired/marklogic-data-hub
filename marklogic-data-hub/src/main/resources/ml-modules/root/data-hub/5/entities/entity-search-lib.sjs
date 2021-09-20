/**
 Copyright (c) 2021 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const consts = require('/data-hub/5/impl/consts.sjs');
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const esInstance = require('/MarkLogic/entity-services/entity-services-instance');
const ext = require("/data-hub/extensions/entity/get-entity-details.sjs");
const prov = require("/data-hub/5/impl/prov.sjs");

/**
 * If the entity instance cannot be found for any search result, that fact is logged instead of an error being thrown or
 * trace logging being used. This ensures that the condition appears in logging, but it should not throw an error
 * because other entities in the search results may be able to have properties added for them.
 *
 * @param entityName
 * @param searchResponse
 */
function addPropertiesToSearchResponse(entityName, searchResponse, propertiesToDisplay) {
  const maxDefaultProperties = 5;
  const selectedPropertyNames = typeof propertiesToDisplay === 'string' ? propertiesToDisplay.split(",") : propertiesToDisplay;
  let selectedPropertyMetadata = [];
  let propertyMetadata = [];

  if (entityName) {
    //Single Entity is selected

    const entityModel = entityLib.findModelByEntityName(entityName);
    if (!entityModel) {
      httpUtils.throwNotFound(`Could not add entity properties to search response; could not find an entity model for entity name: ${entityName}`);
    }

    if(!verifyExplorableModel(entityName)) {
      httpUtils.throwNotFound(`Could not find entity properties as there is no entityTypeDefinition in entity model for name: ${entityName}`);
    }

    const allMetadata = buildAllMetadata("", entityModel, entityName);
    propertyMetadata = allMetadata["allPropertiesMetadata"];

    if (selectedPropertyNames) {
      selectedPropertyMetadata = buildSelectedPropertiesMetadata(allMetadata, selectedPropertyNames);
    }
    selectedPropertyMetadata = selectedPropertyMetadata.length > 0 ? selectedPropertyMetadata : propertyMetadata.slice(0, maxDefaultProperties);

    searchResponse.results.forEach(result => {
      addEntitySpecificProperties(result, entityName, entityModel, selectedPropertyMetadata)
    });

    // Remove entityName from Collection facetValues
    removeEntityNameFromCollection(searchResponse, entityName);
  } else {
    //'All Entities' option is selected
    searchResponse.results.forEach(result => {
      addGenericEntityProperties(result);
    });
  }

  // Make it easy for the client to know which property names were used, and which ones exist
  searchResponse.selectedPropertyDefinitions = selectedPropertyMetadata;
  searchResponse.entityPropertyDefinitions = propertyMetadata;
}

// This function builds the logical entityType property metadata for all entityType properties from an entityModel.
function buildAllMetadata(parentPropertyName, entityModel, entityName) {
  const entityType = entityModel.definitions[entityName];
  if (!entityType) {
    httpUtils.throwNotFound("Could not build property metadata; could not find entity type with name: " + entityName);
  }

  const allPropertiesMetadata = [];
  let granularPropertyMetadata = {};

  for (var propertyName of Object.keys(entityType.properties)) {
    const property = entityType.properties[propertyName];

    const isSimpleProperty = property.datatype != "array" && !property["$ref"];
    const isSimpleArrayProperty = property.datatype == "array" && (property["items"] && !property["items"]["$ref"]);
    const isStructuredProperty = property.datatype != "array" && property["$ref"];
    const isStructuredArrayProperty = property.datatype == "array" && (property["items"] && property["items"]["$ref"]);

    const isPrimaryKey = propertyName === entityType.primaryKey;

    const propertyMetadata = {};
    const propertyMetadataObject = {};

    propertyMetadata["propertyPath"] = parentPropertyName ? parentPropertyName + "." + propertyName : propertyName;
    propertyMetadataObject["propertyPath"] = propertyMetadata["propertyPath"];

    propertyMetadata["propertyLabel"] = propertyName;
    propertyMetadataObject["propertyLabel"] = propertyName;

    propertyMetadata["datatype"] = (isSimpleProperty || isSimpleArrayProperty) ? (isSimpleProperty ? property.datatype : property["items"]["datatype"]) : "object";
    propertyMetadataObject["datatype"] = propertyMetadata["datatype"];

    propertyMetadata["multiple"] = (isSimpleArrayProperty || isStructuredArrayProperty) ? true : false;
    propertyMetadataObject["multiple"] = propertyMetadata["multiple"];

    if(property.sortable && !(isStructuredProperty || isStructuredArrayProperty)) {
      propertyMetadata["sortable"] =  property.sortable;
      propertyMetadataObject["sortable"] = property.sortable;
    }

    if(property.facetable && !(isStructuredProperty || isStructuredArrayProperty)) {
      propertyMetadata["facetable"] =  property.facetable;
      propertyMetadataObject["facetable"] = property.facetable;
    }

    if (isStructuredProperty || isStructuredArrayProperty) {
      let referenceInfo = isStructuredProperty ? property["$ref"].split("/") : property["items"]["$ref"].split("/");
      if (referenceInfo[0] !== "#") {
        // As of 5.3.0, relationship properties are ignored; we won't include data from them in search results
        continue;
      }
      entityName = referenceInfo.pop();
      const metaData = buildAllMetadata(propertyMetadata["propertyPath"], entityModel, entityName);
      propertyMetadata["properties"] = metaData["allPropertiesMetadata"];
      propertyMetadataObject["properties"] = metaData["allPropertiesMetadata"];

      granularPropertyMetadata = Object.assign({},granularPropertyMetadata, metaData["granularPropertyMetadata"]);
    }
    granularPropertyMetadata[propertyMetadataObject["propertyPath"]] = propertyMetadataObject;
    // Ensure the primary key property goes first in the array so it is selected by default
    if (isPrimaryKey) {
      allPropertiesMetadata.unshift(propertyMetadata);
    } else {
      allPropertiesMetadata.push(propertyMetadata);
    }
  }

  const allMetadata = {};
  allMetadata["allPropertiesMetadata"] = allPropertiesMetadata;
  allMetadata["granularPropertyMetadata"] = granularPropertyMetadata;

  return allMetadata;
}

// This function builds the logical entityType property metadata for all entityType properties from metadata
// built by buildAllMetadata.
function buildPropertyMetadata(parentPropertyName, entityModel, entityName) {
  let metaData = buildAllMetadata(parentPropertyName, entityModel, entityName);
  return metaData["allPropertiesMetadata"];
}

// This function builds the logical entityType property metadata for selected entityType properties by user from metadata
// built by buildAllMetadata.
function buildSelectedPropertiesMetadata(allMetadata, selectedPropertyNames) {
  const granularPropertyMetadata = JSON.parse(JSON.stringify(allMetadata["granularPropertyMetadata"]));
  const selectedPropertyDefinitions = {};
  const selectedPropertyDefinitionsArray = [];

  selectedPropertyNames.forEach((selectedPropertyName) => {
    const selectedPropertyNameArray = selectedPropertyName.split(".");
    const actualSelectedPropertyName = selectedPropertyNameArray.pop();

    if(selectedPropertyNameArray.length > 0) {
      const parentPropertyName = selectedPropertyNameArray[0];
      if(selectedPropertyDefinitions[parentPropertyName]) {
        selectedPropertyDefinitions[parentPropertyName] = updateSelectedPropertyMetadata(selectedPropertyName, selectedPropertyDefinitions, granularPropertyMetadata);
      } else {
        let finalMetadataProperty = buildAndCacheSelectedPropertyMetadata(selectedPropertyName, selectedPropertyDefinitions, granularPropertyMetadata);
        if(Object.keys(finalMetadataProperty).length > 0) {
          selectedPropertyDefinitions[parentPropertyName] = finalMetadataProperty;
        }
      }
    } else {
      if(granularPropertyMetadata[actualSelectedPropertyName]) {
        selectedPropertyDefinitions[actualSelectedPropertyName] = granularPropertyMetadata[actualSelectedPropertyName];
      }
    }
  });

  Object.keys(selectedPropertyDefinitions).forEach(key => selectedPropertyDefinitionsArray.push(selectedPropertyDefinitions[key]));
  return selectedPropertyDefinitionsArray;
}

function updateSelectedPropertyMetadata(selectedPropertyName, selectedPropertyDefinitions, granularPropertyMetadata) {
  const selectedPropertyNameArray = selectedPropertyName.split(".");
  const actualSelectedPropertyName = selectedPropertyNameArray.pop();
  const parentPropertyName = selectedPropertyNameArray[0];
  let structuredPropertyPath = "";
  let updatedMetadataObject = JSON.parse(JSON.stringify(selectedPropertyDefinitions[parentPropertyName]));
  let temporaryMetadataObject = updatedMetadataObject;

  selectedPropertyNameArray.forEach((propertyName) => {
    propertyName = structuredPropertyPath ? structuredPropertyPath + "." + propertyName : propertyName;
    structuredPropertyPath = propertyName;

    if(Array.isArray(temporaryMetadataObject)) {
      if(temporaryMetadataObject.map(property => property.propertyPath).includes(propertyName)) {
        temporaryMetadataObject = temporaryMetadataObject.find(property => property.propertyPath === propertyName)["properties"];
      } else {
        let missingProperty = granularPropertyMetadata[structuredPropertyPath];
        missingProperty['properties'] = [];
        temporaryMetadataObject.push(missingProperty);
        temporaryMetadataObject = temporaryMetadataObject.find(property => property.propertyPath === propertyName)["properties"];
      }
    } else {
      temporaryMetadataObject = temporaryMetadataObject["properties"];
    }
  });
  temporaryMetadataObject.push(JSON.parse(JSON.stringify(granularPropertyMetadata[structuredPropertyPath + "." + actualSelectedPropertyName])));
  return updatedMetadataObject;
}

function buildAndCacheSelectedPropertyMetadata(selectedPropertyName, selectedPropertyDefinitions, granularPropertyMetadata) {
  const selectedPropertyNameArray = selectedPropertyName.split(".");
  const actualSelectedPropertyName = selectedPropertyNameArray.pop();
  let structuredPropertyPath = "";
  let selectedPropertyMetadataBuilder = [];

  selectedPropertyNameArray.forEach((propertyName) => {
    propertyName = structuredPropertyPath ? structuredPropertyPath + "." + propertyName : propertyName;
    structuredPropertyPath = propertyName;
    let metadataObject = granularPropertyMetadata[propertyName] ? JSON.parse(JSON.stringify(granularPropertyMetadata[propertyName])) : {};
    delete metadataObject["properties"];
    selectedPropertyMetadataBuilder.push(metadataObject);
  });
  if(granularPropertyMetadata[structuredPropertyPath + "." + actualSelectedPropertyName]) {
    selectedPropertyMetadataBuilder.push(granularPropertyMetadata[structuredPropertyPath + "." + actualSelectedPropertyName]);
  } else {
    selectedPropertyMetadataBuilder = [];
  }
  selectedPropertyMetadataBuilder.reverse();

  let currentProperties = [];
  let finalMetadataProperty = {};
  selectedPropertyMetadataBuilder.forEach((metadataProperty) => {
    if(currentProperties.length > 0) {
      metadataProperty["properties"] = currentProperties;
    }
    currentProperties = [].concat(JSON.parse(JSON.stringify(metadataProperty)));
    finalMetadataProperty = currentProperties.length > 0 ? metadataProperty : {};
  });
  return finalMetadataProperty;
}

/**
 *
 * @param doc expected to be a document-node
 * @returns a JSON object contain the instance properties (expected to be located at
 * envelope/instance/(entity type name))
 */
function getEntityInstanceProperties(doc) {
  const details = ext.getEntityDetails(doc);
  return details != null ? details.properties : null;
}


function getEntitySources(doc) {
  let sourcesArray = [];
  if(!doc) {
    return sourcesArray;
  }

  if(doc instanceof Element || doc instanceof XMLDocument) {
    const sources = doc.xpath("/*:envelope/*:headers/*:sources");
    if(!fn.empty(sources)) {
      for (var srcDoc of sources) {
        const currNode = new NodeBuilder().startDocument().addNode(srcDoc).endDocument().toNode();
        sourcesArray.push(esInstance.canonicalJson(currNode).toObject()["sources"]);
      }
    }
  }

  if (doc.toObject() && doc.toObject().envelope && doc.toObject().envelope.headers && doc.toObject().envelope.headers.sources) {
    const sources = doc.toObject().envelope.headers.sources;
    sourcesArray = Array.isArray(sources) ? sources : [sources];
  }
  return sourcesArray.length ? handleDuplicateSources("datahubSourceName",sourcesArray) : sourcesArray;
}

function getPropertyValues(currentProperty, entityInstance) {
  let resultObject = {};
  resultObject.propertyPath = currentProperty.propertyPath;

  if(currentProperty.datatype === "object") {
    resultObject.propertyValue = [];

    let propertyName = currentProperty.propertyPath.split(".").pop();
    if(!entityInstance[propertyName] || Object.keys(entityInstance[propertyName]).length == 0) {
      return resultObject;
    }

    // OR condition is to handle the merged instances where datatype is object but there are array of objects after merge
    if(currentProperty.multiple || Array.isArray(entityInstance[propertyName])) {
      entityInstance = entityInstance[propertyName];
      entityInstance.forEach((instance) => {
        let currentPropertyValueArray = [];
        let childPropertyName = Object.keys(instance)[0];
        instance = instance[childPropertyName];
        currentProperty.properties.forEach((property) => {
          currentPropertyValueArray.push(getPropertyValues(property, instance));
        });
        resultObject.propertyValue.push(currentPropertyValueArray);
      });
    } else {
      let currentPropertyValueArray = [];
      let childPropertyName = Object.keys(entityInstance[propertyName])[0];
      entityInstance = entityInstance[propertyName][childPropertyName];
      currentProperty.properties.forEach((property) => {
        currentPropertyValueArray.push(getPropertyValues(property, entityInstance));
      });
      resultObject.propertyValue.push(currentPropertyValueArray);
    }
  } else {
    let propertyName = currentProperty.propertyPath.split(".").pop();
    resultObject.propertyValue = entityInstance[propertyName] ? entityInstance[propertyName] :
        (currentProperty.multiple ? [] : "");
  }
  return resultObject;
}

// returns null to use uri
function getPrimaryValue(entityInstance, entityDefinition) {
  let primaryKeyData = {}
  if (entityDefinition.hasOwnProperty("primaryKey")) {
    let primaryKey = entityDefinition.primaryKey;

    if (entityInstance.hasOwnProperty(primaryKey)) {
      let primaryKeyValue = entityInstance[primaryKey];

      if (primaryKeyValue === null || String(primaryKeyValue).trim().length === 0) {
        return null;
      } else {
        primaryKeyData.propertyPath = primaryKey;
        primaryKeyData.propertyValue = primaryKeyValue;
        return primaryKeyData;
      }
    } else { // no primaryKey in entityInstance, so use uri
      return null;
    }
  } else { // no primaryKey in entityDef, so use uri
    return null;
  }
}

/**
 *
 * @param result {object} the search result
 * @param entityName {string}
 * @param entityModel {object} retrieved via entityName
 * @param selectedPropertyMetadata {array} optional; the specific properties to add
 * @returns
 */
function addEntitySpecificProperties(result, entityName, entityModel, selectedPropertyMetadata) {
  result.entityName = "";
  result.createdOn = "";
  result.createdBy = "";
  result.entityProperties = [];
  result.sources = [];
  result.entityInstance = {};

  const entityDefinition = entityModel.definitions[entityName];
  const doc = cts.doc(result.uri);

  const entityProperties = getEntityInstanceProperties(doc);

  if (!entityProperties) {
    console.log(`Unable to obtain entity properties from document with URI '${result.uri}' and entity name '${entityName}'; will not add entity properties to its search result`);
    return;
  }

  selectedPropertyMetadata.forEach(parentProperty => {
    result.entityProperties.push(getPropertyValues(parentProperty, entityProperties));
  });
  addPrimaryKeyToResult(result, entityProperties, entityDefinition);

  const metadata = xdmp.documentGetMetadata(result.uri);
  if (metadata) {
    result.createdOn = metadata.datahubCreatedOn;
    result.createdBy = metadata.datahubCreatedBy;
  }

  result.entityInstance = entityProperties;
  result.sources = getEntitySources(doc);
  result.entityName = entityName;
}

function addGenericEntityProperties(result) {
  result.primaryKey = {};
  result.identifier = {};
  result.entityName = "";
  result.createdOn = "";
  result.createdBy = "";
  result.sources = [];
  result.entityInstance = {};

  const doc = cts.doc(result.uri);
  const entityDetails = ext.getEntityDetails(doc);
  if(!entityDetails) {
    console.log(`Unable to obtain entity instance from document with URI '${result.uri}'; will not add entity properties to its search result`);
    return;
  }

  const entityName = entityDetails.entityName;
  if(!entityName) {
    console.log(`Unable to determine the entity type from document with URI '${result.uri}'; will not add entity properties to its search result`);
    return;
  }

  const entityProperties = entityDetails.properties;

  const entityModel = entityLib.findModelByEntityName(entityName);
  if(!entityModel) {
    console.log(`Unable to find an entity model for entity name: ${entityName}; will not add entity properties to its search result`);
    return;
  }

  const entityDef = entityModel.definitions[entityName];

  addPrimaryKeyToResult(result, entityProperties, entityDef);
  try {
    result.createdOn = xdmp.documentGetMetadata(result.uri).datahubCreatedOn;
    result.createdBy = xdmp.documentGetMetadata(result.uri).datahubCreatedBy;
  } catch (error) {
    console.log(`Unable to obtain document with URI '${result.uri}'; will not add document metadata to its search result`);
  }

  let identifierValue = result.primaryKey.propertyPath === "uri" ? result.uri : result.primaryKey.propertyValue;
  result.identifier = {
    "propertyPath": "identifier",
    "propertyValue": identifierValue
  };
  result.entityInstance = entityProperties;
  result.sources = getEntitySources(doc);
  result.entityName = entityName;
}

function addPrimaryKeyToResult(result, entityInstance, entityDef) {
  result.primaryKey = null;
  if(entityDef) {
    result.primaryKey = getPrimaryValue(entityInstance, entityDef);
  }

  // no primaryKey in entity instance, so use URI
  if (!result.primaryKey) {
    result.primaryKey = {
      "propertyPath": "uri",
      "propertyValue": result.uri
    }
  }
}

function removeEntityNameFromCollection(searchResponse, entityName) {
  if (searchResponse.hasOwnProperty('facets')) {
    if (searchResponse.facets.hasOwnProperty("Collection")) {
      let updatedFacetValues = []
      searchResponse.facets.Collection.facetValues.map(facet => {
        if (facet.name !== entityName) updatedFacetValues.push(facet);
      })
      searchResponse.facets.Collection.facetValues = updatedFacetValues
    }
  }
}

function handleDuplicateSources (propToValidate, arrayWithDuplicates) {
  return Array.from(
    arrayWithDuplicates.reduce(
        (acc, item) => (
          item && item[propToValidate] && acc.set(item[propToValidate], item),
          acc
        ),
        new Map()
      )
      .values()
  );
}

function addDocumentMetadataToSearchResults(searchResponse) {
  searchResponse.results.forEach(result => {
    let hubMetadata = {};
    const docUri = result.uri;
    const documentMetadata = xdmp.documentGetMetadata(docUri);
    const sources = getEntitySources(cts.doc(docUri));
    if(documentMetadata) {
      hubMetadata["lastProcessedByFlow"] = documentMetadata.datahubCreatedInFlow;
      hubMetadata["lastProcessedByStep"] = documentMetadata.datahubCreatedByStep;
      hubMetadata["lastProcessedDateTime"] = documentMetadata.datahubCreatedOn;
    }

    if(sources.length) {
      hubMetadata["sources"] = sources;
    }
    result["documentSize"] = getDocumentSize(cts.doc(docUri));
    result["hubMetadata"] = hubMetadata;
  });
}

function getRecordHistory(docUri) {
  const history = [];
  const relations = {'associatedWith': '?', 'attributedTo': '?'};
  const provenanceRecords = prov.findProvenance(docUri, relations);

  if(provenanceRecords.length) {
    const flowsMap = findFlowsAsMap();
    const stepNames = getArtifactNamesFromUris(consts.STEP_COLLECTION, '/steps', '.step.json');
    const stepDefinitionNames = getArtifactNamesFromUris(consts.STEP_DEFINITION_COLLECTION, '/step-definitions/', '.step.json');
    provenanceRecords.forEach((provenanceRecord) => {
      const historyObject = {};
      const flowAndStepNames = findFlowAndStepNameFromProvenanceRecords(provenanceRecord, stepNames, stepDefinitionNames, flowsMap);
      historyObject["updatedTime"] = provenanceRecord["dateTime"] ? provenanceRecord["dateTime"] : undefined;
      historyObject["flow"] = flowAndStepNames["flowName"] ? flowAndStepNames["flowName"] : undefined;
      historyObject["step"] = flowAndStepNames["stepName"] ? flowAndStepNames["stepName"] : undefined;
      historyObject["user"] = provenanceRecord["attributedTo"] ? provenanceRecord["attributedTo"] : undefined;
      history.push(historyObject);
    });
  } else {
    const metadata = getRecordMetadata(docUri);
    if(Object.keys(metadata).length) {
      history.push(getRecordMetadata(docUri));
    }
  }
  return history;
}

function findFlowAndStepNameFromProvenanceRecords(provenanceRecord, stepNames, stepDefinitionNames, flowsMap) {
  const flowAndStepNames = {};
  const associatedWith = provenanceRecord.associatedWith.toObject();
  const commonFlowNames = associatedWith.filter(artifactName => Object.keys(flowsMap).includes(artifactName.toString()));

  commonFlowNames.forEach(artifactName => {
    if(provenanceRecord["provID"].toString().includes(artifactName)) {
      flowAndStepNames["flowName"] = artifactName;
    }
  });

  if(!flowAndStepNames["flowName"]) {
    return flowAndStepNames;
  }

  for (let currentIndex=0; currentIndex<associatedWith.length-1; currentIndex++) {
    if(associatedWith[currentIndex] === flowAndStepNames["flowName"]) {
      let artifactTobeRemoved =  associatedWith[currentIndex];
      associatedWith[currentIndex] = associatedWith[associatedWith.length-1];
      associatedWith[associatedWith.length-1] = artifactTobeRemoved;
      break;
    }
  }
  associatedWith.pop();

  const flow = flowsMap[flowAndStepNames["flowName"]];
  const flowStepNames = Object.keys(flow["steps"]).map(step => flow["steps"][step].name);
  const commonFlowStepNames = associatedWith.filter(artifactName => flowStepNames.includes(artifactName));
  flowAndStepNames["stepName"] = commonFlowStepNames.length ? commonFlowStepNames[0] : undefined;
  if(flowAndStepNames["stepName"]) {
    return flowAndStepNames;
  }

  const commonStepNames = associatedWith.filter(artifactName => stepNames.includes(artifactName));
  flowAndStepNames["stepName"] = commonStepNames.length ? commonStepNames[0] : undefined;
  if(commonStepNames.length == 0) {
    const commonStepDefinitionNames = associatedWith.filter(artifactName => stepDefinitionNames.includes(artifactName));
    flowAndStepNames["stepName"] = commonStepDefinitionNames.length ? commonStepDefinitionNames[0] : undefined;
  }

  return flowAndStepNames;
}

function getRecordMetadata(docUri) {
  const metadata = xdmp.documentGetMetadata(docUri);
  const currentObject = {};
  if(metadata) {
    // datahubCreatedOn field captures the document/record last updated timestamp. It is not the document/record creation timestamp
    currentObject.updatedTime = metadata.datahubCreatedOn ? metadata.datahubCreatedOn : undefined;
    currentObject.flow = metadata.datahubCreatedInFlow ? metadata.datahubCreatedInFlow : undefined;
    currentObject.step = metadata.datahubCreatedByStep ? metadata.datahubCreatedByStep : undefined;
    currentObject.user = metadata.datahubCreatedBy ? metadata.datahubCreatedBy : undefined;
  }
  return currentObject;
}

function getArtifactNamesFromUris(collection, expectedPrefix, expectedSuffix) {
  const artifactNames = [];
  cts.uris(null, null, cts.collectionQuery(collection)).toArray().map(uri => {
    uri = uri.toString();
    if (uri.startsWith(expectedPrefix) && uri.endsWith(expectedSuffix)) {
      artifactNames.push(uri.replace(expectedPrefix,'').replace(new RegExp(expectedSuffix + '$'), '').split("/").pop());
    }
  });
  return artifactNames;
}

function findFlowsAsMap() {
  const flows = {};
  fn.collection(consts.FLOW_COLLECTION).toArray().forEach((flow) => {
    flow = flow.toObject();
    const flowName = flow["name"];
    flows[flowName] = flow;
  });
  return flows;
}

function getDocumentSize(doc) {
  const sizes = ['B', 'KB', 'MB'];
  const documentSize = {};
  const nodeKind = xdmp.nodeKind(doc.root);
  let bytes = 0;

  if(nodeKind === 'binary') {
    bytes = xdmp.binarySize(fn.head(doc).root);
  } else {
    bytes = xdmp.binarySize(fn.head(xdmp.unquote(xdmp.quote(doc), null, "format-binary")).root)
  }

  let power = Math.floor(Math.log(bytes) / Math.log(1024));
  power = power > 2 ? 2 : power;
  documentSize["value"] = (bytes / Math.pow(1024, power)).toFixed(0) * 1;
  documentSize["units"] = sizes[power];
  return documentSize;
}

function verifyExplorableModel(entityName) {
  if(!entityName) {
    return true;
  }
  const entityModel = entityLib.findModelByEntityName(entityName);
  if(!entityModel) {
    return false;
  }
  const entityTypes = Object.keys(entityModel.definitions);
  return entityTypes.includes(entityModel.info.title);
}

module.exports = {
  addDocumentMetadataToSearchResults,
  addPropertiesToSearchResponse,
  buildPropertyMetadata,
  getDocumentSize,
  getEntityInstanceProperties,
  getEntitySources,
  getRecordHistory
};
