package com.marklogic.hub.hubcentral;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class GetProjectAsZipTest extends AbstractHubCoreTest {

    private Set<String> zipProjectEntries;
    private File zipProjectFile;
    private AllArtifactsProject project;
    private List<ZipEntry> artifactZipEntries;
    private Properties gradleProps = new Properties();

    @Test
    void forbiddenUser() {
        runAsTestUserWithRoles("data-hub-operator");
        verifyTestUserIsForbiddenTo(()->writeProjectToZipFile(getHubClient()), "A user must have the data-hub-download-project-files privilege");
    }

    /**
     *
     * @throws IOException
     */
    @Test
    void permittedUser() throws IOException {
        // Load all artifacts from the test project
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/all-artifacts");

        // Download the project, verify the zip is correct
        runAsTestUserWithRoles("hub-central-downloader");

        writeProjectToZipFile(getHubClient());
        verifyZipProject();
        project.verifyZipArtifacts();


        // Clear out the test project directory and the user files in the database
        runAsAdmin();
        resetHubProject();

        // Unzip the project we downloaded in the beginning to the test project directory
        extractZipToProjectDirectory(zipProjectFile);

        // Verify that downloading returns a zip without artifacts, since the database was cleared of user files
        runAsTestUser();
        writeProjectToZipFile(getHubClient());
        verifyZipProject();
        assertEquals(0, project.getHubCentralFilesZipEntries().size(), "The zip should be empty since the project was reset, and thus there are " +
            "no user artifacts to download; zipEntries: " + new AllArtifactsProject(getHubClient()).getHubCentralFilesZipEntries());

        // Install user artifacts from the test project directory, and verify everything's still there when we download them again
        runAsDataHubDeveloper();
        installUserArtifacts();

        runAsTestUser();
        writeProjectToZipFile(getHubClient());
        verifyZipProject();
        project.verifyZipArtifacts();
    }

    private void writeProjectToZipFile(HubClient hubClient) {
        try {
            zipProjectFile = new File("build/allProject.zip");
            FileOutputStream fos = new FileOutputStream(zipProjectFile);
            new HubCentralManager().writeProjectFilesAsZip(hubClient, fos);
            fos.close();
            project = new AllArtifactsProject(getHubClient());
            readZipProject();
            project.readZipArtifacts(new ZipFile(zipProjectFile), Collections.enumeration(artifactZipEntries));

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void readZipProject() throws IOException {
        zipProjectEntries = new HashSet<>();
        artifactZipEntries = new ArrayList<>();
        ZipFile zip = new ZipFile(zipProjectFile);
        Enumeration<?> entries = zip.entries();
        String[] artifactDirs = {"flows", "steps", "entities", "src/main/entity-config", "src/main/ml-config/security/protected-paths",
            "src/main/ml-config/security/query-rolesets"};

        while (entries.hasMoreElements()) {
            ZipEntry entry = (ZipEntry) entries.nextElement();
            if("gradle.properties".equals(entry.getName())){
                InputStream input = zip.getInputStream(entry);
                gradleProps.load(input);
            }
            if(Stream.of(artifactDirs).anyMatch(entry.getName()::startsWith) && !entry.isDirectory()){
                artifactZipEntries.add(entry);
            }
            else{
                zipProjectEntries.add(entry.getName());
            }
        }
    }

    public void verifyZipProject(){
        assertEquals(HubConfig.DEFAULT_STAGING_NAME, gradleProps.getProperty("mlStagingDbName"));
        assertEquals(String.valueOf(HubConfig.DEFAULT_FINAL_PORT), gradleProps.getProperty("mlFinalPort"));
        assertEquals(HubConfig.DEFAULT_JOB_NAME, gradleProps.getProperty("mlJobAppserverName"));

        assertTrue(zipProjectEntries.contains("src/main/ml-modules/root/custom-modules/custom/"));
        assertTrue(zipProjectEntries.contains("src/main/ml-modules/root/custom-modules/ingestion/"));
        assertTrue(zipProjectEntries.contains("src/main/ml-modules/root/custom-modules/mapping/"));
        assertTrue(zipProjectEntries.contains("src/main/ml-modules/root/custom-modules/mapping-functions/"));
        assertTrue(zipProjectEntries.contains("src/main/ml-modules/root/custom-modules/matching/"));

        assertTrue(zipProjectEntries.contains("build.gradle"));
        assertTrue(zipProjectEntries.contains("gradle-local.properties"));
        assertTrue(zipProjectEntries.contains("gradle.properties"));
        assertTrue(zipProjectEntries.contains("gradlew"));
        assertTrue(zipProjectEntries.contains("gradlew.bat"));

        assertTrue(zipProjectEntries.contains("gradle/wrapper/gradle-wrapper.jar"));

        assertTrue(zipProjectEntries.contains("src/main/hub-internal-config/database-fields/staging-database.xml"));
        assertTrue(zipProjectEntries.contains("src/main/hub-internal-config/databases/staging-database.json"));
        assertTrue(zipProjectEntries.contains("src/main/hub-internal-config/security/amps/findProvenance.json"));
        assertTrue(zipProjectEntries.contains("src/main/hub-internal-config/security/privileges/data-hub-create-custom-privilege.json"));
        assertTrue(zipProjectEntries.contains("src/main/hub-internal-config/security/roles/data-hub-developer.json"));
        assertTrue(zipProjectEntries.contains("src/main/hub-internal-config/security/users/flow-developer-user.json"));
        assertTrue(zipProjectEntries.contains("src/main/hub-internal-config/triggers/ml-dh-entity-create.json"));
        assertTrue(zipProjectEntries.contains("src/main/hub-internal-config/servers/staging-server.json"));
        assertTrue(zipProjectEntries.contains("src/main/ml-config/servers/final-server.json"));
        assertTrue(zipProjectEntries.contains("src/main/ml-config/databases/final-database.json"));
        assertTrue(zipProjectEntries.contains("src/main/ml-config/database-fields/final-database.xml"));
    }
}
