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

const sem = require("/MarkLogic/semantics.xqy");
const semPrefixes = {es: 'http://marklogic.com/entity-services#'};

/**
 * @return an array of strings, one for each EntityType
 */
function findEntityIRIs() {
  return cts.triples(null,
    sem.iri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    sem.iri('http://marklogic.com/entity-services#EntityType'), '='
  ).toArray().map(triple => sem.tripleSubject(triple).toString());
}

/**
 * @return a map object where each key is an entity IRI, and the value of each key is the corresponding entity type
 */
function findEntityTypesAsMap() {
  const map = {};
  for (var doc of cts.search(cts.collectionQuery("http://marklogic.com/entity-services/models"))) {
    Object.assign(map, convertModelToEntityIRIMap(doc.toObject()));
  }
  return map;
}

/**
 * @param entityIRI string or a sem.iri
 * @return the matching model document, or null if one is not found
 */
function findModelForEntityIRI(entityIRI) {
  return fn.head(cts.search(
    cts.andQuery([
      cts.collectionQuery('http://marklogic.com/entity-services/models'),
      cts.tripleRangeQuery(sem.iri(entityIRI), sem.curieExpand("rdf:type"), sem.curieExpand("es:EntityType", semPrefixes), "=")
    ])));
}

/**
 * @param entityIRI string or a sem.iri
 * @return null if a model can't be found matching the given IRI, or if a model is found but there's no an entity type
 * with a title matching the entity title in the IRI. Otherwise, the entity type from the definitions array in the model
 * is returned.
 */
function findEntityType(entityIRI) {
  const modelDoc = findModelForEntityIRI(entityIRI);
  if (!modelDoc) {
    return null;
  }

  const parts = getEntityIRIParts(entityIRI);
  const entityTitle = parts.entityTitle;
  return modelDoc.toObject().definitions[entityTitle];
}

/**
 * @param entityIRI sem.iri or string
 * @return {{entityTitle: string, baseUri: string, modelTitle: string, version: string}}
 */
function getEntityIRIParts(entityIRI) {
  if (entityIRI == null) {
    throw Error("Cannot get entity IRI parts from null IRI");
  }

  entityIRI = entityIRI.toString();

  const tokens = entityIRI.split("/");
  if (tokens.length < 3) {
    throw Error("Could not get entity IRI parts from invalid IRI: " + entityIRI);
  }

  const infoTokens = tokens[tokens.length - 2].split("-");
  if (infoTokens.length < 2) {
    throw Error("Could not get entity IRI parts; expected info part did not contain a hyphen; IRI: " + entityIRI);
  }

  const title = tokens[tokens.length - 1];
  const baseUri = tokens.slice(0, tokens.length - 2).join("/") + "/";
  return {
    baseUri: baseUri,
    modelTitle: infoTokens[0],
    version: infoTokens[1],
    entityTitle: title
  };
}

/**
 * @param model the model object as found in a model descriptor
 * @param entityTitle a string identifying the entity type in the definitions array that an IRI is needed for
 * @return {string}
 */
function getEntityIRI(model, entityTitle) {
  return getModelIRI(model) + "/" + entityTitle;
}

function convertModelToEntityIRIMap(model) {
  const map = {};
  const modelIRI = getModelIRI(model);
  for (var entityTitle of Object.keys(model.definitions)) {
    map[modelIRI + "/" + entityTitle] = model.definitions[entityTitle];
  }
  return map;
}

function getModelIRI(model) {
  const info = model.info;
  const baseUri = info.baseUri || "http://example.org/";
  return baseUri + info.title + "-" + info.version;
}

module.exports = {
  findEntityIRIs,
  findEntityType,
  findEntityTypesAsMap,
  findModelForEntityIRI,
  getEntityIRI,
  getEntityIRIParts
};
