const test = require("/test/test-helper.xqy");
const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const ArtifactService = require('../lib/artifactService.sjs');

function updateMergingConfig(artifactName) {
    const result = ArtifactService.invokeSetService('merging', artifactName, {'name': `${artifactName}`, 'targetEntityType': 'TestEntity-hasConfig', 'description': 'Merging does ...', 'selectedSource': 'query', 'sourceQuery': 'cts.collectionQuery(\"default-ingestion\")', 'collections': ['RAW-COL']});
    return [
        test.assertEqual(artifactName, result.name),
        test.assertEqual("TestEntity-hasConfig", result.targetEntityType),
        test.assertEqual(100, result.batchSize)
    ];
}

function createMergingWithSameNameButDifferentEntityType(artifactName) {
    try {
        ArtifactService.invokeSetService('merging', artifactName, {'name': `${artifactName}`, 'targetEntityType': 'TestEntity-NoConfig', 'selectedSource': 'query'});
        return new Error("Expected a failure because another merging exists with the same name but a different entity type. " +
            "Merging names must be globally unique.");
    } catch (e) {
        let msg = e.data[2];
        return test.assertEqual("A merging with the same name but for a different entity type already exists. Please choose a different name.", msg);
    }
}

function getArtifacts() {
    const artifactsByEntity = ArtifactService.invokeGetAllService('merging');
    test.assertEqual(2, artifactsByEntity.length,
        "Should be an entry for each entity type, even if there are no mergings for a type");
    artifactsByEntity.forEach(entity => {
        if (entity.entityType === 'TestEntity-hasConfig') {
            const artifacts = entity.artifacts;
            artifacts.forEach(merging => {
                if (merging.name == 'TestMerging' || merging.name === 'TestMerging2') {
                    test.assertEqual("TestEntity-hasConfig", merging.targetEntityType);
                    test.assertTrue(xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'dateTime', merging.lastUpdated));
                }
            })
        }
    });
}

[]
    .concat(updateMergingConfig('TestMerging'))
    .concat(createMergingWithSameNameButDifferentEntityType('TestMerging'))
    .concat(updateMergingConfig('TestMerging2'))
    .concat(getArtifacts());
