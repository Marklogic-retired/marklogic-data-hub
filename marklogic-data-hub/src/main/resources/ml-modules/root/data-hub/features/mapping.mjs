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
 * Feature that handles the mapping transformation of the artifacts.
 */
import esMappingLib from "/data-hub/5/builtins/steps/mapping/entity-services/lib.mjs";
import consts from "/data-hub/5/impl/consts.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import httpUtils from "/data-hub/5/impl/http-utils.mjs";

const INFO_EVENT = consts.TRACE_CORE;

function onArtifactSave(artifactType, artifactName, uri, mapping) {
  try {
    if (artifactType === "mapping") {
      let xmlURI = fn.replace(uri, '\\.json$', '.xml');
      let xmlMapping = esMappingLib.buildMappingXML(mapping);
      let docPermissions = xdmp.defaultPermissions().concat(esMappingLib.xsltPermissions);

      // Write the XML version of the mapping to the modules database, which ES requires
      xdmp.invokeFunction(function () {
        xdmp.documentInsert(xmlURI, xmlMapping, {
          collections: esMappingLib.xmlMappingCollections,
          permissions: docPermissions
        });
      }, {database: xdmp.modulesDatabase(), update: "true", commit: "auto"}
      );

      // Use ES to generate the XSLT version of the XML mapping in the modules database
      xdmp.invokeFunction(function () {
        const es = require('/MarkLogic/entity-services/entity-services.xqy');
        es.mappingPut(xmlURI);
      }, {database: xdmp.modulesDatabase(), update: "true", commit: "auto"}
      );
      hubUtils.hubTrace(INFO_EVENT, `End of processing mapping transform for ${artifactName}`);
    }
  } catch (ex) {
    const errMsg = `Unable to generate mapping transform;  ${artifactName}; Reason: ${ex.message || ex.toString()}`;
    hubUtils.hubTrace(INFO_EVENT, errMsg);
    const stackTrace = xdmp.toJsonString(ex.stackFrames || ex.stack);
    httpUtils.throwBadRequestWithArray(["Unable to generate mapping transform for mapping at URI: " + uri + "; cause: " + errMsg +". Stack trace: " + stackTrace, stackTrace]);
  }
  if (artifactType === "model") {
    const start = uri.lastIndexOf("/") + 1;
    const end = uri.indexOf(".");
    const entityName = uri.substring(start, end);
    const entityVersion = mapping.info.version;
    const targetEntityType = `${mapping.info.baseUri}${entityName}-${entityVersion}/${entityName}`;
    const stepQuery = cts.andQuery([
      cts.collectionQuery("http://marklogic.com/data-hub/steps"),
      cts.jsonPropertyValueQuery(["targetEntityType", "targetEntity"], [entityName, targetEntityType]),
      cts.jsonPropertyValueQuery("stepDefinitionType", "mapping")
    ]);
    let mappingStepUris = cts.uris(null, ["score-zero", "concurrent"], stepQuery).toArray().map(step => String(step));
    for (let uri of mappingStepUris) {
      const start = uri.lastIndexOf("/") + 1;
      const end = uri.indexOf(".");
      const artifactName = uri.substring(start, end);
      onArtifactSave("mapping", artifactName, uri, cts.doc(uri).toObject());
    }
  }
  return true;
}

function onArtifactDelete(artifactType, artifactName, artifactUri, artifact) {
  try {
    if (artifact.stepDefinitionType === "mapping") {
      //Invoke cleanUpMapping with the URI
      let xmlURI = fn.replace(artifactUri, '\\.json$', '.xml');
      xdmp.invokeFunction(() => {
        if (fn.docAvailable(xmlURI)) {
          xdmp.documentDelete(xmlURI, {ifNotExists: "allow"});
          xdmp.documentDelete(xmlURI  + ".xslt", {ifNotExists: "allow"});
        }
      },
      {
        database: xdmp.modulesDatabase(),
        commit: 'auto',
        update: 'true',
        ignoreAmps: true
      });
    }
  } catch (err) {
    let errResp = "Failed to clean up mapping xml and compiled xslts: ";
    if (err.stack) {
      let stackLines = err.stack.split("\n");
      errResp = errResp + stackLines[0] + " " + stackLines[1];
    } else if (err.stackFrames) {
      errResp = errResp + err.message + ": " + err.data[0] + " in " + err.stackFrames[0].uri + " at " + err.stackFrames[0].line;
    }
    hubUtils.hubTrace(INFO_EVENT, `Failed to clean up;  ${artifactName}; Reason: ${errResp}`);
    return false;
  }
  hubUtils.hubTrace(INFO_EVENT, `End of clean up for ${artifactName}`);
  return true;
}


export default {
  onArtifactSave,
  onArtifactDelete
};
