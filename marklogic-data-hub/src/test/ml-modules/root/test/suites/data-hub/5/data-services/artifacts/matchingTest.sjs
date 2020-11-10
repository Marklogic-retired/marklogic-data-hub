const test = require("/test/test-helper.xqy");
const hubTest = require("/test/data-hub-test-helper.sjs");
const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const ArtifactService = require('../lib/artifactService.sjs');

function updateMatchingConfig(artifactName) {
    const result = ArtifactService.invokeSetService('matching', artifactName, {'name': `${artifactName}`, 'targetEntityType': 'TestEntity-hasConfig', 'description': 'Matching does ...', 'selectedSource': 'query', 'sourceQuery': 'cts.collectionQuery(\"default-ingestion\")', 'collections': ['RAW-COL']});
    return [
        test.assertEqual(artifactName, result.name),
        test.assertEqual("TestEntity-hasConfig", result.targetEntityType),
        test.assertEqual(100, result.batchSize)
    ];
}

function createMatchingWithSameNameButDifferentEntityType(artifactName) {
    try {
        ArtifactService.invokeSetService('matching', artifactName, {'name': `${artifactName}`, 'targetEntityType': 'TestEntity-NoConfig', 'selectedSource': 'query'});
        return new Error("Expected a failure because another matching exists with the same name but a different entity type. " +
            "Matching names must be globally unique.");
    } catch (e) {
        let msg = e.data[2];
        return test.assertEqual("A matching with the same name but for a different entity type already exists. Please choose a different name.", msg);
    }
}

function getArtifacts() {
    const artifactsByEntity = ArtifactService.invokeGetAllService('matching');
    test.assertEqual(2, artifactsByEntity.length,
        "Should be an entry for each entity type, even if there are no matchings for a type");
    artifactsByEntity.forEach(entity => {
        if (entity.entityType === 'TestEntity-hasConfig') {
            const artifacts = entity.artifacts;
            artifacts.forEach(matching => {
                if (matching.name == 'TestMatching' || matching.name === 'TestMatching2') {
                    test.assertEqual("TestEntity-hasConfig", matching.targetEntityType);
                    test.assertTrue(xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'dateTime', matching.lastUpdated));
                }
            })
        }
    });
}

function setMatchingConfigWithHCRole() {
  hubTest.runWithRolesAndPrivileges(['hub-central-match-merge-writer'], [],
    function() {
      let artifactName1 = "HCMatching1";
      const result1 = ArtifactService.invokeSetService('matching', artifactName1, {'name': `${artifactName1}`, 'targetEntityType': 'TestEntity-hasConfig', 'description': 'Matching does ...', 'selectedSource': 'query', 'sourceQuery': 'cts.collectionQuery(\"default-ingestion\")', 'collections': ['RAW-COL']});
      let artifactName2 = "HCMatching2";
      const result2 = ArtifactService.invokeSetService('matching', artifactName2, {'name': `${artifactName2}`, 'matchRulesets': [{'name':'theName'}], 'thresholds': [{'thresholdName':'theThresholdName'}], 'targetEntityType': 'TestEntity-hasConfig', 'description': 'Matching does ...', 'selectedSource': 'query', 'sourceQuery': 'cts.collectionQuery(\"default-ingestion\")', 'collections': ['RAW-COL']});
      return [
        test.assertEqual(artifactName1, result1.name),
        test.assertNotExists(result1.matchOptions, "Setting matching config with HC role, matchOptions should not exist (1)"),
        test.assertExists(result1.matchRulesets, "Setting matching config with HC role, matchRulesets array should be added"),
        test.assertExists(result1.thresholds, "Setting matching config with HC role, thresholds array should be added"),
        test.assertEqual(artifactName2, result2.name),
        test.assertNotExists(result2.matchOptions, "Setting matching config with HC role, matchOptions should not exist (2)"),
        test.assertExists(result2.matchRulesets[0].name, "Setting matching config with HC role, matchRulesets should be preserved"),
        test.assertExists(result2.thresholds[0].thresholdName, "Setting matching config with HC role, thresholds should be preserved")
      ];
    }
  )
}

[]
    .concat(updateMatchingConfig('TestMatching'))
    .concat(createMatchingWithSameNameButDifferentEntityType('TestMatching'))
    .concat(updateMatchingConfig('TestMatching2'))
    .concat(getArtifacts())
    .concat(setMatchingConfigWithHCRole());

