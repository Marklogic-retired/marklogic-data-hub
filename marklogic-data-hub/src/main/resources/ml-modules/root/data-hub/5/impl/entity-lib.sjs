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
  const entityModelQuery = cts.andNotQuery(cts.andQuery([cts.collectionQuery([getModelCollection(),getDraftModelCollection()]), cts.jsonPropertyValueQuery("$ref",referencedEntity)]), cts.documentQuery(excludedURIs));
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
  entityModels
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
              if (properties[property]["$ref"] === entityTypeId || (properties[property]["datatype"] === "array" && properties[property]["items"]["$ref"] === entityTypeId)) {
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

function publishDraftModels() {
  hubUtils.hubTrace(consts.TRACE_ENTITY,`publishing in database: ${xdmp.databaseName(xdmp.database())}`);
  const draftModels = hubUtils.invokeFunction(() => cts.search(cts.collectionQuery(consts.DRAFT_ENTITY_MODEL_COLLECTION)), xdmp.databaseName(xdmp.database()));
  hubUtils.hubTrace(consts.TRACE_ENTITY,`Publishing draft models: ${xdmp.toJsonString(draftModels)}`);
  const inMemoryModelsUpdated = {};
  const urisOfModelsBeingDeleted = draftModels.toArray()
    .map((model) => model.toObject())
    .filter((modelObject) => modelObject.info.draftDeleted)
    .map((modelObject) => getModelUri(modelObject.info.title));
  for (const draftModel of draftModels) {
    let modelObject = draftModel.toObject();

    modelObject.info.draft = false;

    if(modelObject.info.draftDeleted) {
      const entityTypeId = getEntityTypeId(modelObject, modelObject.info.title);
      const entityModelUri = getModelUri(modelObject.info.title);

      hubUtils.hubTrace(consts.TRACE_ENTITY,`deleting draft model: ${modelObject.info.title}`);
      deleteModel(modelObject.info.title);
      hubUtils.hubTrace(consts.TRACE_ENTITY,`deleted draft model: ${modelObject.info.title}`);

      hubUtils.hubTrace(consts.TRACE_ENTITY,`deleting draft model references: ${modelObject.info.title}`);
      const entityURIsToIgnore = urisOfModelsBeingDeleted.concat([entityModelUri]);
      // update models in memory with necessary reference updates
      otherModelsWithModelReferencesRemoved(entityURIsToIgnore, entityTypeId, inMemoryModelsUpdated).forEach((model) => {
        inMemoryModelsUpdated[model.info.title] = model;
      });
      hubUtils.hubTrace(consts.TRACE_ENTITY,`deleted draft model references: ${modelObject.info.title}`);
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
  getLatestJobData,
  getModelCollection,
  getModelUri,
  publishDraftModels,
  validateModelDefinitions,
  writeDraftModel,
  writeModel,
  writeModelToDatabases
};
