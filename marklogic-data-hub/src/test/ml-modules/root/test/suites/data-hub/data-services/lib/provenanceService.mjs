function invoke(module, args) {
    return fn.head(xdmp.invoke("/data-hub/data-services/provenance/" + module, args));
}

function deleteProvenance(endpointConstants, endpointState) {
    return invoke("deleteProvenance.mjs", {endpointConstants, endpointState});
}

function migrateProvenance(endpointConstants, endpointState) {
    return invoke("migrateProvenance.mjs", {endpointConstants, endpointState});
}

function getProvenanceGraph(documentURI) {
    return invoke("getProvenanceGraph.mjs", {documentURI});
}

export default {
    deleteProvenance,
    migrateProvenance,
    getProvenanceGraph
};
