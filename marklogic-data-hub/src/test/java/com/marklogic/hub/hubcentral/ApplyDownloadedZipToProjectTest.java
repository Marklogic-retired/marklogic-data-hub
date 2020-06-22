package com.marklogic.hub.hubcentral;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.dataservices.FlowService;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.hub.dataservices.StepService;
import com.marklogic.hub.impl.EntityManagerImpl;
import com.marklogic.hub.step.StepDefinition;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

public class ApplyDownloadedZipToProjectTest extends AbstractHubCoreTest {

    private final static List<String> PROTECTED_PATH_FILENAMES = Arrays.asList(
        "01_pii-protected-paths.json",
        "02_pii-protected-paths.json"
    );

    /**
     * In this scenario, two entity models exist, and then one is deleted before downloading. We need to verify that
     * when the zip is applied to the project, the deleted entity model is gone and that the entity-based artifacts
     * are no longer based on it.
     */
    @Test
    void deleteOneEntityThenDownloadAndApply() {
        installProjectInFolder("test-projects/download-artifacts");
        generateEntityBasedArtifacts();
        verifyEntityBasedArtifactsExist();

        // Delete the Order entity so we can verify that entity-based artifacts are updated
        DatabaseClient stagingClient = getHubClient().getStagingClient();
        ModelsService.on(stagingClient).deleteModel("Order");

        // Download the zip
        setTestUserRoles("data-hub-developer", "hub-central-downloader");
        AllArtifactsProject project = new AllArtifactsProject(getHubClient());
        project.writeProjectArtifactsToZipFile();

        // Apply the zip and verify
        new HubCentralManager().applyHubCentralZipToProject(getHubConfig().getHubProject(), project.getZipFile());
        verifyAllArtifactsBesidesOrderEntityExist();
        verifyEntityBasedArtifactsAreOnlyForPerson();
    }

    /**
     * In this scenario, all user artifacts are deleted in HC before downloading the zip. So after applying the zip,
     * we need to verify that the project is basically empty - i.e. it doesn't have any user-created artifacts in it.
     */
    @Test
    void deleteAllArtifactsBeforeApplyingZip() {
        installProjectInFolder("test-projects/download-artifacts");
        generateEntityBasedArtifacts();
        verifyEntityBasedArtifactsExist();

        DatabaseClient stagingClient = getHubClient().getStagingClient();
        ModelsService.on(stagingClient).deleteModel("Order");
        ModelsService.on(stagingClient).deleteModel("Person");
        FlowService.on(stagingClient).deleteFlow("testFlow");
        StepService.on(stagingClient).deleteStep("ingestion", "validArtifact");
        ArtifactService.on(stagingClient).deleteArtifact("stepDefinition", "testStep");

        setTestUserRoles("data-hub-developer", "hub-central-downloader");
        AllArtifactsProject project = new AllArtifactsProject(getHubClient());
        project.writeProjectArtifactsToZipFile();
        assertEquals(0, project.getZipEntries().size(), "Expecting the zip to be empty because all of the user " +
            "artifacts in the project were just deleted");

        new HubCentralManager().applyHubCentralZipToProject(getHubConfig().getHubProject(), project.getZipFile());

        verifyFlowsAndEntitiesAndStepsWereDeletedFromProject();
    }

    @Test
    void fileDoesNotExist() {
        installProjectInFolder("test-projects/download-artifacts");
        generateEntityBasedArtifacts();
        try {
            new HubCentralManager().applyHubCentralZipToProject(getHubConfig().getHubProject(), new File("doesnt-exist.zip"));
            fail("Should have failed immediately because the file doesn't exist");
        } catch (RuntimeException ex) {
            assertEquals("Unable to apply zip file to project, file does not exist: doesnt-exist.zip", ex.getMessage());
            verifyEntityBasedArtifactsExist();
        }
    }

    private void generateEntityBasedArtifacts() {
        EntityManagerImpl em = new EntityManagerImpl(getHubConfig());
        em.saveDbIndexes();
        em.savePii();
        em.saveQueryOptions();
    }

    private void verifyEntityBasedArtifactsExist() {
        verifyEntitySearchOptionsExist();
        verifyEntityDatabaseFilesExist();
        verifyEntitySecurityFilesExist();
    }

    private void verifyEntitySearchOptionsExist() {
        File entityConfigDir = getHubConfig().getHubProject().getEntityConfigDir().toFile();
        assertTrue(entityConfigDir.exists());
        Stream.of("exp-final-entity-options.xml", "exp-staging-entity-options.xml", "final-entity-options.xml",
            "staging-entity-options.xml").forEach(filename -> {
            assertTrue(new File(entityConfigDir, filename).exists());
        });
    }

    private void verifyEntityDatabaseFilesExist() {
        File entityConfigDir = getHubConfig().getHubProject().getEntityConfigDir().toFile();
        File dbDir = new File(entityConfigDir, "databases");
        assertTrue(dbDir.exists());
        Stream.of("final-database.json", "staging-database.json").forEach(filename -> {
            assertTrue(new File(dbDir, filename).exists());
        });
    }

    private void verifyEntitySecurityFilesExist() {
        ConfigDir configDir = new ConfigDir(getHubConfig().getHubProject().getUserConfigDir().toFile());
        File ppDir = configDir.getProtectedPathsDir();
        assertTrue(ppDir.exists());
        PROTECTED_PATH_FILENAMES.forEach(filename -> {
            assertTrue(new File(ppDir, filename).exists());
        });
        File qrDir = configDir.getQueryRolesetsDir();
        assertTrue(qrDir.exists());
        assertTrue(new File(qrDir, HubConfig.PII_QUERY_ROLESET_FILE).exists());
    }

    private void verifyEntityBasedArtifactsAreOnlyForPerson() {
        verifyEntitySearchOptionsExist();
        verifyEntityDatabaseFilesExist();

        // Check one database file to make sure it's only for Person
        File entityConfigDir = getHubConfig().getHubProject().getEntityConfigDir().toFile();
        File dbDir = new File(entityConfigDir, "databases");
        try {
            JsonNode config = objectMapper.readTree(new File(dbDir, "final-database.json"));
            JsonNode pathIndexes = config.get("range-path-index");
            assertEquals(1, pathIndexes.size(), "Should only have the one index for personID, not orderID");
            assertEquals("//*:instance/Person/personID", pathIndexes.get(0).get("path-expression").asText());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        ConfigDir configDir = new ConfigDir(getHubConfig().getHubProject().getUserConfigDir().toFile());
        assertTrue(configDir.getProtectedPathsDir().exists(), "This directory should still exist, as the user " +
            "may have their own protected paths defined in here");

        PROTECTED_PATH_FILENAMES.forEach(filename -> {
            assertFalse(new File(configDir.getProtectedPathsDir(), filename).exists(), "The protected path " +
                "file should not exist because it was for the now-deleted Order entity");
        });

        assertTrue(configDir.getQueryRolesetsDir().exists(), "This directory should still exist, as the user " +
            "may have their own query rolesets defined in here");
        assertFalse(new File(configDir.getQueryRolesetsDir(), HubConfig.PII_QUERY_ROLESET_FILE).exists(),
            "The PII query roleset file should have been deleted because it was for the now-deleted Order entity");
    }

    private void verifyAllArtifactsBesidesOrderEntityExist() {
        HubProject project = getHubConfig().getHubProject();
        assertTrue(new File(project.getFlowsDir().toFile(), "testFlow.flow.json").exists());
        assertTrue(new File(project.getHubEntitiesDir().toFile(), "Person.entity.json").exists());
        assertTrue(project.getStepFile(StepDefinition.StepDefinitionType.INGESTION, "validArtifact").exists());

        verifyCustomStepDefinitionExists();
    }

    /**
     * Because as of 5.3.0, custom step definitions cannot be managed in HC, they should never be deleted from the
     * user's project, and thus the one in our test project should always exist after applying the project zip.
     */
    private void verifyCustomStepDefinitionExists() {
        File customDir = project.getStepsDirByType(StepDefinition.StepDefinitionType.CUSTOM).toFile();
        assertTrue(customDir.exists());
        File stepDefDir = new File(customDir, "testStep");
        assertTrue(stepDefDir.exists());
        assertTrue(new File(stepDefDir, "testStep.step.json").exists());
    }

    private void verifyFlowsAndEntitiesAndStepsWereDeletedFromProject() {
        HubProject project = getHubConfig().getHubProject();

        Stream.of(project.getHubEntitiesDir(), project.getFlowsDir(), project.getStepsPath()).forEach(path -> {
            File dir = path.toFile();
            assertTrue(dir.exists(), "The directory should still exist, even though it doesn't contain anything, as that " +
                "makes life easier for Pari in case she wants to manually add an artifact; couldn't find: " + dir.getAbsolutePath());
            assertTrue(dir.listFiles().length == 0, "The directory is expected to be empty since the associated " +
                "artifacts were deleted from Hub Central; directory: " + dir.getAbsolutePath());
        });

        File entityConfigDir = project.getEntityConfigDir().toFile();
        assertFalse(entityConfigDir.exists(), "The entity-config directory should have been deleted because there are " +
            "no entity models left; also, there's no need for this directory to exist because users are not expected to " +
            "be modifying anything in this directory");

        verifyCustomStepDefinitionExists();
    }
}
