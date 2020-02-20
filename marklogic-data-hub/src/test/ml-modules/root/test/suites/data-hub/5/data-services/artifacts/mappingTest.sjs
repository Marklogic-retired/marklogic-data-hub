const test = require("/test/test-helper.xqy");

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

function invokeGetService(artifactType, artifactName) {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/artifacts/getArtifact.sjs",
        {artifactType, artifactName}
    ));
}

function updateMappingConfig(artifactName) {
    const result = invokeSetService('mapping', artifactName, {'name': `${artifactName}`, 'targetEntity': 'Customer', 'description': 'Mapping does ...', 'selectedSource': 'query', 'sourceQuery': '', 'collections': ['RAW-CUSTOMER']});
    return [
        test.assertEqual(artifactName, result.name),
        test.assertEqual("Customer", result.targetEntity)
    ];
}

function getArtifacts() {
    const configsByEntity = invokeGetAllService('mapping');
    configsByEntity.forEach(entity => {
        if (entity.name === 'Customer') {
            const config = entity.config;
            config.forEach(mapping => {
                if (mapping.name == 'TestMapping' || mapping.name === 'TestMapping2') {
                    test.assertEqual("Customer", mapping.targetEntity);
                    test.assertTrue(xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'dateTime', mapping.lastUpdated));
                }
            })
        }
    });
}

function deleteArtifact(artifactName) {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/artifacts/deleteArtifact.sjs",
        {artifactType: 'mapping', artifactName: `${artifactName}`}
    ));
}

[]
    .concat(updateMappingConfig('TestMapping'))
    .concat(updateMappingConfig('TestMapping2'))
    .concat(getArtifacts())
    .concat(deleteArtifact('TestMapping'))
    .concat(deleteArtifact('TestMapping2'));
