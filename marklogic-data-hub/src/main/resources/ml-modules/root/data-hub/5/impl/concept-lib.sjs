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




function getConceptModelUri(entityName) {
  return `/concepts/${xdmp.urlEncode(entityName)}.concept.json`;
}

function getDraftConceptModelUri(entityName) {
  return `/concepts/${xdmp.urlEncode(entityName)}.draft.concept.json`;
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

function getModelPermissions() {
  let permsString = "%%mlEntityModelPermissions%%";
  permsString = permsString.indexOf("%mlEntityModelPermissions%") > -1 ?
    "data-hub-entity-model-reader,read,data-hub-entity-model-writer,update" :
    permsString;
  return hubUtils.parsePermissions(permsString);
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
  findConceptModelReferencesInEntities
};
