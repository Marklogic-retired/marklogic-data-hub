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
 * This library is intended to encapsulate all logic specific to Concept Services models.
 */

const sem = require("/MarkLogic/semantics.xqy");
const semPrefixes = {es: 'http://marklogic.com/entity-services#'};
const config = require("/com.marklogic.hub/config.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");
const hent = require("/data-hub/5/impl/hub-entities.xqy");
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");

function findDraftModelByConceptName(conceptName) {
  const assumedUri = "/concepts/" + conceptName + ".draft.concept.json";
  if (!fn.docAvailable(assumedUri)) {
    return null;
  }
  return cts.doc(assumedUri).toObject();
}

/**
 * Use this for retrieving an concept model when all you have is the name of the concept that is assumed to be the
 * "primary" concept in the model.
 *
 * @param conceptName
 * @returns {null|*}
 */
function findModelByConceptName(conceptName) {
  const assumedUri = "/concepts/" + conceptName + ".concept.json";
  if (!fn.docAvailable(assumedUri)) {
    return null;
  }
  return cts.doc(assumedUri).toObject();
}

function getConceptModelUri(conceptName) {
  return `/concepts/${xdmp.urlEncode(conceptName)}.concept.json`;
}

function getDraftConceptModelUri(conceptName) {
  return `/concepts/${xdmp.urlEncode(conceptName)}.draft.concept.json`;
}

function getDraftConceptCollection() {
  return consts.DRAFT_CONCEPT_COLLECTION;
}
function getConceptCollection() {
  return consts.CONCEPT_COLLECTION;
}

/**
 * Handles writing a draft model to both databases. Will overwrite existing permissions/collections, which is consistent
 * with how DH has been since 5.0.
 *
 * @param entityName
 * @param model
 */
function writeDraftModel(conceptName, model) {
   model.info.draft = true;
  writeConceptModelToDatabases(conceptName, model, [config.STAGINGDATABASE, config.FINALDATABASE], true);
}

/**
 * Handles writing a draft model to both databases. Will overwrite existing permissions/collections, which is consistent
 * with how DH has been since 5.0.
 *
 * @param conceptName
 * @param model
 */
function writeDraftConceptModel(conceptName, model) {
  model.info.draft = true;
  writeConceptModelToDatabases(conceptName, model, [config.STAGINGDATABASE, config.FINALDATABASE], true);
}

/**
 * Writes models to the given databases. Added to allow for the saveModels endpoint to only write to the database
 * associated with the app server by which it is invoked.
 *
 * @param entityName
 * @param model
 * @param databases
 */
function writeConceptModelToDatabases(conceptName, model, databases, isDraft = false) {
  databases = [...new Set(databases)];
  let collection, uriFunction;
  if (isDraft) {
    collection = consts.DRAFT_CONCEPT_COLLECTION;
    uriFunction = getDraftConceptModelUri;
  } else {
    collection = consts.CONCEPT_COLLECTION;
    uriFunction = getConceptModelUri;
  }

  if (conceptName) {
    validateConceptModelDefinitions(conceptName);
  }

  hubUtils.replaceLanguageWithLang(model);

  const permissions = getModelPermissions();

  databases.forEach(db => {
    // It is significantly faster to use xdmp.documentInsert due to the existence of pre and post commit triggers.
    // Using xdmp.invoke results in e.g. 20 models being saved in several seconds as opposed to well under a second
    // when calling xdmp.documentInsert directly.
    if (db === xdmp.databaseName(xdmp.database())) {
      xdmp.documentInsert(uriFunction(conceptName), model, permissions, collection);
    } else {
      hubUtils.writeDocument(uriFunction(conceptName), model, permissions, collection, db)
    }
  });
}

function publishDraftConcepts() {
  hubUtils.hubTrace(consts.TRACE_CONCEPT,`publishing in database: ${xdmp.databaseName(xdmp.database())}`);
  const draftModels = hubUtils.invokeFunction(() => cts.search(cts.collectionQuery(consts.DRAFT_CONCEPT_COLLECTION)), xdmp.databaseName(xdmp.database()));
  hubUtils.hubTrace(consts.TRACE_CONCEPT,`Publishing draft models: ${xdmp.toJsonString(draftModels)}`);
  const inMemoryModelsUpdated = {};


  for (const draftModel of draftModels) {
    let modelObject = draftModel.toObject();
    modelObject.info.draft = false;

    if(modelObject.info.draftDeleted) {
      const conceptClassName = modelObject.info.name;
      const conceptModelUri = getConceptModelUri(modelObject.info.name);
      hubUtils.hubTrace(consts.TRACE_CONCEPT,`deleting draft model: ${conceptClassName}`);
      deleteModel(modelObject.info.name);
      hubUtils.hubTrace(consts.TRACE_CONCEPT,`deleted draft model: ${conceptClassName}`);



    } else {
      // if the draft changes aren't already picked up by reference updates, add them here.
      if (!inMemoryModelsUpdated[modelObject.info.name]) {
        inMemoryModelsUpdated[modelObject.info.name] = modelObject;
      }
    }
  }
  // write all of the affected models out here
  for (const modelName in inMemoryModelsUpdated) {
    hubUtils.hubTrace(consts.TRACE_CONCEPT,`writing draft model: ${modelName}`);
    writeModel(modelName, inMemoryModelsUpdated[modelName]);
    hubUtils.hubTrace(consts.TRACE_CONCEPT,`draft model written: ${modelName}`);
  }

  const deleteDraftsOperation = () => {
    hubUtils.hubTrace(consts.TRACE_CONCEPT,"deleting draft collection");
    xdmp.collectionDelete(consts.DRAFT_CONCEPT_COLLECTION);
    hubUtils.hubTrace(consts.TRACE_CONCEPT,"deleted draft collection");
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

  cleanupConceptsFromHubCentralConfig(getConceptNames());
}


function getConceptNames() {
  return hubUtils.invokeFunction(() => cts.search(cts.collectionQuery(consts.CONCEPT_COLLECTION)), config.FINALDATABASE)
    .toArray()
    .map(conceptNode => conceptNode.toObject().info.name);
}

function cleanupConceptsFromHubCentralConfig(retainConceptNames) {
  const hubCentralConfigURI = "/config/hubCentral.json";
  const hubCentralConfig = fn.head(hubUtils.invokeFunction(() => cts.doc(hubCentralConfigURI), config.FINALDATABASE));
  if (hubCentralConfig) {
    const hubCentralConfigObj = hubCentralConfig.toObject();
    if (hubCentralConfigObj.modeling && hubCentralConfigObj.modeling.concepts) {
      let changesMade = false;
      for (let conceptName of Object.keys(hubCentralConfigObj.modeling.concepts)) {
        if (!retainConceptNames.includes(conceptName)) {
          changesMade = true;
          delete hubCentralConfigObj.modeling.concepts[conceptName];
        }
      }
      if (changesMade) {
        hubUtils.writeDocument(hubCentralConfigURI, hubCentralConfigObj, xdmp.nodePermissions(hubCentralConfig), xdmp.nodeCollections(hubCentralConfig), config.FINALDATABASE);
      }
    }
  }
}

function deleteModel(conceptName) {
  const uri = getConceptModelUri(conceptName);
  [...new Set([config.STAGINGDATABASE, config.FINALDATABASE])].forEach(db => {
    hubUtils.deleteDocument(uri, db);
  });
}

/**
 * Handles writing the model to both databases. Will overwrite existing permissions/collections, which is consistent
 * with how DH has been since 5.0.
 *
 * @param conceptName
 * @param model
 */
function writeModel(conceptName, model) {
  writeConceptModelToDatabases(conceptName, model, [config.STAGINGDATABASE, config.FINALDATABASE], false);
}

function getModelPermissions() {
  let permsString = "%%mlEntityModelPermissions%%";
  permsString = permsString.indexOf("%mlEntityModelPermissions%") > -1 ?
    "data-hub-entity-model-reader,read,data-hub-entity-model-writer,update" :
    permsString;
  return hubUtils.parsePermissions(permsString);
}

/**
 * Finds and removes the concept section in all models that refers to the supplied entityClassName in memory.
 * This allows for multiple calls in a singe transaction for publishing.
 *
 * @param conceptodelUri
 * @param conceptName
 * @param inMemoryEntityUpdated model objects stored by conceptName to allow multiple updates in a transaction
 */
function otherModelsWithConceptReferencesRemoved(entityModelUri, referencedConcept, inMemoryEntityUpdated = {}) {
  const affectedModels = new Set();
  const entityModels = entityModelsWithConceptReferenceExcludingURIs(referencedConcept, entityModelUri);
  entityModels.map(model => model.toObject())
    .forEach(model => {
      const draftUri = entityLib.getDraftModelUri(model.info.title);

      if (inMemoryEntityUpdated[model.info.title]) {
        model = inMemoryEntityUpdated[model.info.title];
      } else if ((fn.docAvailable(draftUri))) {
        model = cts.doc(draftUri).toObject();
      }

      Object.keys(model.definitions)
        .forEach(definition => {
          if(model.definitions[definition] !== undefined && model.definitions[definition].toString().length > 0) {
            if(model.definitions[definition].relatedConcepts !== undefined && model.definitions[definition].relatedConcepts.toString().length > 0) {
              const refConceptModified =  model.definitions[definition].relatedConcepts.filter(item => item["conceptClass"] !== referencedConcept);
              model.definitions[definition].relatedConcepts = refConceptModified;
              affectedModels.add(model);
            }
          }


        });
    });

  return [...affectedModels];
}

/**
 * Returns the entity model names that contain a reference to the supplied conceptClass name.
 *
 * @param referencedConcept a concept that we want to find references to
 * @param excludedURIs one or more URIs to exclude from the search
 * @returns {[]}
 */
function entityModelsWithConceptReferenceExcludingURIs(referencedConcept, excludedURIs) {
  const entityModelQuery = cts.andNotQuery(cts.andQuery([cts.collectionQuery([consts.ENTITY_MODEL_COLLECTION,consts.DRAFT_ENTITY_MODEL_COLLECTION]), cts.jsonPropertyValueQuery("conceptClass",referencedConcept)]), cts.documentQuery(excludedURIs));
  return cts.search(entityModelQuery).toArray()
}

function validateConceptModelDefinitions(conceptName) {
  const pattern = /^[a-zA-Z][a-zA-Z0-9\-_]*$/;

    if (!pattern.test(conceptName)) {
      httpUtils.throwBadRequest(`Invalid concept name: ${conceptName}; must start with a letter and can only contain letters, numbers, hyphens, and underscores.`);
    }


    if (hent.isExplorerConstraintName(conceptName)) {
      httpUtils.throwBadRequest(`${conceptName} is a reserved term and is not allowed as a concept name.`);
    }

    return conceptName;

}

/**
 * Returns the entitites names that contain a reference to the supplied concept.
 * The targetEntityType for mapping artifacts is checked against both an conceptName.
 *
 * @param conceptName
 * @returns {[]}
 */
function findConceptModelReferencesInEntities(conceptName) {
  const stepQuery = cts.andQuery([
    cts.collectionQuery('http://marklogic.com/entity-services/models'),
    cts.jsonPropertyValueQuery(["conceptClass"], [conceptName])
  ]);

  return cts.search(stepQuery).toArray().map(step => step.toObject().name);
}

function deleteDraftConceptModel(conceptName) {
  var uri = getConceptModelUri(conceptName);
  if (!fn.docAvailable(uri)) {
    uri = getDraftConceptModelUri(conceptName);
    if (!fn.docAvailable(uri)) {
      return null;
    }
  }
  const model = cts.doc(uri).toObject();
  model.info.draftDeleted = true;
  writeDraftModel(conceptName, model)
}

function findConceptReferencesInEntities(conceptName){
  const affectedModels = new Set();

  const queries = [];
  queries.push(cts.collectionQuery([entityLib.getDraftModelCollection(),entityLib.getModelCollection()]));
  queries.push(cts.jsonPropertyValueQuery("conceptClass", conceptName, "case-insensitive"));

  const entityModels = cts.search(cts.andQuery(queries)).toArray().map(entityModel => entityModel.toObject());
  const entityModelsToBeDeleted = entityModels.filter((model) => model.info.draftDeleted).map((model) => getModelName(model));
  const entityModelsDraftWithoutRelatedConcept = cts.search(cts.andNotQuery(cts.collectionQuery([entityLib.getDraftModelCollection()]),
    cts.jsonPropertyValueQuery("conceptClass", conceptName, "case-insensitive"))).toArray().map(entityModel =>getModelName(entityModel.toObject()));
  entityModels
    .filter((model) => !entityModelsDraftWithoutRelatedConcept.includes(getModelName(model)))
    .filter((model) => !entityModelsToBeDeleted.includes(getModelName(model)))
    .forEach((model) => affectedModels.add(getModelName(model)));
  return [...affectedModels];
}

function getModelName(model) {
  if (model.info) {
    return model.info.title;
  }
  return null;
}

module.exports = {
  findDraftModelByConceptName,
  findModelByConceptName,
  getDraftConceptCollection,
  getDraftConceptModelUri,
  getConceptCollection,
  getConceptModelUri,
  writeDraftConceptModel,
  writeConceptModelToDatabases,
  validateConceptModelDefinitions,
  getModelPermissions,
  deleteDraftConceptModel,
  findConceptModelReferencesInEntities,
  writeModel,
  publishDraftConcepts,
  findConceptReferencesInEntities
};
