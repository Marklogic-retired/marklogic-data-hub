'use strict';
declareUpdate();
const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

var uri;

let xmlURI = fn.replace(uri, '\\.json$', '.xml');

try {
  xdmp.eval('if (fn.docAvailable("' + xmlURI + '")) { xdmp.documentDelete("' + xmlURI + '");xdmp.documentDelete("' + xmlURI  + '.xslt")}',
  {
    xmlURI:xmlURI
  },
  {
    database: xdmp.modulesDatabase(),
    commit: 'auto',
    update: 'true',
    ignoreAmps: true
  });
} catch (err) {
  datahub.debug.log({message: err, type: 'error'});
  let errResp = "Failed to clean up mapping xml and compiled xslts: ";
  if(err.stack) {
    let stackLines = err.stack.split("\n");
    errResp = errResp + stackLines[0] + " " + stackLines[1];
  }
  else if (err.stackFrames) {
    errResp = errResp + err.message + ": " + err.data[0] + " in " + err.stackFrames[0].uri + " at " + err.stackFrames[0].line;
  }
  throw Error(errResp);
}
