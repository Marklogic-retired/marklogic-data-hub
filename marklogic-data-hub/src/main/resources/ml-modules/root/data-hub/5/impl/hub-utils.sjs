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
const cachedModules = {};
const consts = require("/data-hub/5/impl/consts.sjs");

class HubUtils {

  constructor(config = null) {
    if(!config) {
      config = require("/com.marklogic.hub/config.sjs");
    }
    this.config = config;
    this.ampersandRegex = new RegExp('&', 'g');
    this.aposRegex = new RegExp('\'', 'g');
    this.quoteRegex = new RegExp('"', 'g');
  }

  getConfig() {
    return this.config;
  }

  writeDocument(docUri, content, permissions, collections, database) {
    return fn.head(xdmp.invoke('/data-hub/5/impl/hub-utils/invoke-single-write.sjs',
    {
    content: content,
    docUri:docUri,
    permissions:permissions,
    collections: this.normalizeToArray(collections)
    },
    {
     database: xdmp.database(database),
     commit: 'auto',
     update: 'true',
     ignoreAmps: false
    }));
  }

  /**
   * @param writeQueue
   * @param permissions
   * @param collections
   * @param database
   * @return An object consisting of two properties - "transaction" and "dateTime"
   */
  writeDocuments(writeQueue, permissions = xdmp.defaultPermissions(), collections = [], database = xdmp.databaseName(xdmp.database())){
    return fn.head(xdmp.invoke('/data-hub/5/impl/hub-utils/invoke-queue-write.sjs',
      {
        writeQueue,
        permissions,
        baseCollections: collections || []
      },
      {
        database: xdmp.database(database),
        commit: 'auto',
        update: 'true',
        ignoreAmps: true
      }));
  }

  updateNodePath(docURI, xpath, newNode, database = xdmp.databaseName(xdmp.database())){
    return fn.head(xdmp.invoke('/data-hub/5/impl/hub-utils/invoke-update-node-path.sjs',
      {
        docURI, xpath, newNode
      },
      {
        database: xdmp.database(database),
        commit: 'auto',
        update: 'true',
        ignoreAmps: true
      }));
  }

  deleteDocument(docUri, database){
    xdmp.invoke('/data-hub/5/impl/hub-utils/invoke-single-delete.sjs',
    {
      docUri
    },
    {
      database: xdmp.database(database),
      commit: 'auto',
      update: 'true',
      ignoreAmps: true
    })
  }

  queryLatest(queryFunction, database) {
    return xdmp.invokeFunction(queryFunction, { commit: 'auto', update: 'false', ignoreAmps: true, database: database ? xdmp.database(database): xdmp.database()})
  }

  queryToContentDescriptorArray(query, options = {}, database) {
    let hubUtils = this;
    let content = [];
    this.queryLatest(function () {
      let results = cts.search(query, cts.indexOrder(cts.uriReference()));

      // Option for limiting the number of results that are processed. Needed for the Data Services
      // endpoint, but could be used by the REST endpoint as well.
      if (options.contentDescriptorLimit) {
        results = fn.subsequence(results, 1, options.contentDescriptorLimit);
      }

      for (let doc of results) {
        content.push({
          uri: xdmp.nodeUri(doc),
          value: doc,
          context: {
            permissions: options.permissions ? hubUtils.parsePermissions(options.permissions) : xdmp.nodePermissions(doc),
            metadata: xdmp.nodeMetadata(doc),
            // provide original collections, should a step like to read them
            originalCollections: xdmp.nodeCollections(doc)
          }
        });
      }
    }, database);
    return content;
  }

  invoke(moduleUri, parameters, user = null, database) {
    let options = this.buildInvokeOptions(user, database);
    xdmp.invoke(moduleUri, parameters, options)
  }

  buildInvokeOptions(user = null, database) {
    let options = {
      ignoreAmps: true
    };

    if (user && user !== xdmp.getCurrentUser()) {
      options.userId = xdmp.user(user);
    }

    if (database) {
      options.database = xdmp.database(database);
    }

    return options;
  }

  /**
  * Generate and return a UUID
  */
  uuid() {
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;

      if (i == 8 || i == 12 || i == 16 || i == 20) {
        uuid += "-"
      }
      uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  }

  /**
  * Capitalize first letter of a string
  */
 capitalize(str) {
  return (str) ? str.charAt(0).toUpperCase() + str.slice(1) : str;
 }

 retrieveModuleLibrary(moduleLibraryURI) {
   if (!cachedModules[moduleLibraryURI]) {
     cachedModules[moduleLibraryURI] = require(moduleLibraryURI);
   }
   return cachedModules[moduleLibraryURI];
 }

  normalizeToSequence(value) {
   if (value instanceof Sequence) {
     return value;
   } else if (value === null || value === undefined) {
     return Sequence.from([]);
   } else if (value.constructor === Array || (value instanceof Node && xdmp.nodeKind(value) === 'array')) {
     return Sequence.from(value);
   } else {
     return Sequence.from([value]);
   }
 }

  normalizeToArray(value) {
    if (value instanceof Sequence) {
      return value.toArray();
    } else if (Array.isArray(value)) {
      return value;
    } else {
      return [value];
    }
  }

  cloneInstance(instance) {
     let prototype = Object.getPrototypeOf(instance);
     let keys = Object.getOwnPropertyNames(instance).concat(Object.getOwnPropertyNames(prototype));
     let newInstance = {};
     for (let key of keys) {
       newInstance[key] = instance[key];
     }
     return newInstance;
  }

  parsePermissions(permissionsString = "") {
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

  // this function can be used to create xquery/xpath templates that are safe from injection attacks
  xquerySanitizer(strings, ...values) {
    const parts = [];
    let counter = 0;
    for (const string of strings) {
      parts.push(string);
      if (values[counter] != undefined) {
        parts.push(
          String(values[counter++])
            .replace(this.ampersandRegex, '&amp;')
            .replace(this.aposRegex, '&apos;')
            .replace(this.quoteRegex, '&quot;'));
      }
    }
    return parts.join('');
  }

  /**
   * This was originally addressed via DHFPROD-3193 - based on an update to ML 10.0-2, "lang" must now be used instead
   * of "language".
   *
   * @param artifact
   */
  replaceLanguageWithLang(artifact) {
    if (artifact.language) {
      artifact.lang = artifact.language;
      delete artifact.language;
    }
  }
}

module.exports = HubUtils;
