/**
 Copyright (c) 2020 MarkLogic Corporation

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

const DataHubSingleton = require('/data-hub/5/datahub-singleton.sjs');
const sem = require("/MarkLogic/semantics.xqy");
const semPrefixes = {es: 'http://marklogic.com/entity-services#'};
const consts = require("/data-hub/5/impl/consts.sjs");

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
  const uri = entityLib.getModelUri(entityName);
  if (!fn.docAvailable(uri)) {
    return null;
  }
  return cts.doc(uri).toObject().definitions[entityName];
}

function getModelUri(entityName) {
  return "/entities/" + xdmp.urlEncode(entityName) + ".entity.json";
}

function getModelCollection() {
  return "http://marklogic.com/entity-services/models";
}

function deleteModel(entityName) {
  const uri = getModelUri(entityName);
  if (fn.docAvailable(uri)) {
    const dataHub = DataHubSingleton.instance();
    [dataHub.config.STAGINGDATABASE, dataHub.config.FINALDATABASE].forEach(db => {
      dataHub.hubUtils.deleteDocument(uri, db);
    });
  }
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
 * @param entityModelUri
 * @param entityTypeId
 * @returns {[]}
 */
function findModelReferencesInOtherModels(entityModelUri, entityTypeId) {
  const affectedModels = new Set();
  const entityModelQuery = cts.andNotQuery(cts.collectionQuery(consts.ENTITY_MODEL_COLLECTION), cts.documentQuery(entityModelUri));
  const entityModels = cts.search(entityModelQuery).toArray();
  entityModels.map(model => model.toObject())
    .forEach(model => {
      Object.keys(model.definitions)
        .forEach(definition => {
          const properties = model.definitions[definition].properties;
          Object.keys(properties)
            .some(property => {
              if (properties[property]["$ref"] === entityTypeId || (properties[property]["datatype"] === "array" && properties[property]["items"]["$ref"] === entityTypeId)) {
                affectedModels.add(getModelName(model));
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
  const affectedModels = new Set();
  const entityModelQuery = cts.andNotQuery(cts.collectionQuery(consts.ENTITY_MODEL_COLLECTION), cts.documentQuery(entityModelUri));
  const entityModels = cts.search(entityModelQuery).toArray();
  entityModels.map(model => model.toObject())
    .forEach(model => {
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

  const dataHub = DataHubSingleton.instance();
  const permissions = getModelPermissions();

  // This does not reuse writeModel because we do not want to hit the xdmp.documentInsert line. This requires the
  // deleteModel.sjs endpoint to then have declareUpdate. But when that is added, the call to deleteDocument then hangs.
  const databases = [dataHub.config.STAGINGDATABASE, dataHub.config.FINALDATABASE];
  [...affectedModels].forEach(model => {
    databases.forEach(db => {
      const entityName = getModelName(model);
      dataHub.hubUtils.writeDocument(entityLib.getModelUri(entityName), model, permissions, getModelCollection(), db)
    });
  });
}

/**
 * Handles writing the model to both databases. Will overwrite existing permissions/collections, which is consistent
 * with how DH has been since 5.0.
 *
 * @param entityName
 * @param model
 */
function writeModel(entityName, model) {
  const dataHub = DataHubSingleton.instance();
  writeModelToDatabases(entityName, model, [dataHub.config.STAGINGDATABASE, dataHub.config.FINALDATABASE]);
}

/**
 * Writes models to the given databases. Added to allow for the saveModels endpoint to only write to the database
 * associated with the app server by which it is invoked.
 *
 * @param entityName
 * @param model
 * @param databases
 */
function writeModelToDatabases(entityName, model, databases) {
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

  const dataHub = DataHubSingleton.instance();

  dataHub.hubUtils.replaceLanguageWithLang(model);

  const permissions = getModelPermissions();

  databases.forEach(db => {
    // It is significantly faster to use xdmp.documentInsert due to the existence of pre and post commit triggers.
    // Using xdmp.invoke results in e.g. 20 models being saved in several seconds as opposed to well under a second
    // when calling xdmp.documentInsert directly.
    if (db === xdmp.databaseName(xdmp.database())) {
      xdmp.documentInsert(entityLib.getModelUri(entityName), model, permissions, getModelCollection());
    } else {
      dataHub.hubUtils.writeDocument(entityLib.getModelUri(entityName), model, permissions, getModelCollection(), db)
    }
  });
}

function getModelPermissions() {
  const dataHub = DataHubSingleton.instance();

  let permsString = "%%mlEntityModelPermissions%%";
  permsString = permsString.indexOf("%mlEntityModelPermissions%") > -1 ?
    "data-hub-entity-model-reader,read,data-hub-entity-model-writer,update" :
    permsString;
  return dataHub.hubUtils.parsePermissions(permsString);
}

function validateModelDefinitions(definitions) {
  const pattern = /^[a-zA-Z][a-zA-Z0-9\-_]*$/;
  Object.keys(definitions).forEach(entityName => {
    if (!pattern.test(entityName)) {
      throw new Error(`Invalid entity name: ${entityName}; must start with a letter and can only contain letters, numbers, hyphens, and underscores.`);
    }
    if (definitions[entityName].properties) {
      Object.keys(definitions[entityName].properties).forEach(propertyName => {
        if (!pattern.test(propertyName)) {
          throw new Error(`Invalid property name: ${propertyName}; must start with a letter and can only contain letters, numbers, hyphens, and underscores.`);
        }
      });
    }
    return entityName;
  });
}

module.exports = {
  deleteModel,
  findModelReferencesInSteps,
  findModelReferencesInOtherModels,
  deleteModelReferencesInOtherModels,
  findEntityType,
  findEntityTypeByEntityName,
  findEntityTypeIds,
  findEntityTypesAsMap,
  findModelByEntityName,
  findModelForEntityTypeId,
  getEntityTypeId,
  getEntityTypeIdParts,
  getLatestJobData,
  getModelCollection,
  getModelUri,
  validateModelDefinitions,
  writeModel,
  writeModelToDatabases
};
