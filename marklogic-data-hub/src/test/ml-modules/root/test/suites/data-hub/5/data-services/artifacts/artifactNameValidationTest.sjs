const test = require("/test/test-helper.xqy");
const Artifacts = require('/data-hub/5/artifacts/core.sjs');
const ArtifactService = require('../lib/artifactService.sjs');

function createArtifact(artifactName, artifactType) {
  try {
      //Some properties (other than 'name') aren't required for an artifact but they are added so as to avoid creating additional methods
      return ArtifactService.invokeSetService(artifactType, artifactName, {'name': `${artifactName}`, 'targetEntityType': 'TestEntity-NoConfig', 'selectedSource': 'query', 'type':'ingestion'});
  } catch (e) {
    let msg = e.data[1];
    return msg;
  }
}

function getErrorMessage(artifactName){
  return "Invalid name: '" +  artifactName + "'; it must start with a letter and can contain letters, numbers, hyphens and underscores only."
}

function testValidateArtifactName() {
  return [
    test.assertEqual(false, Artifacts.validateArtifactName(" ")),
    test.assertEqual(false, Artifacts.validateArtifactName("12abc")),
    test.assertEqual(false, Artifacts.validateArtifactName("abc123^")),
    test.assertEqual(false, Artifacts.validateArtifactName("$abc567")),
    test.assertEqual(false, Artifacts.validateArtifactName("My artifact")),
    test.assertEqual(true, Artifacts.validateArtifactName("myArtifact_1")),
    test.assertEqual(true, Artifacts.validateArtifactName("myArtifact-1")),
    test.assertEqual(false, Artifacts.validateArtifactName("1-artifact")),
  ];
}

function testCreateArtifact(){
  return [
    test.assertEqual(getErrorMessage(" myMergeStep"), createArtifact(" myMergeStep", "merging")),
    test.assertEqual(getErrorMessage("12abc"), createArtifact("12abc", "mapping")),
    test.assertEqual(getErrorMessage("abc123^"), createArtifact("abc123^", "stepDefinition")),
    test.assertEqual(getErrorMessage("$abc567"), createArtifact("$abc567", "flow")),
    test.assertEqual(getErrorMessage("My artifact"), createArtifact("My artifact", "ingestion")),
    test.assertEqual(getErrorMessage("1-artifact"), createArtifact("1-artifact", "custom")),
    test.assertEqual("myArtifact_1",  createArtifact("myArtifact_1", "mapping").name),
    test.assertEqual("myArtifact-1",  createArtifact("myArtifact-1", "flow").name),
    test.assertEqual("StepDef-1",  createArtifact("StepDef-1", "stepDefinition").name)
  ];
}


[]
  .concat(testValidateArtifactName())
  .concat(testCreateArtifact());
