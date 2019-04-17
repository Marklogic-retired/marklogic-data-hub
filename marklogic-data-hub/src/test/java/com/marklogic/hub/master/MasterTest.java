package com.marklogic.hub.master;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.bootstrap.Installer;
import com.marklogic.hub.*;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.legacy.flow.*;
import com.marklogic.hub.util.HubModuleManager;
import com.marklogic.hub.util.MlcpRunner;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class MasterTest extends HubTestBase {
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();

    @Autowired
    HubProject project;

    @Autowired
    HubConfig hubConfig;
    @Autowired
    private FlowManager flowManager;
    @Autowired
    private FlowRunner flowRunner;

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
    public void clearProjectData() {
        this.deleteProjectDir();
        clearDatabases(HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_JOB_NAME);
    }
    private void installProject() throws IOException, URISyntaxException {
            String[] directoriesToCopy = new String[]{"flows", "step-definitions", "entities", "mappings"};
            for (final String subDirectory: directoriesToCopy) {
                final Path subProjectPath = projectPath.resolve(subDirectory);
                subProjectPath.toFile().mkdir();
                Path subResourcePath = Paths.get("master-test", subDirectory);
                copyFileStructure(subResourcePath, subProjectPath);
            }

    }

    private void copyFileStructure(Path resourcePath, Path projectPath) throws IOException {
        for (File childFile: getResourceFile(resourcePath.toString()).listFiles()) {
            if (childFile.isDirectory()) {
                Path subProjectPath = projectPath.resolve(childFile.getName());
                subProjectPath.toFile().mkdir();
                Path subResourcePath = resourcePath.resolve(childFile.getName());
                copyFileStructure(subResourcePath, subProjectPath);
            } else {
                Files.copy(getResourceStream(resourcePath.resolve(childFile.getName()).toString()), projectPath.resolve(childFile.getName()));
            }
        }
    }

    private HubModuleManager getPropsMgr() {
        String timestampFile = getHubFlowRunnerConfig().getHubProject().getUserModulesDeployTimestampFile();
        return new HubModuleManager(timestampFile);
    }

    @Test
    public void testMasterStep() throws Exception {
        installProject();

        getDataHub().clearDatabase(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        getDataHub().clearDatabase(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        installUserModules(getFlowDeveloperConfig(), true);

        // Adding sleep to give the server enough time to act on triggers in both staging and final databases.
        Thread.sleep(1000);

        String inputPath = getResourceFile("master-test/input/").getAbsolutePath();
        String basePath = getResourceFile("master-test").getAbsolutePath();
        JsonNode mlcpOptions;
        try {
            String optionsJson =
                "{" +
                    "\"input_file_path\":\"" + inputPath.replace("\\", "\\\\\\\\") + "\"," +
                    "\"input_file_type\":\"\\\"documents\\\"\"," +
                    "\"document_type\":\"\\\"json\\\"\"," +
                    "\"output_collections\":\"\\\"mdm-content,default-ingestion\\\"\"," +
                    "\"output_permissions\":\"\\\"rest-reader,read,rest-writer,update\\\"\"," +
                    "\"output_uri_replace\":\"\\\"" + basePath.replace("\\", "/").replaceAll("^([A-Za-z]):", "/$1:") + ",''\\\"\"" +
                    "}";
            mlcpOptions = new ObjectMapper().readTree(optionsJson);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        // TODO Is there a way to do this with updated flows?
        LegacyFlow legacyFlow = LegacyFlowBuilder.newFlow()
            .withEntityName("mdm-content")
            .withName("default-ingestion")
            .withType(FlowType.INPUT)
            .withCodeFormat(CodeFormat.JAVASCRIPT)
            .withDataFormat(DataFormat.JSON)
            .build();

        MlcpRunner mlcpRunner = new MlcpRunner(null, "com.marklogic.hub.util.MlcpMain", getFlowDeveloperConfig(), legacyFlow, flowRunnerClient, mlcpOptions, null);
        mlcpRunner.start();
        try {
            mlcpRunner.join();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        Flow flow = flowManager.getFlow("myNewFlow");
        if (flow == null) {
            throw new Exception("myNewFlow Not Found");
        }
        RunFlowResponse flowResponse = flowRunner.runFlow("myNewFlow", Arrays.asList("3"));
        flowRunner.awaitCompletion();
        Job masterJob = flowResponse.getStepResponses().get("3");
        assertTrue(masterJob.isSuccess());
        assertEquals(40, getStagingDocCount("mdm-notification"));
        assertEquals(10,getStagingDocCount("mdm-merged"));
    }
}
