'use strict';
declareUpdate();
const esMappingLib = require('/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs');

var uri;

let xmlURI = fn.replace(uri, '\\.json$', '.xml');
let jsonDoc = cts.doc(uri);
let xmlDoc = esMappingLib.buildMappingXML(jsonDoc);
xdmp.invokeFunction(function() {
    xdmp.documentInsert(
      xmlURI,
      xmlDoc,
      {
        collections: esMappingLib.xmlMappingCollections,
        permissions: xdmp.defaultPermissions()
      }
    );
  },
  { database: xdmp.modulesDatabase(), update: "true", commit: "auto" }
);
try {
    xdmp.invokeFunction(function() {
        const es = require('/MarkLogic/entity-services/entity-services');
        es.mappingPut(xmlURI);
      },
      { database: xdmp.modulesDatabase(), update: "true", commit: "auto" }
    );
} catch (e) {
  xdmp.log(`Failed to compile due to '${e.message}': ${xdmp.describe(xmlDoc, Sequence.from([]), Sequence.from([]))}`);
}
