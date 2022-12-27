const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const Artifacts = mjsProxy.requireMjsModule("/data-hub/5/artifacts/core.mjs");

function invokeSetService(artifactType, artifactName, artifact) {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/artifacts/setArtifact.mjs",
        {artifactType, artifactName, artifact: xdmp.toJSON(artifact)}
    ));
}

function invokeGetAllService(artifactType) {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/artifacts/getList.mjs",
        {artifactType}
    ));
}

function invokeGetArtifactsWithProjectPaths() {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/artifacts/getArtifactsWithProjectPaths.mjs",
        {}
    ));
}

function invokeValidateService(artifactType, artifactName, artifact) {
    return Artifacts.validateArtifact(artifactType, artifactName, artifact);
}

module.exports = {
    invokeSetService,
    invokeGetAllService,
    invokeValidateService,
    invokeGetArtifactsWithProjectPaths
};
