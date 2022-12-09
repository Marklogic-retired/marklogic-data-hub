'use strict';
// No privilege required: The xdmp.securityAssert call is in the deleteProvenance function.
import provLib from "/data-hub/5/provenance/prov-lib.mjs";

const endpointConstants = external.endpointConstants;
const endpointState = external.endpointState;

provLib.deleteProvenance(fn.head(xdmp.fromJSON(endpointConstants)), endpointState);
