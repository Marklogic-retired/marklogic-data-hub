import Artifacts from "/data-hub/5/artifacts/core.mjs";

function invokeSetService(artifactType, artifactName, artifact) {
    return fn.head(xdmp.invoke(
        "/data-hub/data-services/artifacts/setArtifact.mjs",
        {artifactType, artifactName, artifact: xdmp.toJSON(artifact)},
        { ignoreAmps: false }
    ));
}

function invokeGetAllService(artifactType) {
    return fn.head(xdmp.invoke(
        "/data-hub/data-services/artifacts/getList.mjs",
        {artifactType},
        { ignoreAmps: false }
    ));
}

function invokeGetArtifactsWithProjectPaths() {
    return fn.head(xdmp.invoke(
        "/data-hub/data-services/artifacts/getArtifactsWithProjectPaths.mjs",
        {},
        { ignoreAmps: false }
    ));
}

function invokeValidateService(artifactType, artifactName, artifact) {
    return Artifacts.validateArtifact(artifactType, artifactName, artifact);
}

export default {
    invokeSetService,
    invokeGetAllService,
    invokeValidateService,
    invokeGetArtifactsWithProjectPaths
};
