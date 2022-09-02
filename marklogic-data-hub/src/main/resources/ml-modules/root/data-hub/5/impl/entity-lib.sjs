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

/**
 * This library is intended to encapsulate all logic specific to Entity Services models. As of DHF 5.2.0, this logic is
 * spread around the DH codebase. It is expected that this will gradually be refactored so that all ES-specific logic
 * resides in this module to promote reuse and also simplify upgrades as Entity Services changes within MarkLogic.
 */

const sem = require("/MarkLogic/semantics.xqy");
const semPrefixes = {es: 'http://marklogic.com/entity-services#'};
const config = require("/com.marklogic.hub/config.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");
const hent = require("/data-hub/5/impl/hub-entities.xqy");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const {getModel} = require("../builtins/steps/mapping/default/lib.sjs");

/**
 * @return an array of strings, one for each EntityType
 */
function findEntityTypeIds() {
  return cts.triples(null,
    sem.iri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    sem.iri('http://marklogic.com/entity-services#EntityType')
  ).toArray().map(triple => sem.tripleSubject(triple).toString());
}

/**
 * @return a map object where each key is an EntityTypeId, and the value of each key is the corresponding entity type
 */
function findEntityTypesAsMap() {
  const map = {};
  for (var doc of cts.search(cts.collectionQuery(getModelCollection()))) {
    Object.assign(map, convertModelToEntityTypeMap(doc.toObject()));
  }
  return map;
}

/**
 * @param entityTypeId string or a sem.iri
 * @return the matching model document, or null if one is not found
 */
function findModelForEntityTypeId(entityTypeId) {
  return fn.head(cts.search(
    cts.andQuery([
      cts.collectionQuery(getModelCollection()),
      cts.tripleRangeQuery(sem.iri(entityTypeId), sem.curieExpand("rdf:type"), sem.curieExpand("es:EntityType", semPrefixes))
    ])));
}

/**
 * Use this for retrieving an entity model when all you have is the name of the entity that is assumed to be the
 * "primary" entity in the model.
 *
 * @param entityName
 * @returns {null|*}
 */
function findModelByEntityName(entityName) {
  const assumedUri = "/entities/" + entityName + ".entity.json";
  if (!fn.docAvailable(assumedUri)) {
    return null;
  }
  return cts.doc(assumedUri).toObject();
}

function findDraftModelByEntityName(entityName) {
  const assumedUri = "/entities/" + entityName + ".draft.entity.json";
  if (!fn.docAvailable(assumedUri)) {
    return null;
  }
  return cts.doc(assumedUri).toObject();
}

/**
 * @param entityTypeId string or a sem.iri
 * @return null if a model can't be found matching the given EntityTypeId, or if a model is found but there's no an entity type
 * with a title matching the entity title in the EntityTypeId. Otherwise, the entity type from the definitions array in the model
 * is returned.
 */
function findEntityType(entityTypeId) {
  const modelDoc = findModelForEntityTypeId(entityTypeId);
  if (!modelDoc) {
    return null;
  }
  return modelDoc.toObject().definitions[getEntityTypeIdParts(entityTypeId).entityTypeTitle];
}

/**
 * @param entityTypeId sem.iri or string
 * @return {{entityTypeTitle: string, baseUri: string, modelTitle: string, version: string}}
 */
function getEntityTypeIdParts(entityTypeId) {
  if (entityTypeId == null) {
    throw Error("Cannot get EntityTypeId parts from null EntityTypeId");
  }

  entityTypeId = entityTypeId.toString();

  const tokens = entityTypeId.split("/");
  if (tokens.length < 3) {
    throw Error("Could not get EntityTypeId parts from invalid EntityTypeId: " + entityTypeId);
  }

  const infoTokens = tokens[tokens.length - 2].split("-");
  if (infoTokens.length < 2) {
    throw Error("Could not get EntityTypeId parts; expected info part did not contain a hyphen; EntityTypeId: " + entityTypeId);
  }

  const title = tokens[tokens.length - 1];
  const baseUri = tokens.slice(0, tokens.length - 2).join("/") + "/";
  return {
    baseUri: baseUri,
    modelTitle: infoTokens[0],
    version: infoTokens.slice(1).join("-"),
    entityTypeTitle: title
  };
}

/**
 * @param model the model object as found in a model descriptor
 * @param entityTypeTitle a string identifying the entity type in the definitions array that an IRI is needed for
 * @return {string}
 */
function getEntityTypeId(model, entityTypeTitle) {
  return getModelId(model) + "/" + entityTypeTitle;
}

function getModelName(model) {
  if (model.info) {
    return model.info.title;
  }
  return null;
}

function getEntityModelRelationships() {
  const relationshipList = {};

  fn.collection(getModelCollection()).toArray().forEach(model => {
    model = model.toObject();
    let modelName = model.info.title;
    relationshipList[modelName] = !relationshipList[modelName] ? [] : relationshipList[modelName];
    const entityNameIri = getEntityTypeId(model, model.info.title);
    const references = entityModelsWithReferenceExcludingURIs(entityNameIri, []);
    references.forEach(reference => {
      reference = reference.toObject();
      relationshipList[modelName].push(reference.info.title)

      if(relationshipList[reference.info.title]) {
        relationshipList[reference.info.title].push(modelName)
      } else {
        relationshipList[reference.info.title] = [modelName]
      }
    })
  })

  return relationshipList;
}

/**
 * @param model
 * @return a map (object) where each key is an EntityTypeId and the value is the EntityType
 */
function convertModelToEntityTypeMap(model) {
  const map = {};
  const modelId = getModelId(model);
  for (var entityTypeTitle of Object.keys(model.definitions)) {
    map[modelId + "/" + entityTypeTitle] = model.definitions[entityTypeTitle];
  }
  return map;
}

function getModelId(model) {
  const info = model.info;
  const baseUri = info.baseUri || "http://example.org/";
  return baseUri + info.title + "-" + info.version;
}

/**
 * The expectation is that in the future, this will be a more sophisticated query than just assuming that a collection
 * equalling the entity name is a reliable way of finding entity instances.
 * @return {*}
 */
function buildQueryForEntityName(entityName) {
  return cts.collectionQuery(entityName);
}

function getLatestJobData(entityName) {
  const latestJob = fn.head(fn.subsequence(
    cts.search(
      buildQueryForEntityName(entityName),
      [cts.indexOrder(cts.fieldReference("datahubCreatedOn"), "descending")]
    ), 1, 1
  ));
  if (latestJob) {
    const uri = xdmp.nodeUri(latestJob);
    const response = {
      latestJobDateTime : xdmp.documentGetMetadataValue(uri, "datahubCreatedOn")
    };
    let jobIds = xdmp.documentGetMetadataValue(uri, "datahubCreatedByJob");
    if (jobIds) {
      response.latestJobId = jobIds.split(" ").pop();
    }
    return response;
  }
  return null;
}

/**
 * Use this to get the EntityType from a definitions object when all you have is an entity name - e.g. Customer.
 *
 * @param entityName
 * @returns {null|*}
 */
function findEntityTypeByEntityName(entityName) {
  const uri = getModelUri(entityName);
  if (!fn.docAvailable(uri)) {
    return null;
  }
  return cts.doc(uri).toObject().definitions[entityName];
}

function getModelUri(entityName) {
  return `/entities/${xdmp.urlEncode(entityName)}.entity.json`;
}

function getDraftModelUri(entityName) {
  return `/entities/${xdmp.urlEncode(entityName)}.draft.entity.json`;
}

function getDraftModelCollection() {
  return consts.DRAFT_ENTITY_MODEL_COLLECTION;
}
function getModelCollection() {
  return consts.ENTITY_MODEL_COLLECTION;
}

function deleteDraftModel(entityName) {
  var uri = getModelUri(entityName);
    if (!fn.docAvailable(uri)) {
      uri = getDraftModelUri(entityName);
      if (!fn.docAvailable(uri)) {
          return null;
        }
    }
  const model = cts.doc(uri).toObject();
  model.info.draftDeleted = true;
  writeDraftModel(entityName, model)
}

function cleanupModelsFromHubCentralConfig(retainEntityNames) {
  const hubCentralConfigURI = "/config/hubCentral.json";
  const hubCentralConfig = fn.head(hubUtils.invokeFunction(() => cts.doc(hubCentralConfigURI), config.FINALDATABASE));
  if (hubCentralConfig) {
    const hubCentralConfigObj = hubCentralConfig.toObject();
    if (hubCentralConfigObj.modeling && hubCentralConfigObj.modeling.entities) {
      let changesMade = false;
      for (let entityName of Object.keys(hubCentralConfigObj.modeling.entities)) {
        if (!retainEntityNames.includes(entityName)) {
          changesMade = true;
          delete hubCentralConfigObj.modeling.entities[entityName];
        }
      }
      if (changesMade) {
        hubUtils.writeDocument(hubCentralConfigURI, hubCentralConfigObj, xdmp.nodePermissions(hubCentralConfig), xdmp.nodeCollections(hubCentralConfig), config.FINALDATABASE);
      }
    }
  }
}

function deleteModel(entityName) {
  const uri = getModelUri(entityName);
  [...new Set([config.STAGINGDATABASE, config.FINALDATABASE])].forEach(db => {
    hubUtils.deleteDocument(uri, db);
  });
}

/**
 * Returns the step names that contain a reference to the supplied entity.
 * The targetEntityType for mapping artifacts is checked against both an entityName or an entityTypeId.
 *
 * @param entityName
 * @param entityTypeId
 * @returns {[]}
 */
function findModelReferencesInSteps(entityName, entityTypeId) {
  const stepQuery = cts.andQuery([
    cts.collectionQuery('http://marklogic.com/data-hub/steps'),
    cts.jsonPropertyValueQuery(["targetEntityType", "targetEntity"], [entityName, entityTypeId])
  ]);

  return cts.search(stepQuery).toArray().map(step => step.toObject().name);
}

/**
 * Returns the entity model names that contain a reference to the supplied entityTypeId.
 *
 * @param referencedEntity an entity IRI that we want to find references to
 * @param excludedURIs one or more URIs to exclude from the search
 * @returns {[]}
 */
function entityModelsWithReferenceExcludingURIs(referencedEntity, excludedURIs) {
  const entityModelQuery = cts.andNotQuery(cts.andQuery([cts.collectionQuery([getModelCollection(),getDraftModelCollection()]), cts.jsonPropertyValueQuery(["$ref","relatedEntityType"],referencedEntity)]), cts.documentQuery(excludedURIs));
  return cts.search(entityModelQuery).toArray()
}

/**
 * Returns the entity model names that contain a reference to the supplied entityTypeId.
 *
 * @param entityModelUri
 * @param entityTypeId
 * @returns {[]}
 */
function findModelReferencesInOtherModels(entityModelUri, entityTypeId) {
  const affectedModels = new Set();
  const entityModels = entityModelsWithReferenceExcludingURIs(entityTypeId, entityModelUri).map(model => model.toObject());
  const entityModelsToBeDeleted = entityModels.filter((model) => model.info.draftDeleted).map((model) => getModelName(model));
    entityModels
      .filter((model) => !entityModelsToBeDeleted.includes(getModelName(model)))
      .forEach(model => {
        const modelName = getModelName(model);
        Object.keys(model.definitions)
          .forEach(definition => {
            const properties = model.definitions[definition].properties;
            Object.keys(properties)
              .some(property => {
                if (properties[property]["$ref"] === entityTypeId || (properties[property]["datatype"] === "array" && properties[property]["items"]["$ref"] === entityTypeId)) {
                  affectedModels.add(modelName);
                }
              });
          });
      });

  return [...affectedModels];
}

function findForeignKeyReferencesInOtherModels(entityModel, propertyName){
  const affectedModels = new Set();
  const entityTypeId = getEntityTypeId(entityModel, entityModel.info.title);
  const queries = [];
  queries.push(cts.collectionQuery([getDraftModelCollection(),getModelCollection()]));
  queries.push(cts.jsonPropertyValueQuery("relatedEntityType", entityTypeId, "case-insensitive"));
  if(propertyName){
    queries.push(cts.jsonPropertyValueQuery("joinPropertyName", propertyName, "case-insensitive"));
  }
  const entityModels = cts.search(cts.andQuery(queries)).toArray().map(entityModel => entityModel.toObject());
  const entityModelsToBeDeleted = entityModels.filter((model) => model.info.draftDeleted).map((model) => getModelName(model));
  const entityModelsDraftWithoutRelated = cts.search(cts.andNotQuery(cts.collectionQuery([getDraftModelCollection()]),
    cts.jsonPropertyValueQuery("relatedEntityType", entityTypeId, "case-insensitive"))).toArray().map(entityModel =>getModelName(entityModel.toObject()))
  entityModels
    .filter((model) => !entityModelsDraftWithoutRelated.includes(getModelName(model)))
    .filter((model) => !entityModelsToBeDeleted.includes(getModelName(model)))
    .forEach((model) => affectedModels.add(getModelName(model)));
  return [...affectedModels];
}

/**
 * Finds and removes the properties in all models that refers to the supplied entityTypeId in memory.
 * This allows for multiple calls in a singe transaction for publishing.
 *
 * @param entityModelUri
 * @param entityTypeId
 * @param inMemoryModels model objects stored by modelName to allow multiple updates in a transaction
 */
function otherModelsWithModelReferencesRemoved(entityModelUri, entityTypeId, inMemoryModels = {}) {
  const affectedModels = new Set();
  const entityModels = entityModelsWithReferenceExcludingURIs(entityTypeId, entityModelUri);
  entityModels.map(model => model.toObject())
    .forEach(model => {
      const draftUri = getDraftModelUri(model.info.title);
      if (inMemoryModels[model.info.title]) {
        model = inMemoryModels[model.info.title];
      } else if ((fn.docAvailable(draftUri))) {
        model = cts.doc(draftUri).toObject();
      }
      Object.keys(model.definitions)
        .forEach(definition => {
          const properties = model.definitions[definition].properties;
          Object.keys(properties)
            .forEach(property => {
              let items = properties[property]["datatype"] === "array" ? properties[property]["items"]: properties[property];
              if (items["$ref"] === entityTypeId || items.relatedEntityType === entityTypeId) {
                delete properties[property];
                affectedModels.add(model);
              }
            });
        });
    });

  return [...affectedModels];
}

/**
 * Finds and deletes the properties in all models that refers to the supplied entityTypeId.
 *
 * @param entityModelUri
 * @param entityTypeId
 */
function deleteModelReferencesInOtherModels(entityModelUri, entityTypeId) {
  const updatedModels = otherModelsWithModelReferencesRemoved(entityModelUri, entityTypeId);
  const permissions = getModelPermissions();

  // This does not reuse writeModel because we do not want to hit the xdmp.documentInsert line. This requires the
  // deleteModel.sjs endpoint to then have declareUpdate. But when that is added, the call to deleteDocument then hangs.
  // Applying a Set in case both constants point to the same database.
  const databases = [...new Set([config.STAGINGDATABASE, config.FINALDATABASE])];
  updatedModels.forEach(model => {
    databases.forEach(db => {
      const entityName = getModelName(model);
      hubUtils.writeDocument(getModelUri(entityName), model, permissions, getModelCollection(), db)
    });
  });
}

/**
 * Handles writing a draft model to both databases. Will overwrite existing permissions/collections, which is consistent
 * with how DH has been since 5.0.
 *
 * @param entityName
 * @param model
 */
function writeDraftModel(entityName, model) {
   model.info.draft = true;
  writeModelToDatabases(entityName, model, [config.STAGINGDATABASE, config.FINALDATABASE], true);
}

/**
 * Handles writing the model to both databases. Will overwrite existing permissions/collections, which is consistent
 * with how DH has been since 5.0.
 *
 * @param entityName
 * @param model
 */
function writeModel(entityName, model) {
  writeModelToDatabases(entityName, model, [config.STAGINGDATABASE, config.FINALDATABASE], false);
}

/**
 * Writes models to the given databases. Added to allow for the saveModels endpoint to only write to the database
 * associated with the app server by which it is invoked.
 *
 * @param entityName
 * @param model
 * @param databases
 */
function writeModelToDatabases(entityName, model, databases, isDraft = false) {
  databases = [...new Set(databases)];
  let collection, uriFunction;
  if (isDraft) {
    collection = consts.DRAFT_ENTITY_MODEL_COLLECTION;
    uriFunction = getDraftModelUri;
  } else {
    collection = consts.ENTITY_MODEL_COLLECTION;
    uriFunction = getModelUri;
  }

  if (model.info) {
    if (!model.info.version) {
      model.info.version = "1.0.0";
    }
    if (!model.info.baseUri) {
      model.info.baseUri = "http://example.org/";
    }
  }

  if (model.definitions) {
    validateModelDefinitions(model.definitions);
  }

  hubUtils.replaceLanguageWithLang(model);

  const permissions = getModelPermissions();

  databases.forEach(db => {
    // It is significantly faster to use xdmp.documentInsert due to the existence of pre and post commit triggers.
    // Using xdmp.invoke results in e.g. 20 models being saved in several seconds as opposed to well under a second
    // when calling xdmp.documentInsert directly.
    if (db === xdmp.databaseName(xdmp.database())) {
      xdmp.documentInsert(uriFunction(entityName), model, permissions, collection);
    } else {
      hubUtils.writeDocument(uriFunction(entityName), model, permissions, collection, db)
    }
  });
}

function getEntityNames() {
  return hubUtils.invokeFunction(() => cts.search(cts.collectionQuery(consts.ENTITY_MODEL_COLLECTION)), config.FINALDATABASE)
    .toArray()
    .map(entityNode => entityNode.toObject().info.title);
}

function publishDraftModels() {
  hubUtils.hubTrace(consts.TRACE_ENTITY,`publishing in database: ${xdmp.databaseName(xdmp.database())}`);
  const draftModels = hubUtils.invokeFunction(() => cts.search(cts.collectionQuery(consts.DRAFT_ENTITY_MODEL_COLLECTION)), xdmp.databaseName(xdmp.database()));
  hubUtils.hubTrace(consts.TRACE_ENTITY,`Publishing draft models: ${xdmp.toJsonString(draftModels)}`);
  const inMemoryModelsUpdated = {};

  for (const draftModel of draftModels) {
    let modelObject = draftModel.toObject();
    modelObject.info.draft = false;
    if(modelObject.info.draftDeleted) {
      hubUtils.hubTrace(consts.TRACE_ENTITY,`deleting draft model: ${modelObject.info.title}`);
      deleteModel(modelObject.info.title);
      hubUtils.hubTrace(consts.TRACE_ENTITY,`deleted draft model: ${modelObject.info.title}`);
    } else {
      // if the draft changes aren't already picked up by reference updates, add them here.
      if (!inMemoryModelsUpdated[modelObject.info.title]) {
        inMemoryModelsUpdated[modelObject.info.title] = modelObject;
      }
    }
  }
  // write all of the affected models out here
  for (const modelName in inMemoryModelsUpdated) {
    hubUtils.hubTrace(consts.TRACE_ENTITY,`writing draft model: ${modelName}`);
    writeModel(modelName, inMemoryModelsUpdated[modelName]);
    hubUtils.hubTrace(consts.TRACE_ENTITY,`draft model written: ${modelName}`);
  }
  const deleteDraftsOperation = () => {
    hubUtils.hubTrace(consts.TRACE_ENTITY,"deleting draft collection");
    xdmp.collectionDelete(consts.DRAFT_ENTITY_MODEL_COLLECTION);
    hubUtils.hubTrace(consts.TRACE_ENTITY,"deleted draft collection");
  };
  const databaseNames = [...new Set([config.STAGINGDATABASE, config.FINALDATABASE])];
  const currentDatabase = xdmp.database();
  databaseNames.forEach(databaseName => {
    const database = xdmp.database(databaseName);
    if (database === currentDatabase) {
      deleteDraftsOperation();
    } else {
      xdmp.invokeFunction(deleteDraftsOperation, {database, update: "true", commit: "auto"});
    }
  });
  cleanupModelsFromHubCentralConfig(getEntityNames());
}

function getModelPermissions() {
  let permsString = "%%mlEntityModelPermissions%%";
  permsString = permsString.indexOf("%mlEntityModelPermissions%") > -1 ?
    "data-hub-entity-model-reader,read,data-hub-entity-model-writer,update" :
    permsString;
  return hubUtils.parsePermissions(permsString);
}

function validateModelDefinitions(definitions) {
  const pattern = /^[a-zA-Z][a-zA-Z0-9\-_]*$/;
  Object.keys(definitions).forEach(entityName => {
    if (!pattern.test(entityName)) {
      httpUtils.throwBadRequest(`Invalid entity name: ${entityName}; must start with a letter and can only contain letters, numbers, hyphens, and underscores.`);
    }


    if (hent.isExplorerConstraintName(entityName)) {
      httpUtils.throwBadRequest(`${entityName} is a reserved term and is not allowed as an entity name.`);
    }

    if (definitions[entityName].properties) {
      Object.keys(definitions[entityName].properties).forEach(propertyName => {
        try{
          fn.QName('',propertyName)
        }
        catch(ex){
          httpUtils.throwBadRequest(`Invalid property name: ${propertyName} in entity model ${entityName}; it must be a valid NCName as defined at http://www.datypic.com/sc/xsd/t-xsd_Name.html.`);
        }
      });
    }
    return entityName;
  });
}

function findEntityIdentifiers(uris, entityType) {
  return fn.head(hent.findEntityIdentifiers(hubUtils.normalizeToSequence(uris), entityType));
}

function getPredicatesByModel(model, includeConceptPredicates = false) {
  const predicateList = [];
  // predicates in model document
  for (const definitionName in model.definitions) {
    let entityProperties = model.definitions[definitionName].properties;
    const entityNameIri = getEntityTypeId(model, definitionName);
    for (let entityPropertyName in entityProperties) {
      let entityPropertyValue = entityProperties[entityPropertyName];
      if (entityPropertyValue["relatedEntityType"] != null){
        predicateList.push(sem.iri(entityNameIri+"/"+entityPropertyName));
      }else if (entityPropertyValue["items"] != null) {
        let items = entityPropertyValue["items"]
        if (items["relatedEntityType"] != null) {
          predicateList.push(sem.iri(entityNameIri+"/"+entityPropertyName));
        }
      }
    }
    if (includeConceptPredicates) {
      const relatedConcepts = model.definitions[definitionName].relatedConcepts || [];
      for (const relatedConcept of relatedConcepts) {
        if (relatedConcept.predicate) {
          predicateList.push(sem.iri(relatedConcept.predicate));
        }
      }
    }
  }

  // predicates referencing model document
  const entityNameIri = getEntityTypeId(model, model.info.title);
  const referencingModels = cts.search(cts.andQuery([cts.collectionQuery(getModelCollection()), cts.jsonPropertyValueQuery("relatedEntityType", entityNameIri)]));
  for (const referencingModel of referencingModels) {
    const modelId = getModelId(referencingModel.toObject());
    const separator = modelId.endsWith("/") ? "" : "/";
    for (const propertyReferencing of referencingModel.xpath(`/definitions/*/properties/*[(relatedEntityType|items/relatedEntityType) = "${entityNameIri}"]`)) {
      const entityName = fn.string(fn.nodeName(fn.head(propertyReferencing.xpath("../.."))));
      const propertyName = fn.string(fn.nodeName(propertyReferencing));
      predicateList.push(sem.iri(modelId + separator + entityName + "/" + propertyName));
    }
  }
  return predicateList;
}

function getRefType(model,propertyName) {
  let refTypeReturn = "";
    let entityProperty = model.properties[propertyName];
      if (entityProperty["items"] == null) {
        refTypeReturn = entityProperty["$ref"];
      } else {
        if (entityProperty["items"] != null) {
          let items = entityProperty["items"]
          if (items["$ref"] != null){
            refTypeReturn = items["$ref"];
          }
        }
      }
      if (refTypeReturn != null) {
        refTypeReturn = refTypeReturn.split("/").pop();
      }
  return refTypeReturn;
}

function getConceptPredicatesByModel(model) {
  const conceptPredicateList = [];
  const entityName = model.info.title;
  if(model.definitions[entityName] !== undefined && model.definitions[entityName].toString().length > 0) {
    let relatedConcepts = [];
    relatedConcepts = model.definitions[entityName].relatedConcepts;
    if(relatedConcepts !== undefined && relatedConcepts.toString().length > 0) {
      for(let relatedConcept in relatedConcepts){
        let entityRelatedConcept = relatedConcepts[relatedConcept];
        if(entityRelatedConcept["predicate"] != null){
          conceptPredicateList.push(sem.iri(entityRelatedConcept["predicate"]));
        }
      }
    }
  }
  return conceptPredicateList;
}


function getPredicatesByModelAndBaseEntities(model,relatedEntityTypeIds) {
  const predicateList = [];
  const entityName = model.info.title;
  const entityNameIri = getEntityTypeId(model, entityName);
  if(model.definitions[entityName] !== undefined && model.definitions[entityName].toString().length > 0) {
    let entityProperties = model.definitions[entityName].properties;
    for (let entityPropertyName in entityProperties) {
      let entityPropertyValue = entityProperties[entityPropertyName];
      if (entityPropertyValue["relatedEntityType"] != null) {
        let relatedEntityTypeArray = entityPropertyValue["relatedEntityType"].split("/");
        let foreignEntity = relatedEntityTypeArray[relatedEntityTypeArray.length - 1];
        if (relatedEntityTypeIds.includes(foreignEntity)) {
          predicateList.push(sem.iri(entityNameIri + "/" + entityPropertyName));
        }

      } else {
        if (entityPropertyValue["items"] != null) {
          let items = entityPropertyValue["items"]
          if (items["relatedEntityType"] != null) {
            let relatedEntityTypeArray = items["relatedEntityType"].split("/");
            let foreignEntity = relatedEntityTypeArray[relatedEntityTypeArray.length - 1];
            if (relatedEntityTypeIds.includes(foreignEntity)) {
              predicateList.push(sem.iri(entityNameIri + "/" + entityPropertyName));
            }

          }
        }
      }
    }
  }

  // predicates referencing model document
  let referencingModels = cts.search(cts.andQuery([cts.collectionQuery(getModelCollection()), cts.jsonPropertyValueQuery("relatedEntityType", entityNameIri)]));
  referencingModels = referencingModels.toArray().filter(model => relatedEntityTypeIds.includes(model.toObject().info.title));
  for (const referencingModel of referencingModels) {
    const modelId = getModelId(referencingModel.toObject());
    const separator = modelId.endsWith("/") ? "" : "/";
    for (const propertyReferencing of referencingModel.xpath(`/definitions/*/properties/*[(relatedEntityType|items/relatedEntityType) = "${entityNameIri}"]`)) {
      const entityName = fn.string(fn.nodeName(fn.head(propertyReferencing.xpath("../.."))));
      const propertyName = fn.string(fn.nodeName(propertyReferencing));
      predicateList.push(sem.iri(modelId + separator + entityName + "/" + propertyName));
    }
  }

  return predicateList;
}

function getLabelFromHubConfigByEntityType(entityType, hubCentralConfig) {
  if(hubCentralConfig != null && fn.exists(hubCentralConfig.xpath("/modeling/entities/" + entityType))){
    return hubCentralConfig.xpath("/modeling/entities/" + entityType + "/label");
  }
  return "";
}

function getValueFromProperty(propertyName, docUri,entityType) {
  const doc = cts.doc(docUri);
  if(fn.exists(doc.xpath(".//*:envelope/*:instance/*:"+entityType+"/*:"+propertyName))){
    return fn.data(doc.xpath(".//*:envelope/*:instance/*:"+entityType+"/*:"+propertyName));
  }
  return "";
}

function getPropertiesOnHoverFromHubConfigByEntityType(entityType, hubCentralConfig) {
  if(hubCentralConfig != null && fn.exists(hubCentralConfig.xpath("/modeling/entities/" + entityType+"/propertiesOnHover"))){
    const obj = JSON.parse(hubCentralConfig);
    return obj.modeling.entities[entityType].propertiesOnHover;
  }
  return "";
}

function getValuesPropertiesOnHover(docUri,entityType, hubCentralConfig) {
  let resultPropertiesOnHover = [];
  let configPropertiesOnHover = getPropertiesOnHoverFromHubConfigByEntityType(entityType, hubCentralConfig);
  if(configPropertiesOnHover.toString().length > 0){
    //check in the document the value of the configuration property
    for (let i = 0; i < configPropertiesOnHover.length; i++) {
      let entityPropertyName = configPropertiesOnHover[i];
      if(!entityPropertyName.includes(".")){
        //create an Property on hover object
        let objPropertyOnHover = new Object();
        objPropertyOnHover[entityPropertyName] = getValueFromProperty(entityPropertyName,docUri,entityType);
        resultPropertiesOnHover.push(objPropertyOnHover);
      }else{

        let propertyVec = entityPropertyName.split(".");
        let objPropertyOnHover = new Object();
        const entityModel = entityLib.findEntityTypeByEntityName(entityType);
        let newPath = "";
        for (let j = 0; j < propertyVec.length; j++) {
          if (j < propertyVec.length -1) {
            newPath  += "/*:" + propertyVec[j] + "/*:" + entityLib.getRefType(entityModel,propertyVec[j]);
          } else {
            newPath  += "/*:" + propertyVec[j];
          }

        }
        objPropertyOnHover[entityPropertyName] = getValueFromPropertyPath(entityPropertyName,docUri,entityType, newPath);
        resultPropertiesOnHover.push(objPropertyOnHover);
      }
    }
  }
  return resultPropertiesOnHover;
}

function getValueFromPropertyPath(path, docUri,entityType,propertyPath) {
  const doc = cts.doc(docUri);
  if(fn.exists(doc.xpath(".//*:envelope/*:instance/*:"+entityType+propertyPath))){
    return fn.data(doc.xpath(".//*:envelope/*:instance/*:"+entityType+propertyPath));
  }
  return "";
}

/**
 * Returns the matching steps names that contain a reference to the supplied entity and property name in the related mapping section.
 *
 * @param entityName
 * @param entityTypeId
 * @param propertyName
 * @returns {[]}
 */
function findModelAndPropertyReferencesInMappingRelatedSteps(entityName, entityTypeId, propertyName) {
  const stepQuery = cts.andQuery([
    cts.collectionQuery('http://marklogic.com/data-hub/steps'),
    cts.jsonPropertyValueQuery(["targetEntityType"], [entityTypeId]),
    cts.jsonPropertyValueQuery(["relatedEntityMappingId"], [entityName+"."+propertyName+":*"],["wildcarded"])
  ]);

  return cts.search(stepQuery).toArray().map(step => step.toObject().name);
}

/**
 * Returns the matching steps names that contain a reference to the supplied entity and property name.
 *
 * @param entityName
 * @param propertyName
 * @returns {[]}
 */
function findModelAndPropertyReferencesInMatchingMergingSteps(entityName, propertyName) {
  const stepQuery = cts.andQuery([
    cts.collectionQuery('http://marklogic.com/data-hub/steps'),
    cts.jsonPropertyValueQuery(["targetEntityType"], [entityName]),
    cts.jsonPropertyValueQuery(["entityPropertyPath"], [propertyName])
  ]);

  return cts.search(stepQuery).toArray().map(step => step.toObject().name);
}

/**
 * Returns the matching steps names that contain a reference to the supplied entity and property name in properties section.
 *
 * @param entityName
 * @param entityTypeId
 * @param propertyName
 * @returns {[]}
 */
function findModelAndPropertyReferencesInMappingSteps(entityName, entityTypeId, propertyName) {
  const stepQuery = cts.andQuery([
    cts.collectionQuery('http://marklogic.com/data-hub/steps'),
    cts.jsonPropertyValueQuery(["targetEntityType"], [entityTypeId]),
    cts.jsonPropertyScopeQuery(propertyName, cts.notQuery(cts.jsonPropertyValueQuery("sourcedFrom", "")))
  ]);

  return cts.search(stepQuery).toArray().map(step => step.toObject().name);
}

module.exports = {
  deleteDraftModel,
  findForeignKeyReferencesInOtherModels,
  findModelReferencesInSteps,
  findModelReferencesInOtherModels,
  deleteModelReferencesInOtherModels,
  findEntityIdentifiers,
  findEntityType,
  findEntityTypeByEntityName,
  findEntityTypeIds,
  findEntityTypesAsMap,
  findModelByEntityName,
  findDraftModelByEntityName,
  findModelForEntityTypeId,
  getDraftModelCollection,
  getDraftModelUri,
  getEntityTypeId,
  getEntityTypeIdParts,
  getPredicatesByModel,
  getConceptPredicatesByModel,
  getPredicatesByModelAndBaseEntities,
  getLatestJobData,
  getModelCollection,
  getModelUri,
  getEntityModelRelationships,
  publishDraftModels,
  validateModelDefinitions,
  writeDraftModel,
  writeModel,
  writeModelToDatabases,
  getRefType,
  getLabelFromHubConfigByEntityType,
  getValueFromProperty,
  getValuesPropertiesOnHover,
  findModelAndPropertyReferencesInMappingRelatedSteps,
  findModelAndPropertyReferencesInMatchingMergingSteps,
  findModelAndPropertyReferencesInMappingSteps
};
