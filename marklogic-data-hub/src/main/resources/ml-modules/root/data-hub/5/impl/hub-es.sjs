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
const sem = require("/MarkLogic/semantics.xqy");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");

function getPropertyRangePath(entityIRI, propertyPath) {
  let properties = propertyPath.split("/");
  let finalPath = "//*:instance";
  for(let property of properties) {
    let model = getEntityDefinitionFromIRI(entityIRI);
    let entityInfo = getEntityInfoFromIRI(entityIRI);
    let prop = model.definitions[entityInfo.entityName].properties[property];
    if(!prop) {
      throw Error('The property ' + property + ' do not exist');
    }
    finalPath += "/" + entityInfo.entityName + "/" + property;
    entityIRI = getRefEntityIdentifiers(entityIRI, entityInfo, prop).entityIRI;
  }
  return finalPath;
}

function getPropertyReferenceType(entityIRI, propertyPath) {
  let properties = propertyPath.split("/");
  let model = null;

  for(let property of properties) {
    try {
      model = getEntityDefinitionFromIRI(entityIRI);
    } catch(err) {
      throw Error('The property ' + property + ' is either not indexed or do not exist');
    }
    let entityInfo = getEntityInfoFromIRI(entityIRI);

    let prop = model.definitions[entityInfo.entityName].rangeIndex;
    if(prop && prop.includes(property)) {
      return "path";
    }

    prop = model.definitions[entityInfo.entityName].elementRangeIndex;
    if(prop && prop.includes(property)) {
      return "element";
    }

    prop = model.definitions[entityInfo.entityName].properties[property];
    if(!prop) {
      throw Error('The property ' + property + ' do not exist');
    }
    entityIRI = getRefEntityIdentifiers(entityIRI, entityInfo, prop).entityIRI;
  }
}

function getEntityDefinitionFromIRI(entityIRI) {
  let model = fn.head(cts.search(
      cts.tripleRangeQuery(sem.iri(entityIRI), sem.iri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), sem.iri('http://marklogic.com/entity-services#EntityType'), '=')
  ));
  if(!model) {
    throw Error('The entity model ' + entityIRI + ' does not exist');
  }
  return model.toObject();
}

function getEntityInfoFromIRI(entityIRI) {
  let entityInfo = {
    "baseUri": null,
    "modelName": null,
    "version": null,
    "entityName": null
  };

  let entityIRIArr = entityIRI.split("/");
  let modelInfo = entityIRIArr[entityIRIArr.length-2].split("-");

  entityInfo.modelName = modelInfo[0];
  entityInfo.version = modelInfo[1];
  entityInfo.baseUri = entityIRI.split(entityIRIArr[entityIRIArr.length-2])[0];
  entityInfo.entityName = entityIRIArr[entityIRIArr.length-1];

  return entityInfo;
}

function getRefEntityIdentifiers(entityIRI, entityInfo, prop) {
  let refEntityId = {
    "entityIRI": null,
    "entityName": null
  };
  let ref = null;
  let refArr = null;

  if(prop["$ref"]) {
    ref = prop["$ref"];
    refArr = ref.split("/");
  }

  if(prop.items && prop.items["$ref"]) {
    ref = prop.items["$ref"];
    refArr = ref.split("/");
  }

  if(refArr) {
    refEntityId.entityName = refArr[refArr.length - 1];
    if(ref.startsWith("#/definitions")) {
      refEntityId.entityIRI = entityInfo.baseUri + entityInfo.modelName + "-" + entityInfo.version + "/" + refEntityId.entityName;
    } else {
      refEntityId.entityIRI = ref;
    }
  }
  return refEntityId;
}

const cachedEntityTitles = {};

function findEntityServiceTitle(iri) {
  // casting as string since we may receive sem.iri
  const cacheKey = String(iri);
  if (cachedEntityTitles[cacheKey] === undefined) {
    if (!(iri instanceof sem.iri)) {
      iri = sem.iri(iri);
    }
    const triple = fn.head(cts.triples(iri,
        sem.iri('http://marklogic.com/entity-services#title'),
        null,
        '=', ['concurrent'], cts.collectionQuery(entityLib.getModelCollection())));
    if (fn.empty(triple)) {
      cachedEntityTitles[cacheKey] = null;
    } else {
      cachedEntityTitles[cacheKey] = sem.tripleObject(triple);
    }
  }
  return cachedEntityTitles[cacheKey];
}

module.exports = {
  getPropertyRangePath: getPropertyRangePath,
  getPropertyReferenceType: getPropertyReferenceType,
  getEntityDefinitionFromIRI: getEntityDefinitionFromIRI,
  findEntityServiceTitle: findEntityServiceTitle
};
