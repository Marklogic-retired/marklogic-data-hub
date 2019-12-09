package com.marklogic.hub;

import com.marklogic.bootstrap.Installer;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
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

import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
@TestMethodOrder(OrderAnnotation.class)
public class CustomStepE2E extends HubTestBase{

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
    @Autowired
    private EntityManager em;

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().setupProject();
    }

    @AfterAll
    public static void teardown() {
        new Installer().teardownProject();
    }

    private void installProject() throws IOException, URISyntaxException {
        String[] directoriesToCopy = new String[]{"input", "flows", "step-definitions", "entities", "mappings", "src/main/ml-modules/root/custom-modules"};
        for (final String subDirectory: directoriesToCopy) {
            final Path subProjectPath = projectPath.resolve(subDirectory);
            subProjectPath.toFile().mkdir();
            Path subResourcePath = Paths.get("mapping-test", subDirectory);
            copyFileStructure(subResourcePath, subProjectPath);
        }
        em.saveDbIndexes();
        dataHub.updateIndexes();

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

    @Test
    @Order(1)
    public void testCustomIngestionStep() throws Exception{
        installProject();

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        Flow flow = flowManager.getFlow("Admissions");
        if (flow == null) {
            throw new Exception("Admissions Flow Not Found");
        }
        //Running all three ingestion steps here for E2E, but its the 3rd step that is of type custom ingestion
        RunFlowResponse flowResponse = flowRunner.runFlow("Admissions", Arrays.asList("1","2","3"));
        flowRunner.awaitCompletion();
        RunStepResponse ingestionJob = flowResponse.getStepResponses().get("3");
        assertTrue(ingestionJob.isSuccess(), "Custom ingestion job failed: "+ingestionJob.stepOutput);
        assertTrue(getStagingDocCount("LabsCore") == 806,"There should be 806 doc in LabsCore collection, found: " + getStagingDocCount("LabsCore"));
    }

    @Test
    @Order(2)
    public void testCustomMappingStep() throws Exception{
        installUserModules(getDataHubAdminConfig(), true);

        Flow flow = flowManager.getFlow("Admissions");
        if (flow == null) {
            throw new Exception("Admissions Flow Not Found");
        }
        //Running custom mapping step
        RunFlowResponse flowResponse = flowRunner.runFlow("Admissions", Arrays.asList("4"));
        flowRunner.awaitCompletion();
        RunStepResponse mappingJob = flowResponse.getStepResponses().get("4");
        assertTrue(mappingJob.isSuccess(), "Custom mapping job failed: "+mappingJob.stepOutput);
        assertTrue(getFinalDocCount("CompletedAdmissions") == 372,"There should be 372 doc in CompletedAdmissions collection, found: " + getFinalDocCount("CompletedAdmissions"));
    }

    @Test
    @Order(3)
    public void testCustomMasteringStep() throws Exception{
        installUserModules(getDataHubAdminConfig(), true);

        Flow flow = flowManager.getFlow("Admissions");
        if (flow == null) {
            throw new Exception("Admissions Flow Not Found");
        }
        //Running custom mastering step
        RunFlowResponse flowResponse = flowRunner.runFlow("Admissions", Arrays.asList("5"));
        flowRunner.awaitCompletion();
        RunStepResponse masteringJob = flowResponse.getStepResponses().get("5");
        assertTrue(masteringJob.isSuccess(), "Custom mastering job failed: "+masteringJob.stepOutput);
        assertTrue(getFinalDocCount("mdm-content") == 372,"There should be 372 doc in mdm-content collection, found: " + getFinalDocCount("mdm-content"));
    }
}
