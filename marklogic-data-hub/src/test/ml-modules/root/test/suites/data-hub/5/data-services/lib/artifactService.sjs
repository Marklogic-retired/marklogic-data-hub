function invokeSetService(artifactType, artifactName, artifact) {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/artifacts/setArtifact.sjs",
        {artifactType, artifactName, artifact: xdmp.toJSON(artifact)}
    ));
}

function invokeGetAllService(artifactType) {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/artifacts/getList.sjs",
        {artifactType}
    ));
}

function invokeValidateService(artifactType, artifactName, artifact) {
    return Artifacts.validateArtifact(artifactType, artifactName, artifact);
}

module.exports = {
    invokeSetService,
    invokeGetAllService,
    invokeValidateService
};