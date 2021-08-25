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

const es = require('/MarkLogic/entity-services/entity-services');

/**
 * Invoked when DHF needs to get the entity type name and entity instance properties from a document, where the
 * entity type is not yet known.
 *
 * @param {object} doc a document-node
 * @returns {object} a JSON object containing "entityName" and "properties" if those values can be determined from the
 * document; otherwise, null
 */
function getEntityDetails(doc) {
  const jsonInstance = getInstanceAsJson(doc);

  if (jsonInstance !== null) {
    if (jsonInstance.info) {
      return getEntityDetailsFromInstanceInfo(jsonInstance);
    } else {
      // If there's no info, and only one key, assume that's the properties
      const keys = Object.keys(jsonInstance);
      if (keys.length == 1) {
        return {
          entityName: keys[0],
          properties: jsonInstance[keys[0]]
        }
      }
    }
  }

  return null;
}

/**
 *
 * @param doc a document-node
 * @returns the content under "envelope/instance" as a JSON object; if the incoming doc is an XML document, then
 * the ES library will be used to convert the XML content under "envelope/instance" into JSON
 */
function getInstanceAsJson(doc) {
  if (doc === null) {
    return null;
  }

  if (doc instanceof Element || doc instanceof XMLDocument) {
    const builder = new NodeBuilder();
    const instance = doc.xpath("/*:envelope/*:instance");
    if (!fn.empty(instance)) {
      const node = builder.startDocument().addNode(instance).endDocument().toNode();
      return fn.head(es.instanceJsonFromDocument(node)).toObject();
    }
  } else if (doc.toObject() && doc.toObject().envelope && doc.toObject().envelope.instance) {
    return doc.toObject().envelope.instance;
  }

  return null;
}

/**
 *
 * @param jsonInstance {object} expected to be the value of "instance" from an ES-style envelope
 * @returns {object} a JSON object with keys of "entityName" and "properties", or null if those cannot be determined
 * from the given JSON instance (which typically implies that the instance does not conform to ES expectations)
 */
function getEntityDetailsFromInstanceInfo(jsonInstance) {
  if (jsonInstance.info.title && jsonInstance.hasOwnProperty(jsonInstance.info.title)) {
    const title = jsonInstance.info.title;
    return {
      entityName: title,
      properties: jsonInstance[title]
    };
  } else {
    const keys = Object.keys(jsonInstance);
    if (keys.length == 2) {
      const otherKey = keys.find(val => val !== "info");
      if (otherKey) {
        return {
          entityName: otherKey,
          properties: jsonInstance[otherKey]
        };
      }
    }
  }

  return null;
}

module.exports = {
  getEntityDetails
}
