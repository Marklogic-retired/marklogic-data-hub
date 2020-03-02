/**
 Copyright 2012-2019 MarkLogic Corporation

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
  for (var doc of cts.search(cts.collectionQuery("http://marklogic.com/entity-services/models"))) {
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
      cts.collectionQuery('http://marklogic.com/entity-services/models'),
      cts.tripleRangeQuery(sem.iri(entityTypeId), sem.curieExpand("rdf:type"), sem.curieExpand("es:EntityType", semPrefixes))
    ])));
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

module.exports = {
  findEntityTypeIds,
  findEntityType,
  findEntityTypesAsMap,
  findModelForEntityTypeId,
  getEntityTypeId,
  getEntityTypeIdParts
};
