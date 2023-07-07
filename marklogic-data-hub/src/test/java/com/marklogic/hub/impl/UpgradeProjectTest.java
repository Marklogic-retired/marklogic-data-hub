package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.api.database.ElementIndex;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import com.marklogic.rest.util.Fragment;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests various upgrade scenarios. General approach is to copy a stubbed out project from
 * src/test/resources/upgrade-projects into the build directory (a non-version-controlled area) where it
 * can then be upgraded and verified.
 */
@Execution(ExecutionMode.SAME_THREAD)
public class UpgradeProjectTest extends AbstractHubCoreTest {

    @Autowired
    FlowManagerImpl flowManager;

    @Test
    void localProjectIsPre430() {
        copyTestProjectToTempDirectory("pre430");
        try {
            new DataHubImpl(getHubConfig()).verifyLocalProjectIs430OrGreater();
            fail("Expected an error because the internal triggers directory indicates that the project is before version 4.3.0");
        } catch (RuntimeException ex) {
            assertTrue(ex.getMessage().contains("version is less than 4.3.0"), "Unexpected error message: " + ex.getMessage());
        }
    }

    @Test
    void localProjectIs430() {
        copyTestProjectToTempDirectory("version430");
        // No exception is expected because the internal triggers directory indicates that the project is version
        // 4.3.0 or greater
        new DataHubImpl(getHubConfig()).verifyLocalProjectIs430OrGreater();
    }

    @Test
    public void upgrade43xToCurrentVersion() throws IOException {
        final HubProjectImpl hubProject = getHubProject();
        final File projectDir = copyTestProjectToTempDirectory("dhf43x");
        // This test is a little awkward because it's not clear if dataHub.upgradeProject can just be called in the
        // context of this test. So instead, some methods called by that method are called directly here.
        dataHub.prepareProjectBeforeUpgrading(hubProject, getHubConfig().getJarVersion());
        hubProject.init(new HashMap<>());
        hubProject.upgradeProject(flowManager);
        hubProject.upgradeLegacyFlows(flowManager);

        File mappingDir = new File(projectDir, "mappings");
        File entitiesDir = new File(projectDir, "entities");
        verifyDirContents(mappingDir, 1);
        verifyDirContents(entitiesDir, 3);

        File finalDbFile = hubProject.getUserConfigDir().resolve("databases").resolve("final-database.json").toFile();
        ObjectNode db = (ObjectNode) ObjectMapperFactory.getObjectMapper().readTree(finalDbFile);
        assertFalse(db.has("range-element-index"),
            "range-element-index should have been removed because it was set to an empty array, which can cause " +
                "unnecessary reindexing");
        assertEquals("Parent", db.get("range-element-attribute-index").get(0).get("parent-localname").asText(),
            "Other existing indexes should have been retained though; only range-element-index should have been removed");

        File internalConfigBackupDir = hubProject.getProjectDir().resolve("src").resolve("main").resolve("hub-internal-config-pre-".concat(getHubConfig().getJarVersion())).toFile();
        assertTrue(internalConfigBackupDir.exists(), "The prepareProjectBeforeUpgrading method should backup the " +
            "hub-internal-config directory in the rare event that a user has made changes to this directory and doesn't want to " +
            "lose them (though a user really shouldn't be doing that)");

        File mlConfigBackupDir = hubProject.getProjectDir().resolve("src").resolve("main").resolve("ml-config-5.0.3").toFile();
        assertFalse(mlConfigBackupDir.exists(), "As of DHFPROD-3159, ml-config should no longer be backed up. DHF rarely needs to " +
            "change the files in this directory, and when it does need to, it'll make changes directly to the files so as to not " +
            "lose changes made by users.");

        File mappingFunctionsDir = hubProject.getCustomMappingFunctionsDir().toFile();
        assertTrue(mappingFunctionsDir.exists(), "The initialization process should stub out the directory for " +
            "mapping functions so that the user has more of a clue as to where they go");

        File finalFieldsFile = hubProject.getUserConfigDir().resolve("database-fields").resolve("final-database.xml").toFile();
        assertTrue(finalFieldsFile.exists());

        File stagingFieldsFile = hubProject.getHubConfigDir().resolve("database-fields").resolve("staging-database.xml").toFile();
        assertTrue(stagingFieldsFile.exists());

        File jobFieldsFile = hubProject.getHubConfigDir().resolve("database-fields").resolve("job-database.xml").toFile();
        assertTrue(jobFieldsFile.exists());

        assertTrue(hubProject.getHubSecurityDir().resolve("roles").resolve("data-hub-job-reader.json").toFile().exists());
        assertTrue(hubProject.getHubSecurityDir().resolve("roles").resolve("data-hub-job-internal.json").toFile().exists());
        assertTrue(hubProject.getHubSecurityDir().resolve("roles").resolve("data-hub-flow-reader.json").toFile().exists());
        assertTrue(hubProject.getHubSecurityDir().resolve("roles").resolve("data-hub-flow-writer.json").toFile().exists());
        assertTrue(hubProject.getHubSecurityDir().resolve("roles").resolve("data-hub-module-writer.json").toFile().exists());
        assertTrue(hubProject.getHubSecurityDir().resolve("roles").resolve("data-hub-mapping-reader.json").toFile().exists());
        assertTrue(hubProject.getHubSecurityDir().resolve("roles").resolve("data-hub-mapping-writer.json").toFile().exists());
        assertTrue(hubProject.getHubSecurityDir().resolve("roles").resolve("data-hub-step-definition-reader.json").toFile().exists());
        assertTrue(hubProject.getHubSecurityDir().resolve("roles").resolve("data-hub-step-definition-writer.json").toFile().exists());
        assertTrue(hubProject.getHubSecurityDir().resolve("roles").resolve("data-hub-entity-model-reader.json").toFile().exists());
        assertTrue(hubProject.getHubSecurityDir().resolve("roles").resolve("data-hub-entity-model-writer.json").toFile().exists());
        assertTrue(hubProject.getHubSecurityDir().resolve("amps").resolve("updateJob.json").toFile().exists());

        ObjectMapper mapper = new ObjectMapper();
        File flowOpRole = hubProject.getHubSecurityDir().resolve("roles").resolve("flow-operator-role.json").toFile();
        assertTrue(mapper.readTree(flowOpRole).get("role").toString().contains("data-hub-operator"), "As of DHFPROD-3619, flow-operator-role should inherit data-hub-operator");

        File flowDevRole = hubProject.getHubSecurityDir().resolve("roles").resolve("flow-developer-role.json").toFile();
        assertTrue(mapper.readTree(flowDevRole).get("role").toString().contains("data-hub-developer"), "As of DHFPROD-3619, flow-developer-role should inherit data-hub-developer");

        //per DHFPROD-3617, following properties shouldn't be there in gradle.properties after hubInit is run. Users can adjust these if needed
        String props = FileUtils.readFileToString(hubProject.getProjectDir().resolve("gradle.properties").toFile(), StandardCharsets.UTF_8);
        assertFalse(props.contains("mlEntityPermissions"));
        assertFalse(props.contains("mlFlowPermissions"));
        assertFalse(props.contains("mlMappingPermissions"));
        assertFalse(props.contains("mlStepDefinitionPermissions"));
        assertFalse(props.contains("mlJobPermissions"));
        assertFalse(props.contains("mlModulePermissions"));

        File finalDatabaseXmlFile = hubProject.getUserConfigDir().resolve("database-fields").resolve("final-database.xml").toFile();
        Fragment finalDatabaseXmlProps = new Fragment(new String(FileCopyUtils.copyToByteArray(finalDatabaseXmlFile), StandardCharsets.UTF_8));
        // This doesn't really matter because we know the file didn't exist before, but doesn't hurt to verify these things
        UpgradeFinalDatabaseXmlFileTest.verify540ChangesAreApplied(finalDatabaseXmlProps);

        // Check that artifact directories are created
        assertTrue(hubProject.getProjectDir().resolve("entities").toFile().exists());
        assertTrue(hubProject.getProjectDir().resolve("step-definitions").toFile().exists());
        assertTrue(hubProject.getProjectDir().resolve("steps").toFile().exists());
        verify4xUpgradedFlows();
    }

    @Test
    public void upgradeDhcceToCurrentVersion() throws IOException {
        final File projectDir = copyTestProjectToTempDirectory("dhcce");
        final HubProject hubProject = getHubProject();

        hubProject.upgradeProject(flowManager);

        File conceptConnectorModelsDir = new File(projectDir, "conceptConnectorModels");
        verifyDirContents(conceptConnectorModelsDir, 1);
        File entitiesDir = new File(projectDir, "entities");
        verifyDirContents(entitiesDir, 3);
        File claimFhir = entitiesDir.toPath().resolve("ClaimFHIR.entity.json").toFile();
        JsonNode claimFhirNode = ObjectMapperFactory.getObjectMapper().readTree(claimFhir);
        JsonNode hasItem = claimFhirNode.path("definitions").path("ClaimFHIR")
                .path("properties").path("hasItem");
        assertEquals("http://marklogic.com/ClaimItem-0.0.1/ClaimItem", hasItem.path("items").path("relatedEntityType").asText());
        assertEquals("claimId", hasItem.path("items").path("joinPropertyName").asText());
        assertEquals("string", hasItem.path("items").path("datatype").asText());
        File member = entitiesDir.toPath().resolve("Member.entity.json").toFile();
        JsonNode memberNode = ObjectMapperFactory.getObjectMapper().readTree(member);
        JsonNode hasDependent = memberNode.path("definitions").path("Member")
                .path("properties").path("hasDependent");
        assertEquals("http://marklogic.com/Member-0.0.1/Member", hasDependent.path("items").path("relatedEntityType").asText());
        assertEquals("PrimaryInsuredId", hasDependent.path("items").path("joinPropertyName").asText());
        assertEquals("string", hasDependent.path("items").path("datatype").asText());
        JsonNode hasClaim = memberNode.path("definitions").path("Member")
                .path("properties").path("hasClaim");
        assertEquals("http://marklogic.com/ClaimFHIR-0.0.1/ClaimFHIR", hasClaim.path("items").path("relatedEntityType").asText());
        assertEquals("patient", hasClaim.path("items").path("joinPropertyName").asText());
        assertEquals("string", hasClaim.path("items").path("datatype").asText());
    }

    @Test
    public void hasEmptyRangeElementIndexArray() {
        HubProjectImpl project = new HubProjectImpl();

        Database db = new Database(null, "data-hub-FINAL");
        assertFalse(HubProjectImpl.hasEmptyRangeElementIndexArray(db.toObjectNode()),
            "False should be returned since the range-element-index field isn't set");

        db.setRangeElementIndex(new ArrayList<>());
        assertTrue(HubProjectImpl.hasEmptyRangeElementIndexArray(db.toObjectNode()));

        ElementIndex index = new ElementIndex();
        index.setLocalname("example");
        db.getRangeElementIndex().add(index);
        assertFalse(HubProjectImpl.hasEmptyRangeElementIndexArray(db.toObjectNode()));
    }

    @Test
    public void testUpgradeTo510MappingStep() throws IOException{
        FileUtils.copyFileToDirectory(getResourceFile("mapping-test/flows/CustomerXML.flow.json"), getHubProject().getFlowsDir().toFile());
        FileUtils.copyDirectory(getResourceFile("flow-runner-test/flows"), getHubProject().getFlowsDir().toFile());
        File testCsvLoadDataFile = getHubProject().getFlowsDir().resolve("testCsvLoadData.flow.json").toFile();
        long testCsvLoadDataFlowLastModified =  testCsvLoadDataFile.lastModified();
        File testFlowFile = getHubProject().getFlowsDir().resolve("testFlow.flow.json").toFile();
        long testFlowLastModified =  testFlowFile.lastModified();
        getHubProject().updateStepDefinitionTypeForInlineMappingSteps(flowManager);
        //Flow is not saved unless it has been modified(i.e. mapping step with step def "default-mapping")
        Assertions.assertEquals(testCsvLoadDataFlowLastModified, testCsvLoadDataFile.lastModified());
        Assertions.assertNotEquals(testFlowLastModified, testFlowFile.lastModified());
        Assertions.assertEquals("entity-services-mapping", flowManager.getLocalFlow("testFlow").getStep("6").getStepDefinitionName());
        Assertions.assertEquals("entity-services-mapping", flowManager.getLocalFlow("CustomerXML").getStep("2").getStepDefinitionName());
    }

    @Test
    public void onlyLegacyEntitiesUpgrade() throws IOException {
        HubProjectImpl hubProject = setUpProject("dhf43x", "onlyLegacyEntitiesUpgrade");
        List<String> legacyEntities = new ArrayList<>();
        List<String> legacyFlowTypes = new ArrayList<>();
        List<String> legacyFlowNames = new ArrayList<>();
        legacyEntities.add("Customer");
        legacyEntities.add("Product");
        hubProject.upgradeLegacyFlows(flowManager, legacyEntities, legacyFlowTypes, legacyFlowNames);
        assertTrue(hubProject.getFlowsDir().resolve("dh_Upgrade_CustomerFlow.flow.json").toFile().exists());
        assertTrue(hubProject.getFlowsDir().resolve("dh_Upgrade_ProductFlow.flow.json").toFile().exists());
        assertFalse(hubProject.getFlowsDir().resolve("dh_Upgrade_OrderFlow.flow.json").toFile().exists());
    }

    @Test
    public void onlyFlowTypeUpgrade() throws IOException {
        HubProjectImpl hubProject = setUpProject("dhf43x", "onlyFlowTypeUpgrade");
        List<String> legacyEntities = new ArrayList<>();
        List<String> legacyFlowTypes = new ArrayList<>();
        List<String> legacyFlowNames = new ArrayList<>();
        legacyFlowTypes.add("input");
        hubProject.upgradeLegacyFlows(flowManager, legacyEntities, legacyFlowTypes, legacyFlowNames);
        assertTrue(hubProject.getStepsPath(StepDefinition.StepDefinitionType.INGESTION).toFile().exists());
        assertFalse(hubProject.getStepsPath(StepDefinition.StepDefinitionType.CUSTOM).toFile().exists());
    }

    @Test
    public void onlyFlowNamesUpgrade() throws IOException {
        HubProjectImpl hubProject = setUpProject("dhf43x", "onlyFlowNamesUpgrade");
        List<String> legacyEntities = new ArrayList<>();
        List<String> legacyFlowTypes = new ArrayList<>();
        List<String> legacyFlowNames = new ArrayList<>();
        legacyFlowNames.add("Load Customers");
        legacyFlowNames.add("Harmonize Products");
        hubProject.upgradeLegacyFlows(flowManager, legacyEntities, legacyFlowTypes, legacyFlowNames);
        assertTrue(hubProject.getStepsPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadCustomers.step.json").toFile().exists());
        assertFalse(hubProject.getStepsPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadOrders.step.json").toFile().exists());
        assertFalse(hubProject.getStepsPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadProducts.step.json").toFile().exists());
        assertTrue(hubProject.getStepsPath(StepDefinition.StepDefinitionType.CUSTOM).resolve("HarmonizeProducts.step.json").toFile().exists());
    }

    @Test
    public void entityAndFlowNameUpgrade() throws IOException {
        HubProjectImpl hubProject = setUpProject("dhf43x", "entityAndFlowNameUpgrade");
        List<String> legacyEntities = new ArrayList<>();
        List<String> legacyFlowTypes = new ArrayList<>();
        List<String> legacyFlowNames = new ArrayList<>();
        legacyEntities.add("Customer");
        legacyFlowNames.add("Load Customers");
        legacyFlowNames.add("Harmonize Products");
        hubProject.upgradeLegacyFlows(flowManager, legacyEntities, legacyFlowTypes, legacyFlowNames);
        assertTrue(hubProject.getStepsPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadCustomers.step.json").toFile().exists());
        assertFalse(hubProject.getStepsPath(StepDefinition.StepDefinitionType.CUSTOM).resolve("HarmonizeProducts.step.json").toFile().exists());
    }

    @Test
    public void entityAndFlowTypeUpgrade() throws IOException {
        HubProjectImpl hubProject = setUpProject("dhf43x", "entityAndFlowTypeUpgrade");
        List<String> legacyEntities = new ArrayList<>();
        List<String> legacyFlowTypes = new ArrayList<>();
        List<String> legacyFlowNames = new ArrayList<>();
        legacyEntities.add("Product");
        legacyFlowTypes.add("input");
        hubProject.upgradeLegacyFlows(flowManager, legacyEntities, legacyFlowTypes, legacyFlowNames);
        assertTrue(hubProject.getStepsPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadProducts.step.json").toFile().exists());
        assertFalse(hubProject.getStepsPath(StepDefinition.StepDefinitionType.CUSTOM).resolve("HarmonizeProducts.step.json").toFile().exists());
    }

    @Test
    public void nonExistentFlowName() throws IOException {
        HubProjectImpl hubProject = setUpProject("dhf43x", "nonExistentFlowName");
        List<String> legacyEntities = new ArrayList<>();
        List<String> legacyFlowTypes = new ArrayList<>();
        List<String> legacyFlowNames = new ArrayList<>();
        legacyFlowNames.add("NonExistentFlow");
        hubProject.upgradeLegacyFlows(flowManager, legacyEntities, legacyFlowTypes, legacyFlowNames);
        assertEquals(0, hubProject.getFlowsDir().toFile().listFiles().length);
    }

    @Test
    public void multipleLegacyFlowUpgrades() throws IOException {
        HubProjectImpl hubProject = setUpProject("dhf43x", "multipleLegacyFlowUpgrades");

        List<String> legacyEntities = new ArrayList<>();
        List<String> legacyFlowTypes = new ArrayList<>();
        List<String> legacyFlowNames = new ArrayList<>();
        legacyFlowTypes.add("input");
        hubProject.upgradeLegacyFlows(flowManager, legacyEntities, legacyFlowTypes, legacyFlowNames);

        assertTrue(hubProject.getStepsPath(StepDefinition.StepDefinitionType.INGESTION).toFile().exists());
        assertFalse(hubProject.getStepsPath(StepDefinition.StepDefinitionType.CUSTOM).toFile().exists());

        legacyFlowTypes = new ArrayList<>();
        hubProject.upgradeLegacyFlows(flowManager, legacyEntities, legacyFlowTypes, legacyFlowNames);
        verify4xUpgradedFlows();
    }

    @Test
    public void runUpgradedLegacyFlows() throws IOException {
        HubProjectImpl hubProject = setUpProject("hr-hub", "runUpgradedLegacyFlows");
        hubProject.upgradeLegacyFlows(flowManager);

        deployAsDeveloper(getHubConfig());
        int stagingDbCount = getStagingDocCount();
        int finalDbCount = getFinalDocCount();

        FlowInputs inputs = new FlowInputs();
        inputs.setFlowName("dh_Upgrade_EmployeeFlow");
        inputs.setInputFilePath("input/AcmeTech");
        String stepNum = getStepNumFromStepName("dh_Upgrade_EmployeeFlow", "load-acme-tech");
        inputs.setSteps(Arrays.asList(stepNum));
        RunFlowResponse inputStepResponse = runFlow(inputs);
        logger.info("inputStepResponse RunFlow Response: " + inputStepResponse);
        assertEquals(stagingDbCount + 2, getStagingDocCount(), "Two documents in the input/AcmeTech should be written");

        waitForReindex(getHubClient(), "data-hub-STAGING");

        inputs = new FlowInputs();
        inputs.setFlowName("dh_Upgrade_EmployeeFlow");
        stepNum = getStepNumFromStepName("dh_Upgrade_EmployeeFlow", "harmonize-acme-tech");
        inputs.setSteps(Arrays.asList(stepNum));
        RunFlowResponse customStepResponse = runFlow(inputs);
        logger.info("customStepResponse RunFlow Response: " + customStepResponse);
        assertEquals(finalDbCount + 2, getFinalDocCount(), "Two input documents should be harmonized and written into final db");
    }

    @Test
    public void runUpgradedLegacyFlowsNonUris() throws IOException {
        StepManager stepManager = new StepManager(getHubConfig());
        HubProjectImpl hubProject = setUpProject("hr-hub", "runUpgradedLegacyFlowsNonUris");
        hubProject.upgradeLegacyFlows(flowManager);

        ObjectNode node = stepManager.getLocalStepAsJSON("LoadOrders-ingestion");
        node.put("sourceFormat", "csv");
        stepManager.saveLocalStep(node);

        deployAsDeveloper(getHubConfig());
        int stagingDbCount = getStagingDocCount();
        int finalDbCount = getFinalDocCount();

        FlowInputs inputs = new FlowInputs();
        inputs.setFlowName("dh_Upgrade_OrderFlow");
        inputs.setInputFilePath("input/orders");
        inputs.setSteps(Arrays.asList("1"));
        runFlow(inputs);
        assertEquals(stagingDbCount + 1, getStagingDocCount(), "1 document in the input/orders should be written");

        waitForReindex(getHubClient(), "data-hub-STAGING");
        inputs = new FlowInputs();
        inputs.setFlowName("dh_Upgrade_OrderFlow");
        inputs.setSteps(Arrays.asList("2"));
        runFlow(inputs);
        assertEquals(finalDbCount + 1, getFinalDocCount(), "1 harmonized record should be written into final db");
    }

    @Test
    public void runUpgradedLegacyFlowsFromCsv() throws IOException {
        StepManager stepManager = new StepManager(getHubConfig());
        HubProjectImpl hubProject = setUpProject("hr-hub", "runUpgradedLegacyFlowsFromCsv");
        hubProject.upgradeLegacyFlows(flowManager);

        ObjectNode node = stepManager.getLocalStepAsJSON("load-global-corp-ingestion");
        node.put("sourceFormat", "csv");
        stepManager.saveLocalStep(node);

        Path inputPath = getHubProject().getProjectDir().resolve("input").resolve("AcmeTech");
        logger.info("Files in the input path: " + inputPath.toFile().listFiles().length);

        deployAsDeveloper(getHubConfig());
        int stagingDbCount = getStagingDocCount();
        int finalDbCount = getFinalDocCount();

        FlowInputs inputs = new FlowInputs();
        Map<String, Object> options = new HashMap<>();
        inputs.setFlowName("dh_Upgrade_EmployeeFlow");
        inputs.setInputFilePath("input/GlobalCorp");

        String stepNum = getStepNumFromStepName("dh_Upgrade_EmployeeFlow", "load-global-corp");
        inputs.setSteps(Arrays.asList(stepNum));
        inputs.setOptions(options);
        runFlow(inputs);
        assertEquals(stagingDbCount + 15, getStagingDocCount(), "15 documents in the input/GlobalCorp should be written");

        waitForReindex(getHubClient(), "data-hub-STAGING");
        inputs = new FlowInputs();
        inputs.setFlowName("dh_Upgrade_EmployeeFlow");
        stepNum = getStepNumFromStepName("dh_Upgrade_EmployeeFlow", "harmonize-global-corp");
        inputs.setSteps(Arrays.asList(stepNum));
        runFlow(inputs);
        assertEquals(finalDbCount + 5, getFinalDocCount(), "5 harmonized Employee documents are written into final db");
    }

    private void verifyDirContents(File dir, int expectedCount) {
        assertEquals(expectedCount, dir.listFiles().length);
    }

    private File copyTestProjectToTempDirectory(String projectName) {
        return copyTestProjectToTempDirectory(projectName, projectName);
    }

    private File copyTestProjectToTempDirectory(String projectName, String destProjectName) {
        final String projectPath = "build/tmp/upgrade-projects/" + destProjectName;
        final File projectDir = Paths.get(projectPath).toFile();
        try {
            if(projectDir.exists()) {
                FileUtils.forceDelete(projectDir);
            }
            FileUtils.copyDirectory(Paths.get("src/test/resources/upgrade-projects/" + projectName).toFile(), projectDir);
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
        getHubProject().createProject(projectPath);
        return projectDir;
    }

    private void verify4xUpgradedFlows() throws IOException {
        HubProject hubProject = getHubProject();
        assertTrue(hubProject.getProjectDir().resolve("flows").toFile().exists());

        // Check flows are upgraded
        assertTrue(hubProject.getFlowsDir().resolve("dh_Upgrade_CustomerFlow.flow.json").toFile().exists());
        assertTrue(hubProject.getFlowsDir().resolve("dh_Upgrade_OrderFlow.flow.json").toFile().exists());
        assertTrue(hubProject.getFlowsDir().resolve("dh_Upgrade_ProductFlow.flow.json").toFile().exists());

        // Verify input/Load steps are created before harmonize/custom steps
        assertEquals("LoadProducts-ingestion", flowManager.getLocalFlow("dh_Upgrade_ProductFlow").getStep("1").getStepId());
        assertEquals("HarmonizeProducts-custom", flowManager.getLocalFlow("dh_Upgrade_ProductFlow").getStep("2").getStepId());

        // Check steps are created
        assertTrue(hubProject.getStepsPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadCustomers.step.json").toFile().exists());
        assertTrue(hubProject.getStepsPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadOrders.step.json").toFile().exists());
        assertTrue(hubProject.getStepsPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadProducts.step.json").toFile().exists());
        assertTrue(hubProject.getStepsPath(StepDefinition.StepDefinitionType.CUSTOM).resolve("HarmonizeProducts.step.json").toFile().exists());

        // Check step definitions are created
        assertTrue(hubProject.getStepDefinitionPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadCustomers").toFile().exists());
        assertTrue(hubProject.getStepDefinitionPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadCustomers").resolve("LoadCustomers.step.json").toFile().exists());
        assertTrue(hubProject.getStepDefinitionPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadOrders").toFile().exists());
        assertTrue(hubProject.getStepDefinitionPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadOrders").resolve("LoadOrders.step.json").toFile().exists());
        assertTrue(hubProject.getStepDefinitionPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadProducts").toFile().exists());
        assertTrue(hubProject.getStepDefinitionPath(StepDefinition.StepDefinitionType.INGESTION).resolve("LoadProducts").resolve("LoadProducts.step.json").toFile().exists());
        assertTrue(hubProject.getStepDefinitionPath(StepDefinition.StepDefinitionType.CUSTOM).resolve("HarmonizeProducts").toFile().exists());
        assertTrue(hubProject.getStepDefinitionPath(StepDefinition.StepDefinitionType.CUSTOM).resolve("HarmonizeProducts").resolve("HarmonizeProducts.step.json").toFile().exists());

        // Check step definition custom modules are created
        assertNotNull(hubProject.getCustomModuleDir("LoadCustomers", StepDefinition.StepDefinitionType.INGESTION.toString()));
        assertNotNull(hubProject.getCustomModuleDir("LoadOrders", StepDefinition.StepDefinitionType.INGESTION.toString()));
        assertNotNull(hubProject.getCustomModuleDir("LoadProducts", StepDefinition.StepDefinitionType.INGESTION.toString()));
        assertNotNull(hubProject.getCustomModuleDir("HarmonizeProducts", StepDefinition.StepDefinitionType.CUSTOM.toString()));

        // Validate source module options are added
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(hubProject.getStepFile(StepDefinition.StepDefinitionType.CUSTOM, "HarmonizeProducts"));
        assertEquals("sourceModule", node.get("selectedSource").asText());
        assertEquals(true, node.get("isUpgradedLegacyFlow").asBoolean());
        assertNotNull(node.get("sourceModule"));
        assertEquals("/entities/Product/harmonize/Harmonize Products/collector.sjs", node.get("sourceModule").get("modulePath").asText());
        assertEquals("collect", node.get("sourceModule").get("functionName").asText());
        assertNotNull(node.get("options"));
        assertEquals("Harmonize Products", node.get("options").get("flow").asText());
        assertEquals("Product", node.get("options").get("entity").asText());
        assertEquals("json", node.get("options").get("dataFormat").asText());
        assertEquals("/entities/Product/harmonize/Harmonize Products/main.sjs", node.get("options").get("mainModuleUri").asText());
    }

    private HubProjectImpl setUpProject(String sourceProjectName, String destProjectName) throws IOException {
        runAsDataHubDeveloper();
        final HubProjectImpl hubProject = getHubProject();
        copyTestProjectToTempDirectory(sourceProjectName, destProjectName);
        getHubConfig().setHubProject(hubProject);
        hubProject.init(getHubConfig().getAppConfig().getCustomTokens());
        hubProject.upgradeProject(flowManager);
        getHubConfig().refreshProject();
        runAsDataHubDeveloper();
        return hubProject;
    }

    public String getStepNumFromStepName(String flowName, String stepName) throws IOException {
        Flow flow = flowManager.getFullFlow(flowName);
        Map<String, Step> stepsMap = flow.getSteps();
        for (String key : flow.getSteps().keySet()) {
            if(stepName.equals(stepsMap.get(key).getName())) {
                return key;
            }
        }
        return "0";
    }

}
