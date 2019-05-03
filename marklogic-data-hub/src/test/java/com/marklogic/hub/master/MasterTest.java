package com.marklogic.hub.master;

import com.marklogic.bootstrap.Installer;
import com.marklogic.hub.*;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.util.HubModuleManager;
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
            String[] directoriesToCopy = new String[]{"input", "flows", "src", "step-definitions", "entities", "mappings"};
            for (final String subDirectory: directoriesToCopy) {
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
                Files.copy(getResourceStream(resourcePath.resolve(childFile.getName()).toString().replaceAll("\\\\","/")), projectPath.resolve(childFile.getName()));
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

        installUserModules(getDataHubAdminConfig(), true);

        // Adding sleep to give the server enough time to act on triggers in both staging and final databases.
        Thread.sleep(1000);
        Flow flow = flowManager.getFlow("myNewFlow");
        if (flow == null) {
            throw new Exception("myNewFlow Not Found");
        }
        RunFlowResponse flowResponse = flowRunner.runFlow("myNewFlow", Arrays.asList("1","2","3"));
        flowRunner.awaitCompletion();
        RunStepResponse masterJob = flowResponse.getStepResponses().get("3");
        assertTrue(masterJob.isSuccess(), "Mastering job failed");
        assertTrue(getFinalDocCount("mdm-merged") >= 10,"At least 10 merges occur");
        assertTrue(getFinalDocCount("master") > 0, "Documents didn't receive master collection");
        assertEquals(209, getFinalDocCount("mdm-content"), "We end with the correct amount of final docs");
        assertEquals(40, getFinalDocCount("mdm-notification"), "Notifications have incorrect count");
    }
}
