'use strict';
// No privilege required: The xdmp.securityAssert call is in the migrateProvenance function.
const provMigrateLib = require('/data-hub/5/provenance/migrate-provenance.xqy');

var endpointConstants;
var endpointState;

let endpointStateObject = fn.head(xdmp.fromJSON(endpointState));
provMigrateLib.migrateProvenance(fn.head(xdmp.fromJSON(endpointConstants)), endpointStateObject ? endpointStateObject : {});
