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
 * Contains functions for both implementing the default endpoint for writing records and for supporting customization of
 * a new endpoint for writing records.
 */
const consts = require("/data-hub/5/impl/consts.sjs");
const FlowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const HubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const temporal = require("/MarkLogic/temporal.xqy");

function buildHeaders(endpointConstants) {
  const headers = {};
  headers.createdOn = consts.CURRENT_DATE_TIME
  headers.createdBy = consts.CURRENT_USER

  if(endpointConstants.sourcename != null || endpointConstants.sourcetype != null){
    const sources = [];
    const source = {};
    source.name = endpointConstants.sourcename
    source.datahubSourceType = endpointConstants.sourcetype
    sources[0] = source;
    headers.sources = sources
  }

  return new FlowUtils().createHeaders({headers});
}

function buildInsertOptions(endpointConstants) {
  const userCollections = endpointConstants.collections != null ? endpointConstants.collections.split(',') : [];

  const temporalCollections = temporal.collections().toArray().reduce((acc, col) => {
    acc[col] = true;
    return acc;
  }, {});

  let temporalCollection = userCollections.find((col) => temporalCollections[col]);
  const collectionsReservedForTemporal = ['latest'];
  const collectionsToUse = temporalCollection ?
    userCollections.filter((col) => !(temporalCollections[col] || collectionsReservedForTemporal.includes(col))) :
    userCollections;

  // To ensure this endpoint can work with DHF 5.2.x, must use data-hub-operator, which is the least-privileged role in 5.2.x
  const permissions = endpointConstants.permissions != null ? endpointConstants.permissions : 'data-hub-operator,read,data-hub-operator,update'
  const permissionsArray = new HubUtils().parsePermissions(permissions);

  return {
    temporalCollection,
    options: {
      permissions: permissionsArray,
      collections: collectionsToUse,
      metadata: buildMetadata(endpointConstants)
    }
  }
}

function buildMetadata(endpointConstants) {
  const metadata = {};
  metadata.datahubCreatedByJob = endpointConstants.jobId != null ? endpointConstants.jobId : '';
  metadata.datahubCreatedBy = xdmp.getCurrentUser();
  metadata.datahubCreatedOn = fn.currentDateTime();
  return metadata;
}

/**
 * Generate an uri for an input object.
 *
 * @param uriTemplateRegEx The precompiled URI regular expression or null if not used.
 * @param record The record we want to create an URI for.
 * @param endpointConstants The input options
 * @returns A random or template generated URI based on the options.
 */
function generateUri(record, endpointConstants) {
  let uriTemplateRegEx = endpointConstants.uriTemplateRegEx;
  if ( !uriTemplateRegEx ) {
    // we cache the regex for this batch.s
    uriTemplateRegEx = endpointConstants.uritemplate ? new RegExp("{([^}]+)}", 'gi') : null;
    endpointConstants.uriTemplateRegEx = uriTemplateRegEx;
  }
  if ( uriTemplateRegEx === null ) {
    const uriPrefix = endpointConstants.uriprefix != null ? endpointConstants.uriprefix : "";
    return uriPrefix + sem.uuidString() + ".json";
  } else {
    const uriTemplate = endpointConstants.uritemplate;
    return uriTemplate.replace(uriTemplateRegEx, function (match, group) {
      return convertPropertyValueToString(record, group, uriTemplate);
    });
  }
}

/**
 * Used when replacing property references in a uriTemplate.
 *
 * @param record
 * @param propertyName
 * @param uriTemplate
 * @returns {string}
 */
function convertPropertyValueToString(record, propertyName, uriTemplate) {
  let propertyValue = record[propertyName];
  const type = typeof propertyValue;
  if (propertyValue === null) {
    throw new Error("Property '" + propertyName + "' is null, but is required by uriTemplate: " + uriTemplate);
  } else if (type === "undefined") {
    throw new Error("Property '" + propertyName + "' is undefined, but is required by uriTemplate: " + uriTemplate);
  } else if (type === "object") {
    throw new Error("Property '" + propertyName + "' is an object, but must be a scalar value as it is used in uriTemplate: " + uriTemplate);
  } else if (type === "function") {
    throw new Error("Property '" + propertyName + "' is a function, but must be a scalar value as it is used in uriTemplate: " + uriTemplate);
  }
  return String(propertyValue);
}

function normalizeInputToArray(input) {
  var inputArray;
  if (input instanceof Sequence) {
    inputArray = input.toArray().map(item => fn.head(xdmp.fromJSON(item)));
  } else if (input instanceof Document) {
    inputArray = [fn.head(xdmp.fromJSON(input))];
  } else {
    // Assumed to be an array at this point, which is the case for unit tests
    inputArray = fn.head(xdmp.fromJSON(input));
  }
  return inputArray;
}

module.exports = {
  buildHeaders,
  buildInsertOptions,
  convertPropertyValueToString,
  generateUri,
  normalizeInputToArray
}
