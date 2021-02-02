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
declareUpdate();

const esMappingLib = require('/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs');
const httpUtils = require("/data-hub/5/impl/http-utils.sjs");

var uri;

try {
  let xmlURI = fn.replace(uri, '\\.json$', '.xml');
  let jsonMapping = cts.doc(uri);
  let xmlMapping = esMappingLib.buildMappingXML(jsonMapping);
  let docPermissions = xdmp.nodePermissions(jsonMapping).concat(esMappingLib.xsltPermissions);

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
      const es = require('/MarkLogic/entity-services/entity-services');
      es.mappingPut(xmlURI);
    }, {database: xdmp.modulesDatabase(), update: "true", commit: "auto"}
  );
} catch (e) {
  httpUtils.throwBadRequest("Unable to generate mapping transform for mapping at URI: " + uri + "; cause: " + e.message);
}
