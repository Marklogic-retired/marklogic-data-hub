const test = require("/test/test-helper.xqy");
const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const ArtifactService = require('../lib/artifactService.sjs');

function updateMappingConfig(artifactName) {
    const result = ArtifactService.invokeSetService('mapping', artifactName, {'name': `${artifactName}`, 'targetEntityType': 'TestEntity-hasConfig', 'description': 'Mapping does ...', 'selectedSource': 'query', 'sourceQuery': 'cts.collectionQuery(\"default-ingestion\")', 'collections': ['RAW-COL']});
    return [
        test.assertEqual(artifactName, result.name),
        test.assertEqual("TestEntity-hasConfig", result.targetEntityType),
        test.assertEqual(100, result.batchSize)
    ];
}

function createMappingWithSameNameButDifferentEntityType(artifactName) {
  try {
      ArtifactService.invokeSetService('mapping', artifactName, {'name': `${artifactName}`, 'targetEntityType': 'TestEntity-NoConfig', 'selectedSource': 'query'});
    return new Error("Expected a failure because another mapping exists with the same name but a different entity type. " +
      "Mapping names must be globally unique.");
  } catch (e) {
    let msg = e.data[1];
    return test.assertEqual("A mapping with the same name but for a different entity type already exists. Please choose a different name.", msg);
  }
}

function getArtifacts() {
    const artifactsByEntity = ArtifactService.invokeGetAllService('mapping');
    test.assertEqual(2, artifactsByEntity.length,
      "Should be an entry for each entity type, even if there are no mappings for a type");
    artifactsByEntity.forEach(entity => {
        if (entity.entityType === 'TestEntity-hasConfig') {
            const artifacts = entity.artifacts;
            artifacts.forEach(mapping => {
                if (mapping.name == 'TestMapping' || mapping.name === 'TestMapping2') {
                    test.assertEqual("TestEntity-hasConfig", mapping.targetEntityType);
                    test.assertTrue(xdmp.castableAs('http://www.w3.org/2001/XMLSchema', 'dateTime', mapping.lastUpdated));
                }
            })
        }
    });
}

function validArtifact() {
    const result = ArtifactService.invokeValidateService('mapping','validMapping', { name: 'validMapping', targetEntityType: 'TestEntity-hasConfig', selectedSource: 'collection'});
    return [
        test.assertEqual("validMapping", result.name),
        test.assertEqual("TestEntity-hasConfig", result.targetEntityType),
        test.assertEqual("collection", result.selectedSource)
    ];
}

function invalidArtifact() {
  try {
    ArtifactService.invokeValidateService('mapping', "invalidMapping", {name: 'invalidMapping'});
    throw Error("Should have thrown a validation error");
  } catch (e) {
    let msg = e.data[1];
    return test.assertEqual("Mapping 'invalidMapping' is missing the following required properties: [\"targetEntityType\",\"selectedSource\"]", msg);
  }
}

[]
  .concat(updateMappingConfig('TestMapping'))
  .concat(createMappingWithSameNameButDifferentEntityType('TestMapping'))
  .concat(updateMappingConfig('TestMapping2'))
  .concat(getArtifacts())
  .concat(validArtifact())
  .concat(invalidArtifact());
