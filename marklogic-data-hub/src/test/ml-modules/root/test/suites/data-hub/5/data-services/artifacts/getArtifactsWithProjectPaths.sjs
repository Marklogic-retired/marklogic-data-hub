const test = require("/test/test-helper.xqy");
const ArtifactService = require('../lib/artifactService.sjs');


const artifactsWithProjectPaths = ArtifactService.invokeGetArtifactsWithProjectPaths();
const artifactsWithProjectPathsDesc = JSON.stringify(artifactsWithProjectPaths, null, 2);
const assertions = [];

assertions.push(
    test.assertTrue(
        artifactsWithProjectPaths.some((artifact) => artifact.path === 'entities/TestEntity-hasConfig.entity.json'),
        `Artifacts should include entities. Artifacts: ${artifactsWithProjectPathsDesc}`
    ),
    test.assertTrue(
        artifactsWithProjectPaths.some((artifact) => artifact.path === 'entities/TestEntity-NoConfig.entity.json'),
        `Artifacts should include entities. Artifacts: ${artifactsWithProjectPathsDesc}`
    ),
    test.assertTrue(
        artifactsWithProjectPaths.some((artifact) => artifact.path === 'flows/myFlow.flow.json'),
        `Artifacts should include flows. Artifacts: ${artifactsWithProjectPathsDesc}`
    ),
    test.assertTrue(
        artifactsWithProjectPaths.some((artifact) => artifact.path === 'flows/testFlow.flow.json'),
        `Artifacts should include flows. Artifacts: ${artifactsWithProjectPathsDesc}`
    ),
    test.assertTrue(
        artifactsWithProjectPaths.some((artifact) => artifact.path === 'steps/ingestion/ingestionStep.step.json'),
        `Artifacts should include ingestion steps. Artifacts: ${artifactsWithProjectPathsDesc}`
    ),
    test.assertTrue(
        artifactsWithProjectPaths.some((artifact) => artifact.path === 'steps/mapping/mappingStep.step.json'),
        `Artifacts should include mapping steps. Artifacts: ${artifactsWithProjectPathsDesc}`
    ),
    test.assertTrue(
        artifactsWithProjectPaths.some((artifact) => artifact.path === 'steps/matching/matchingStep.step.json'),
        `Artifacts should include matching steps. Artifacts: ${artifactsWithProjectPathsDesc}`
    ),
    test.assertTrue(
        artifactsWithProjectPaths.some((artifact) => artifact.path === 'steps/merging/mergingStep.step.json'),
        `Artifacts should include merging steps. Artifacts: ${artifactsWithProjectPathsDesc}`
    ),
    test.assertTrue(
        artifactsWithProjectPaths.some((artifact) => artifact.path === 'steps/custom/customStep.step.json'),
        `Artifacts should include custom steps. Artifacts: ${artifactsWithProjectPathsDesc}`
    )
)


assertions;