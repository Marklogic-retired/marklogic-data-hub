function invoke(module, args) {
    return fn.head(xdmp.invoke("/data-hub/5/data-services/provenance/" + module, args));
}

function deleteProvenance(endpointConstants, endpointState) {
    return invoke("deleteProvenance.sjs", {endpointConstants, endpointState});
}

function migrateProvenance(endpointConstants, endpointState) {
    return invoke("migrateProvenance.sjs", {endpointConstants, endpointState});
}

function getProvenanceGraph(documentURI) {
    return invoke("getProvenanceGraph.sjs", {documentURI});
}

module.exports = {
    deleteProvenance,
    migrateProvenance,
    getProvenanceGraph
};
