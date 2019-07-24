'use strict';
const es = require('/MarkLogic/entity-services/entity-services');
declareUpdate();

var uri;

let xmlURI = fn.replace(uri, '\\.json$', '.xml');

xdmp.invokeFunction(function() {
    if (fn.docAvailable(xmlURI)) {
      xdmp.documentDelete(xmlURI);
      es.mappingDelete(xmlURI);
    }
  },
  { update: "true", commit: "auto" }
);
