'use strict';
// No privilege required: The xdmp.securityAssert call is in the migrateProvenance function.
import sjsProxy from "/data-hub/core/util/sjsProxy";
const provMigrateLib = sjsProxy.requireSjsModule("/data-hub/5/provenance/migrate-provenance.xqy");

const endpointConstants = external.endpointConstants;
const endpointState = external.endpointState;

let endpointStateObject = fn.head(xdmp.fromJSON(endpointState));
provMigrateLib.migrateProvenance(fn.head(xdmp.fromJSON(endpointConstants)), endpointStateObject ? endpointStateObject : {});
