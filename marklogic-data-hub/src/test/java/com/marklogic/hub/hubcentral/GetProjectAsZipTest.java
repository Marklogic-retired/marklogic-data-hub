package com.marklogic.hub.hubcentral;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;

import java.io.*;
import java.util.*;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

// Running in same thread to see if that helps avoid intermittent Jenkins failures related to zip files
@Execution(ExecutionMode.SAME_THREAD)
public class GetProjectAsZipTest extends AbstractHubCoreTest {

    private Set<String> zipProjectEntries;
    private File zipProjectFile;
    private AllArtifactsProject project;
    private List<ZipEntry> artifactZipEntries;
    private Properties gradleProps = new Properties();
    private Properties gradleDhsProps = new Properties();

    @Test
    void forbiddenUser() {
        runAsTestUserWithRoles("data-hub-operator");
        verifyTestUserIsForbiddenTo(() -> {
                try {
                    writeProjectToZipFile(getHubClient());
                } catch (IOException ex) {
                    throw new RuntimeException(ex);
                }
            },
            "A user must have the data-hub-download-project-files privilege"
        );
    }

    /**
     * @throws IOException
     */
    @Test
    void permittedUser() throws IOException {
        // Load all artifacts from the test project
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/all-artifacts");

        // Download the project, verify the zip is correct
        runAsTestUserWithRoles("hub-central-downloader");

        writeProjectToZipFileWithRetry(getHubClient());
        verifyZipProject();
        project.verifyZipArtifacts();


        // Clear out the test project directory and the user files in the database
        runAsAdmin();
        resetHubProject();

        // Unzip the project we downloaded in the beginning to the test project directory
        extractZipToProjectDirectory(zipProjectFile);

        // Verify that downloading returns a zip without artifacts, since the database was cleared of user files
        runAsTestUser();
        writeProjectToZipFileWithRetry(getHubClient());
        verifyZipProject();
        assertEquals(0, project.getHubCentralFilesZipEntries().size(), "The zip should be empty since the project was reset, and thus there are " +
            "no user artifacts to download; zipEntries: " + new AllArtifactsProject(getHubClient()).getHubCentralFilesZipEntries());

        // Install user artifacts from the test project directory, and verify everything's still there when we download them again
        runAsDataHubDeveloper();
        installUserArtifacts();

        runAsTestUser();
        writeProjectToZipFileWithRetry(getHubClient());
        verifyZipProject();
        project.verifyZipArtifacts();
    }

    /**
     * Reading the zip after it's written fails intermittently in Jenkins due to the following error:
     * java.util.zip.ZipException: invalid CEN header (bad signature)
     * It may be a bug in Java; thus, this method will try multiple times.
     *
     * @param hubClient
     */
    private void writeProjectToZipFileWithRetry(HubClient hubClient) {
        final int retryLimit = 10;
        int attempt = 1;
        do {
            try {
                logger.info("Attempting to write project to and read project from zip file; attempt: " + attempt);
                writeProjectToZipFile(hubClient);
                attempt = retryLimit + 1;
            } catch (ZipException ex) {
                logger.warn("Caught ZipException: " + ex + "; retrying, attempt: " + attempt);
                attempt++;
            } catch (IOException ex) {
                throw new RuntimeException("Unexpected IOException: " + ex.getMessage(), ex);
            }
        } while (attempt <= retryLimit);
    }

    private void writeProjectToZipFile(HubClient hubClient) throws IOException {
        zipProjectFile = new File("build/allProject.zip");
        try (FileOutputStream fos = new FileOutputStream(zipProjectFile)) {
            new HubCentralManager().writeProjectFilesAsZip(hubClient, fos);
        }
        project = new AllArtifactsProject(getHubClient());
        readZipProject();
        project.readZipArtifacts(new ZipFile(zipProjectFile), Collections.enumeration(artifactZipEntries));
    }

    private void readZipProject() throws IOException {
        zipProjectEntries = new HashSet<>();
        artifactZipEntries = new ArrayList<>();
        ZipFile zip = new ZipFile(zipProjectFile);

        String[] artifactDirs = {"flows", "steps", "entities", "src/main/entity-config", "src/main/ml-config/security/protected-paths",
            "src/main/ml-config/security/query-rolesets"};

        try (ZipInputStream zipIn = new ZipInputStream(new FileInputStream(zipProjectFile))) {
            ZipEntry entry = zipIn.getNextEntry();
            while (entry != null) {
                if ("gradle.properties".equals(entry.getName())) {
                    loadPropertiesFromZipEntry(zip, entry, gradleProps);
                }
                if ("gradle-dhs.properties".equals(entry.getName())) {
                    loadPropertiesFromZipEntry(zip, entry, gradleDhsProps);
                }
                if (Stream.of(artifactDirs).anyMatch(entry.getName()::startsWith) && !entry.isDirectory()) {
                    artifactZipEntries.add(entry);
                } else {
                    zipProjectEntries.add(entry.getName());
                }
                zipIn.closeEntry();
                entry = zipIn.getNextEntry();
            }
        }
    }

    private void loadPropertiesFromZipEntry(ZipFile zip, ZipEntry entry, Properties props) {
        try {
            InputStream ins = zip.getInputStream(entry);
            if (ins == null) {
                logger.warn("Received null InputStream for zip entry: " + entry.getName() + "; will ignore");
                return;
            }
            props.load(ins);
        } catch (Exception e) {
            logger.warn("Unable to load properties from zip entry: " + entry.getName() + "; cause: " + e.getMessage() +
                "entry size: " + entry.getSize());
        }
    }

    public void verifyZipProject() {
        assertEquals(HubConfig.DEFAULT_STAGING_NAME, gradleProps.getProperty("mlStagingDbName"));
        assertEquals(String.valueOf(HubConfig.DEFAULT_FINAL_PORT), gradleProps.getProperty("mlFinalPort"));
        assertEquals(HubConfig.DEFAULT_JOB_NAME, gradleProps.getProperty("mlJobAppserverName"));

        assertEquals("", gradleDhsProps.getProperty("mlUsername"));
        assertEquals("", gradleDhsProps.getProperty("mlPassword"));
        assertEquals("", gradleDhsProps.getProperty("mlHost"));
        assertEquals("true", gradleDhsProps.getProperty("hubDhs"));

        assertTrue(zipProjectEntries.contains("src/main/ml-modules/root/custom-modules/custom/"));
        assertTrue(zipProjectEntries.contains("src/main/ml-modules/root/custom-modules/ingestion/"));
        assertTrue(zipProjectEntries.contains("src/main/ml-modules/root/custom-modules/mapping/"));
        assertTrue(zipProjectEntries.contains("src/main/ml-modules/root/custom-modules/mapping-functions/"));
        assertTrue(zipProjectEntries.contains("src/main/ml-modules/root/custom-modules/matching/"));

        assertTrue(zipProjectEntries.contains("build.gradle"));
        assertTrue(zipProjectEntries.contains("gradle-local.properties"));
        assertTrue(zipProjectEntries.contains("gradle-dhs.properties"));
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
