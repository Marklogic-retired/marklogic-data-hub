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

function invokeValidateService(artifactType, artifactName, artifact) {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/artifacts/validateArtifact.sjs",
        {artifactType, artifactName, artifact: xdmp.toJSON(artifact)}
    ));
}

function invokeGetEntityTitlesService() {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/artifacts/getEntityTitles.sjs",
        {}
    ));
}

function updateMappingConfig(artifactName) {
    const result = invokeSetService('mappings', artifactName, {'name': `${artifactName}`, 'targetEntity': 'TestEntity-hasMappingConfig', 'description': 'Mapping does ...', 'selectedSource': 'query', 'sourceQuery': '', 'collections': ['RAW-COL']});
    return [
        test.assertEqual(artifactName, result.name),
        test.assertEqual("TestEntity-hasMappingConfig", result.targetEntity)
    ];
}

function getArtifacts() {
    const artifactsByEntity = invokeGetAllService('mappings');
    const entityNames = invokeGetEntityTitlesService();
    test.assertEqual(entityNames.length, artifactsByEntity.length);
    artifactsByEntity.forEach(entity => {
        if (entity.entityType === 'TestEntity-hasMappingConfig') {
            const artifacts = entity.artifacts;
            artifacts.forEach(mapping => {
                if (mapping.name == 'TestMapping' || mapping.name === 'TestMapping2') {
                    test.assertEqual("TestEntity-hasMappingConfig", mapping.targetEntity);
                    test.assertTrue(xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'dateTime', mapping.lastUpdated));
                }
            })
        }
    });
}

function deleteArtifact(artifactName) {
    return fn.head(xdmp.invoke(
        "/data-hub/5/data-services/artifacts/deleteArtifact.sjs",
        {artifactType: 'mappings', artifactName: `${artifactName}`}
    ));
}

function validArtifact() {
    const result = invokeValidateService('mappings','validMapping', { name: 'validMapping', targetEntity: 'TestEntity-hasMappingConfig', selectedSource: 'collection'});
    return [
        test.assertEqual("validMapping", result.name),
        test.assertEqual("TestEntity-hasMappingConfig", result.targetEntity),
        test.assertEqual("collection", result.selectedSource)
    ];
}

function invalidArtifact() {
    try {
        const result = invokeValidateService('mappings', "invalidMapping", { name: 'invalidMapping'});
        return [test.assertTrue(false, 'Should have thrown a validation error')];
    } catch (e) {
        let msg = e.data[2];
        return [
            test.assertEqual(3, e.data.length, `Error doesn't have the expected validate information: "${JSON.stringify(e)}"`),
            test.assertTrue(fn.contains(msg, 'required'), `Message: "${msg}" doesn't have "required"`),
            test.assertTrue(fn.contains(msg, 'targetEntity'), `Message: "${msg}" doesn't have "targetEntity"`),
            test.assertTrue(fn.contains(msg, 'selectedSource'), `Message: "${msg}" doesn't have "selectedSource"`),
            test.assertFalse(fn.contains(msg, 'name'), `Message: "${msg}" has "name" when it shouldn't`)
        ];
    }
}

[]
    .concat(updateMappingConfig('TestMapping'))
    .concat(updateMappingConfig('TestMapping2'))
    .concat(getArtifacts())
    .concat(deleteArtifact('TestMapping'))
    .concat(deleteArtifact('TestMapping2'))
    .concat(validArtifact())
    .concat(invalidArtifact());
