function invoke(module, args) {
    return fn.head(xdmp.invoke("/data-hub/5/data-services/provenance/" + module, args));
}

function deleteProvenance(endpointConstants, endpointState) {
    return invoke("deleteProvenance.sjs", {endpointConstants, endpointState});
}

function migrateProvenance(endpointConstants, endpointState) {
    return invoke("migrateProvenance.sjs", {endpointConstants, endpointState});
}

module.exports = {
    deleteProvenance,
    migrateProvenance
};
