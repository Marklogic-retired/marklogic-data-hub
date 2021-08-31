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
const sem = require("/MarkLogic/semantics.xqy");
const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const hent = require("/data-hub/5/impl/hub-entities.xqy");
const ext = require("/data-hub/extensions/entity/post-process-database-properties.sjs");

/**
 * Generates database properties based on the given entity models. This starts with the ES database-properties-generate
 * function, then applies a significant amount of DHF logic to the properties, and then calls an extension point to allow
 * a user to further modify them.
 *
 * @param {array} entityModels
 * @returns {object} a document-node wrapping a JSON object containing the database properties
 */
function generateDatabaseProperties(entityModels)
{
  const dbProps = hent.dumpIndexes(entityModels);
  return ext.postProcessDatabaseProperties(dbProps);
};

/**
 * @param entityIRI
 * @param propertyPath
 * @returns an object with properties "pathExpression" and "namespaces" that can then be used to build a
 * cts.pathReference. Does not actually build one to make life easier on the tests, which can then test the construction
 * of the path and namespaces without depending on a path range index existing.
 */
function buildPathReferenceParts(entityIRI, propertyPath) {
  // In case of structured properties the range path is already built and is separated by "."
  const pathAlreadyBuilt = propertyPath.includes(".");
  propertyPath = pathAlreadyBuilt ? propertyPath.replace(/\./g, "/") : propertyPath;
  let properties = propertyPath.split("/");
  let finalPath = "";

  const namespaceMap = {
    "es": "http://marklogic.com/entity-services"
  };

  for (let i = 0; i < properties.length; i++) {
    // In case of structured properties we skip the structured property name and only use the property inside the structured property
    let property = i !== 0 && pathAlreadyBuilt ? properties[++i] : properties[i];
    let model = getEntityDefinitionFromIRI(entityIRI);
    let entityInfo = getEntityInfoFromIRI(entityIRI);
    let entityDef = model.definitions[entityInfo.entityName];
    let prop = entityDef.properties[property];
    if (!prop) {
      throw Error('Unable to build path for range index; the property ' + property + ' does not exist');
    }

    const entityDefHasNamespace = entityDef.namespace && entityDef.namespacePrefix;
    if ("" === finalPath) {
      finalPath = entityDefHasNamespace ? "/es:envelope/es:instance" : "/(es:envelope|envelope)/(es:instance|instance)";
    }

    if (entityDefHasNamespace) {
      const ns = entityDef.namespacePrefix;
      finalPath += `/${ns}:${entityInfo.entityName}/${ns}:${property}`;
      namespaceMap[entityDef.namespacePrefix] = entityDef.namespace;
    } else {
      finalPath += `/${entityInfo.entityName}/${property}`;
    }
    entityIRI = getRefEntityIdentifiers(entityIRI, entityInfo, prop).entityIRI;
  }

  // Returning an object so that application clients can build a cts.pathReference from this, but the existing tests
  // still have an easy way to verify the path expression and don't have to require that a path reference exists
  return {
    pathExpression: finalPath,
    namespaces: namespaceMap
  };
}

function getPropertyReferenceType(entityIRI, propertyPath) {
  let properties = propertyPath.split("/");
  let model = null;

  for (let property of properties) {
    try {
      model = getEntityDefinitionFromIRI(entityIRI);
    } catch (err) {
      throw Error('The property ' + property + ' is either not indexed or do not exist');
    }
    let entityInfo = getEntityInfoFromIRI(entityIRI);

    let prop = model.definitions[entityInfo.entityName].rangeIndex;
    if (prop && prop.includes(property)) {
      return "path";
    }

    prop = model.definitions[entityInfo.entityName].elementRangeIndex;
    if (prop && prop.includes(property)) {
      return "element";
    }

    prop = model.definitions[entityInfo.entityName].properties[property];
    if (!prop) {
      throw Error('The property ' + property + ' do not exist');
    }
    entityIRI = getRefEntityIdentifiers(entityIRI, entityInfo, prop).entityIRI;
  }
}

function getEntityDefinitionFromIRI(entityIRI) {
  let model = fn.head(cts.search(
    cts.tripleRangeQuery(sem.iri(entityIRI), sem.iri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), sem.iri('http://marklogic.com/entity-services#EntityType'), '=')
  ));
  if (!model) {
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
  let modelInfo = entityIRIArr[entityIRIArr.length - 2].split("-");

  entityInfo.modelName = modelInfo[0];
  entityInfo.version = modelInfo[1];
  entityInfo.baseUri = entityIRI.split(entityIRIArr[entityIRIArr.length - 2])[0];
  entityInfo.entityName = entityIRIArr[entityIRIArr.length - 1];

  return entityInfo;
}

function getRefEntityIdentifiers(entityIRI, entityInfo, prop) {
  let refEntityId = {
    "entityIRI": null,
    "entityName": null
  };
  let ref = null;
  let refArr = null;

  if (prop["$ref"]) {
    ref = prop["$ref"];
    refArr = ref.split("/");
  }

  if (prop.items && prop.items["$ref"]) {
    ref = prop.items["$ref"];
    refArr = ref.split("/");
  }

  if (refArr) {
    refEntityId.entityName = refArr[refArr.length - 1];
    if (ref.startsWith("#/definitions")) {
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

/**
 * This mimics the response of es.piiGenerate, but with altered path expressions.
 */
function generateProtectedPathConfig(models) {
  const response = {
    "lang": "zxx",
    "name": "-",
    "config": {
      "protected-path": [],
      "query-roleset": {
        "role-name": ["pii-reader"]
      }
    }
  };

  models.forEach(model => {
    if (model.definitions) {
      Object.keys(model.definitions).forEach(entityName => {
        const entityDef = model.definitions[entityName];
        if (entityDef.pii && Array.isArray(entityDef.pii)) {
          const namespace = entityDef.namespace;
          const namespacePrefix = entityDef.namespacePrefix;

          entityDef.pii.forEach(propertyName => {
            const expression = (namespace && namespacePrefix) ?
              "/es:envelope/es:instance/" + namespacePrefix + ":" + entityName + "/" + namespacePrefix + ":" + propertyName :
              "/(es:envelope|envelope)/(es:instance|instance)/" + entityName + "/" + propertyName;

            const protectedPath = {
              "path-expression": expression,
              "path-namespace": [
                {
                  "prefix": "es",
                  "namespace-uri": "http://marklogic.com/entity-services"
                }
              ],
              "permission": {
                "role-name": "pii-reader",
                "capability": "read"
              }
            };

            if (namespace && namespacePrefix) {
              protectedPath["path-namespace"].push(
                {
                  "prefix": namespacePrefix,
                  "namespace-uri": namespace
                }
              );
            }

            response.config["protected-path"].push(protectedPath);
          });
        }
      });
    }
  });

  return response;
}

function getEntityInfoFromRecord(record) {
  if (record instanceof Node) {
    const infoNode = fn.head(record.xpath("/*:envelope/*:instance/*:info"));
    if (infoNode) {
      return (infoNode instanceof ObjectNode) ? infoNode.toObject() : {
        title: fn.string(infoNode.xpath("./*:title")),
        version: fn.string(infoNode.xpath("./*:version"))
      };
    } else {
      return null;
    }
  }
  return record.envelope && record.envelope.instance && record.envelope.instance.info;
}

module.exports = {
  buildPathReferenceParts,
  findEntityServiceTitle,
  generateDatabaseProperties,
  generateProtectedPathConfig,
  getEntityDefinitionFromIRI,
  getEntityInfoFromRecord,
  getPropertyReferenceType
};
