function invoke(module, args) {
    return fn.head(xdmp.invoke("/data-hub/5/data-services/provenance/" + module, args));
}

function pruneProvenance(endpointConstants, endpointState) {
    return invoke("pruneProvenance.sjs", {endpointConstants, endpointState});
}

module.exports = {
    pruneProvenance
};
