'use strict';
// No privilege required: The xdmp.securityAssert call is in the deleteProvenance function.
const provLib = require('/data-hub/5/provenance/prov-lib.sjs');

var endpointConstants;
var endpointState;

provLib.deleteProvenance(fn.head(xdmp.fromJSON(endpointConstants)), endpointState);
