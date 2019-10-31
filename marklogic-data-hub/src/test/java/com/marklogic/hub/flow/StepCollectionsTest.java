package com.marklogic.hub.flow;


import com.marklogic.bootstrap.Installer;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.LoadTestModules;
import org.apache.commons.io.IOUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class StepCollectionsTest extends HubTestBase {

    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();

    @Autowired
    HubProject project;

    @Autowired
    HubConfig hubConfig;
    @Autowired
    private FlowManager flowManager;
    @Autowired
    private FlowRunner flowRunner;

    private boolean isSetup = false;

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().setupProject();
    }

    @AfterAll
    public static void teardown() {
        new Installer().teardownProject();
    }

    @AfterEach
    public void afterEach() {
        clearDatabases(HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    @BeforeEach
    public void beforeEach() throws IOException {
        if (!isSetup) {
            installProject();
            isSetup = true;
        }
        getDataHub().clearDatabase(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        getDataHub().clearDatabase(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);
    }

    private void installProject() throws IOException {
        LoadTestModules.loadTestModules(host, finalPort, secUser, secPassword, HubConfig.DEFAULT_MODULES_DB_NAME, hubConfig.getModulePermissions());
        String[] directoriesToCopy = new String[]{"input", "flows", "step-definitions", "entities", "mappings"};
        for (final String subDirectory : directoriesToCopy) {
            final Path subProjectPath = projectPath.resolve(subDirectory);
            subProjectPath.toFile().mkdir();
            Path subResourcePath = Paths.get("master-test", subDirectory);
            copyFileStructure(subResourcePath, subProjectPath);
        }
    }

    private void copyFileStructure(Path resourcePath, Path projectPath) throws IOException {
        for (File childFile: getResourceFile(resourcePath.toString().replaceAll("\\\\","/")).listFiles()) {
            if (childFile.isDirectory()) {
                Path subProjectPath = projectPath.resolve(childFile.getName());
                subProjectPath.toFile().mkdir();
                Path subResourcePath = resourcePath.resolve(childFile.getName());
                copyFileStructure(subResourcePath, subProjectPath);
            } else {
                Path projectFilePath = projectPath.resolve(childFile.getName());
                if (!projectFilePath.toFile().exists()) {
                    InputStream inputStream = getResourceStream(resourcePath.resolve(childFile.getName()).toString().replaceAll("\\\\", "/"));
                    Files.copy(inputStream, projectFilePath);
                    IOUtils.closeQuietly(inputStream);
                }
            }
        }
    }

    @Test
    public void testEntityServicesMappingStepCollections() throws Exception {
        Flow flow = flowManager.getFlow("collectionTestFlow");
        if (flow == null) {
            throw new Exception("collectionTestFlow Not Found");
        }
        flowRunner.runFlow("collectionTestFlow", Arrays.asList("1","5"));
        flowRunner.awaitCompletion();
        assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "person") > 0);
    }

    @Test
    public void testDefaultMappingStepCollections() throws Exception {
        Flow flow = flowManager.getFlow("collectionTestFlow");
        if (flow == null) {
            throw new Exception("collectionTestFlow Not Found");
        }
        flowRunner.runFlow("collectionTestFlow", Arrays.asList("1","5"));
        flowRunner.awaitCompletion();
        assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "person") > 0);
    }

    @Test
    public void testMappingStepCollectionsWithNoTargetEntity() throws Exception {
        Flow flow = flowManager.getFlow("collectionTestFlow");
        if (flow == null) {
            throw new Exception("collectionTestFlow Not Found");
        }
        flowRunner.runFlow("collectionTestFlow", Arrays.asList("1","2"));
        flowRunner.awaitCompletion();
        assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "person") == 0);
    }

    @Test
    public void testMasteringStepCollections() throws Exception {
        Flow flow = flowManager.getFlow("collectionTestFlow");
        if (flow == null) {
            throw new Exception("collectionTestFlow Not Found");
        }
        flowRunner.runFlow("collectionTestFlow", Arrays.asList("1","2"));
        flowRunner.awaitCompletion();
        int collDocCount = getDocCount(HubConfig.DEFAULT_FINAL_NAME, "person");
        assertTrue(collDocCount == 0);
        flowRunner.runFlow("collectionTestFlow", Arrays.asList("3","4"));
        flowRunner.awaitCompletion();
        assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "person") > collDocCount);
    }

    @Test
    public void testAnyStepDuplicateCollections() throws Exception {
        Flow flow = flowManager.getFlow("collectionTestFlow");
        String docName = "/person-1.json";
        String collectionName = "person";
        if (flow == null) {
            throw new Exception("collectionTestFlow Not Found");
        }
        flowRunner.runFlow("collectionTestFlow", Arrays.asList("1","7"));
        flowRunner.awaitCompletion();

        String reportQueryText = "xdmp:document-get-collections(\"" + docName + "\")";
        List<String> collections = getQueryResultsAsSequence(reportQueryText, HubConfig.DEFAULT_FINAL_NAME);

        assertEquals(1, Collections.frequency(collections, collectionName));
    }
}
