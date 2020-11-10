const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
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
function setMergingConfigWithHCRole() {
  hubTest.runWithRolesAndPrivileges(['hub-central-match-merge-writer'], [],
    function() {
      let artifactName1 = "HCMerging1";
      const result1 = ArtifactService.invokeSetService('merging', artifactName1, {'name': `${artifactName1}`, 'targetEntityType': 'TestEntity-hasConfig', 'description': 'Merging does ...', 'selectedSource': 'query', 'sourceQuery': 'cts.collectionQuery(\"default-ingestion\")', 'collections': ['RAW-COL']});
      let artifactName2 = "HCMerging2";
      const result2 = ArtifactService.invokeSetService('merging', artifactName2, {'name': `${artifactName2}`, 'mergeRules': [{"entityPropertyPath": "thePath"}], 'mergeStrategies': [{"strategyName": "theStrategy"}], 'targetCollections': {"onMerge": {"add": ["sm-Customer-mastered"]}}, 'targetEntityType': 'TestEntity-hasConfig', 'description': 'Merging does ...', 'selectedSource': 'query', 'sourceQuery': 'cts.collectionQuery(\"default-ingestion\")', 'collections': ['RAW-COL']});
      return [
        test.assertEqual(artifactName1, result1.name),
        test.assertNotExists(result1.mergeOptions, "Setting merging config with HC role, mergeOptions should not exist (1)"),
        test.assertExists(result1.mergeRules, "Setting merging config with HC role, mergeRules array should be added"),
        test.assertExists(result1.mergeStrategies, "Setting merging config with HC role, mergeStrategies array should be added"),
        test.assertExists(result1.targetCollections, "Setting merging config with HC role, targetCollections object should be added"),
        test.assertExists(result1.targetCollections.onMerge, "Setting merging config with HC role, targetCollections onMerge object should be added"),
        test.assertExists(result1.targetCollections.onNoMatch, "Setting merging config with HC role, targetCollections onNoMatch object should be added"),
        test.assertExists(result1.targetCollections.onArchive, "Setting merging config with HC role, targetCollections onArchive object should be added"),
        test.assertExists(result1.targetCollections.onNotification, "Setting merging config with HC role, targetCollections onNotification object should be added"),

        test.assertEqual(artifactName2, result2.name),
        test.assertNotExists(result2.mergeOptions, "Setting merging config with HC role, mergeOptions should not exist (2)"),
        test.assertExists(result2.mergeRules[0].entityPropertyPath, "Setting merging config with HC role, mergeRules should be preserved"),
        test.assertExists(result2.mergeStrategies[0].strategyName, "Setting merging config with HC role, mergeStrategies should be preserved"),
        test.assertEqual(result2.targetCollections.onMerge.add[0], "sm-Customer-mastered", "Setting merging config with HC role, targetCollections should be preserved")
      ];
    }
  )
}

[]
    .concat(updateMergingConfig('TestMerging'))
    .concat(createMergingWithSameNameButDifferentEntityType('TestMerging'))
    .concat(updateMergingConfig('TestMerging2'))
    .concat(getArtifacts())
    .concat(setMergingConfigWithHCRole());
