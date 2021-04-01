'use strict';
// No privilege required: The xdmp.securityAssert call is in the pruneProvenance function.
const provPruneLib = require('/data-hub/5/provenance/pruning');

var endpointConstants;
var endpointState;

provPruneLib.pruneProvenance(endpointConstants, endpointState);