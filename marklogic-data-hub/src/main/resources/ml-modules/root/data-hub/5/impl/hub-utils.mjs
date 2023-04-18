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

const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const urisOperatedOnByTransaction = {};


function capitalize(str) {
  return (str) ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function isWriteTransaction() {
  return fn.empty(xdmp.requestTimestamp());
}

function assertUriHasNotBeenActedOn(docUri, databaseId) {
  const fullId = `${databaseId}:${docUri}`;
  const urisOperatedOn = urisOperatedOnByTransaction[xdmp.transaction()];
  if (urisOperatedOn && urisOperatedOn.has(fullId)) {
    throw new Error(`Attempting to update cts.doc('${docUri}') in database '${xdmp.databaseName(databaseId)}' multiple times in a transaction!`);
  }
  trackUriForTransaction(docUri, databaseId);
}

function trackUriForTransaction(docUri, databaseId) {
  const fullId = `${databaseId}:${docUri}`;
  const transaction = xdmp.transaction();
  if (!urisOperatedOnByTransaction[transaction]) {
    urisOperatedOnByTransaction[transaction] = new Set();
  }
  urisOperatedOnByTransaction[transaction].add(fullId);
}

function deleteDocument(docUri, database = xdmp.databaseName(xdmp.database())) {
  const dbId = xdmp.database(database);
  assertUriHasNotBeenActedOn(docUri, dbId);
 if (isWriteTransaction() && dbId === xdmp.database()) {
   xdmp.documentDelete(docUri, {ifNotExists: "allow"});
 } else {
    xdmp.invoke('/data-hub/5/impl/hub-utils/invoke-single-delete.mjs', {docUri}, {
      database: dbId,
      commit: 'auto',
      update: 'true',
      ignoreAmps: true
    });
  }
}

/**
 * @param event
 * @param message Expected to be a string; if you have JSON, call hubTraceJson
 */
function hubTrace(event, message) {
  xdmp.trace(event, `[Request:${xdmp.request()}] ${message}`);
}

/**
 * Convenience method for logging a JSON node.
 * @param event
 * @param json
 */
function hubTraceJson(event, json) {
  hubTrace(event, xdmp.toJsonString(json));
}

/**
 * @param message {string}
 */
function warn(message) {
  console.warn(`[Request:${xdmp.request()}] ${message}`);
}

/**
 * @param message {string}
 */
 function error(message, theError) {
  console.error(`[Request:${xdmp.request()}] ${message}`, theError);
}

function invokeFunction(queryFunction, database) {
  return xdmp.invokeFunction(queryFunction, {
    commit: 'auto',
    update: 'false',
    ignoreAmps: true,
    database: database ? xdmp.database(database) : xdmp.database()
  })
}

function isSequence(value) {
   return !!(value instanceof Sequence || (value && !Array.isArray(value) && typeof value.toArray === "function"));
}

function normalizeToSequence(value) {
  if (isSequence(value)) {
    return value;
  } else if (value === null || value === undefined) {
    return Sequence.from([]);
  } else if (Array.isArray(value) || isArrayNode(value)) {
    return Sequence.from(value);
  } else {
    return Sequence.from([value]);
  }
}

function normalizeToArray(value) {
  if (value == null || value == undefined) {
    return [];
  } else if (isSequence(value)) {
    return value.toArray();
  } else if (Array.isArray(value)) {
    return value;
  } else {
    return [value];
  }
}

function parsePermissions(permissionsString = "") {
  try {
    let permissionParts = permissionsString.split(",").filter((val) => val);
    let permissions = [];
    let permissionRoles = permissionParts.filter((val, index) => !(index % 2));
    let permissionCapabilities = permissionParts.filter((val, index) => index % 2);
    for (let i = 0; i < permissionRoles.length; i++) {
      permissions.push(xdmp.permission(permissionRoles[i], permissionCapabilities[i]));
    }
    return permissions;
  } catch (e) {
    throw Error("Unable to parse permissions: " + permissionsString + "; it must fit the pattern of role1,capability1,role2,capability2,etc; cause: " + e.stack);
  }
}

function documentToContentDescriptor(doc, options = {}) {
   return {
      uri: xdmp.nodeUri(doc),
      value: doc,
      context: {
        metadata: xdmp.nodeMetadata(doc),
        permissions: options.permissions ? parsePermissions(options.permissions) : xdmp.nodePermissions(doc),
        // provide original collections, should a step like to read them
        originalCollections: xdmp.nodeCollections(doc)
      }
    };
}

function documentsToContentDescriptorArray(documents, options = {}) {
  let contentArray = [];
  for (let doc of documents) {
    contentArray.push(documentToContentDescriptor(doc, options));
  }
  return contentArray;
}

function queryToContentDescriptorArray(query, options = {}, database) {
  return documentsToContentDescriptorArray(
    invokeFunction(function () {
      return cts.search(query, [cts.indexOrder(cts.uriReference()), "score-zero"], 0);
    }, database),
    options
  );
}
/**
 * This was originally addressed via DHFPROD-3193 - based on an update to ML 10.0-2, "lang" must now be used instead
 * of "language".
 *
 * @param artifact
 */
function replaceLanguageWithLang(artifact) {
  if (artifact.language) {
    artifact.lang = artifact.language;
    delete artifact.language;
  }
}

function writeDocument(docUri, content, permissions, collections, database = xdmp.databaseName(xdmp.database()), forceDifferentTransaction = false) {
  const dbId = xdmp.database(database);
  if (!forceDifferentTransaction) {
    assertUriHasNotBeenActedOn(docUri, dbId);
  }
  if (!forceDifferentTransaction && isWriteTransaction() && dbId === xdmp.database()) {
    xdmp.documentInsert(docUri, content, {permissions: permissions, collections: normalizeToArray(collections) });
    return {
      transaction: xdmp.transaction(),
      dateTime: fn.currentDateTime()
    };
  } else {
    return fn.head(xdmp.invoke('/data-hub/5/impl/hub-utils/invoke-single-write.mjs', {
      content: content,
      docUri: docUri,
      permissions: permissions,
      collections: normalizeToArray(collections)
    }, {
      database: dbId,
      commit: 'auto',
      update: 'true',
      ignoreAmps: false
    }));
  }
}

function nodeReplace(originalNode, newNode) {
  const dbId = xdmp.database();
  assertUriHasNotBeenActedOn(xdmp.nodeUri(originalNode), dbId);
  if (isWriteTransaction()) {
    xdmp.nodeReplace(originalNode, newNode);
  } else {
    const xpath = xdmp.path(originalNode, true);
    xdmp.invokeFunction(() => {
      const replaceNode = xdmp.unpath(xpath);
      xdmp.nodeReplace(replaceNode, newNode);
    }, {
      commit: 'auto',
      update: 'true',
      ignoreAmps: false
    });
  }
}

/**
 * ML 9 does not support Object.values(). This function serves as its replacement so that datahub can be supported in ML 9
 * @param object
 * @returns  an array of a given object's property values
 */
function getObjectValues(object){
    let valuesArray = [];
    for (const property in object) {
      valuesArray.push(object[property]);
    }
    return valuesArray;
}

function evalInDatabase(script, database) {
  return xdmp.eval(script, null, {database: xdmp.database(database)})
}


function getErrorMessage(e) {
  let errorMessage = e.message;
  if (e.data != null && e.data.length > 0) {
    if(isNaN(Number(e.data[0]))){
      errorMessage += ": " + e.data[0];
    }
    else if(e.data.length > 1){
      errorMessage += ": " + e.data[1];
    }
  }
  return errorMessage;
}

const cachedModules = {};

function requireFunction(modulePath, functionName) {
  if (!cachedModules[modulePath]) {
    if (fn.endsWith(modulePath, ".mjs")) {
      cachedModules[modulePath] = mjsProxy.requireMjsModule(modulePath);
    } else {
      xdmp.eval(`const lib = require("${modulePath}");`, {}, {staticCheck: true});
      cachedModules[modulePath] = require(modulePath);
    }
  }
  const fun = cachedModules[modulePath][functionName];
  if (!fun) {
    fn.error(xs.QName("XDMP-UNDFUN"), "XDMP-UNDFUN", [`${functionName}()`]);
  }
  return fun;
}

// node check functions
function isNode(value) {
  return value instanceof Node || value && value.nodeKind;
}
function isXmlNode(value) {
  return value instanceof XMLNode || (isNode(value) && (isElementNode(value) || isXmlDocument(value)));
}

function isXmlDocument(value) {
  return value instanceof XMLDocument || (isDocumentNode(value) && isXmlNode(value.root));
}

function isDocumentNode(value) {
  return value instanceof Document || (isNode(value) && value.nodeKind === "document");
}

function isBinaryNode(value) {
  return value instanceof BinaryNode || ((isNode(value) && value.nodeKind === "binary") || isDocumentNode(value) && isBinaryNode(value.root));
}

function isTextNode(value) {
  return value instanceof Text || ((isNode(value) && value.nodeKind === "text") || isDocumentNode(value) && isTextNode(value.root));
}
function isElementNode(value) {
  return value instanceof Element || (isNode(value) && value.nodeKind === "element");
}

function isJsonNode(value) {
  return isObjectNode(value) || isArrayNode(value);
}
function isJsonDocument(value) {
  return isDocumentNode(value) && isJsonNode(value.root);
}

function isObjectNode(value) {
  return value instanceof ObjectNode || (isNode(value) && value.nodeKind === "object");
}

function isArrayNode(value) {
  return value instanceof ArrayNode || (isNode(value) && value.nodeKind === "array");
}

export default {
  capitalize,
  deleteDocument,
  documentsToContentDescriptorArray,
  documentToContentDescriptor,
  error,
  evalInDatabase: import.meta.amp(evalInDatabase),
  getErrorMessage,
  getObjectValues,
  hubTrace,
  hubTraceJson,
  invokeFunction,
  normalizeToArray,
  normalizeToSequence,
  parsePermissions,
  queryToContentDescriptorArray,
  replaceLanguageWithLang,
  requireFunction: import.meta.amp(requireFunction),
  warn,
  writeDocument,
  isNode,
  isElementNode,
  isArrayNode,
  isBinaryNode,
  isTextNode,
  isDocumentNode,
  isJsonDocument,
  isObjectNode,
  isJsonNode,
  isXmlDocument,
  isXmlNode,
  isSequence,
  isWriteTransaction,
  nodeReplace
};
