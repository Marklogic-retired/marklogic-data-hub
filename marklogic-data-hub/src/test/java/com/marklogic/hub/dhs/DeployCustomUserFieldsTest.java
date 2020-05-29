package com.marklogic.hub.dhs;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.deploy.commands.DeployDatabaseFieldCommand;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class DeployCustomUserFieldsTest extends HubTestBase {

    @AfterEach
    void afterEach() {
        // dhsDeployer mucks around with appConfig, so gotta reset everything
        adminHubConfig.resetAppConfigs();
        adminHubConfig.resetHubConfigs();
        adminHubConfig.refreshProject();

        getDataHubAdminConfig();

        // Wipe out all fields/indexes
        String json = "{\n" +
            "  \"database-name\" : \"data-hub-FINAL\",\n" +
            "  \"field\" : [ ],\n" +
            "  \"range-field-index\" : [ ],\n" +
            "  \"range-path-index\" : [ ]\n" +
            "}";
        new DatabaseManager(adminHubConfig.getManageClient()).save(json);

        // Then run the command to deploy the OOTB fields/indexes
        new DeployDatabaseFieldCommand().execute(new CommandContext(adminHubConfig.getAppConfig(), adminHubConfig.getManageClient(), null));
    }

    @Test
    void test() throws IOException {
        File configDir = new File(new ClassPathResource("test-projects/user-fields").getFile(), "ml-config");
        if (configDir.exists()) {
            FileUtils.copyDirectory(configDir, adminHubConfig.getHubProject().getUserConfigDir().toFile());
        }

        // Get the initial counts of fields/indexes for later comparisons
        runAsDataHubDeveloper();
        ObjectNode db = readFinalDatabase();

        // Not verifying rangePathIndex because the version of ml-app-deployer used doesn't have that as a property.
        // But the fix for this on develop, slated for 5.3.0, is verifying it, and the fixed to DeployDatabaseFieldCommand
        // is the same.
        final int initialFieldCount = db.get("field").size();
        final int initialFieldIndexCount = db.get("range-field-index").size();
        final int initialPathIndexCount = db.get("range-path-index").size();

        // Deploy as a data-hub-developer
        new DhsDeployer().deployAsDeveloper(adminHubConfig);

        // Verify that the existing DH fields/indexes still exist, and we have the user fields/indexes too (1 of each)
        db = readFinalDatabase();
        assertEquals(initialFieldCount + 1, db.get("field").size());
        assertEquals(initialFieldIndexCount + 1, db.get("range-field-index").size());
        assertEquals(initialPathIndexCount + 1, db.get("range-path-index").size());
    }

    private ObjectNode readFinalDatabase() throws IOException {
        String json = new DatabaseManager(adminHubConfig.getManageClient()).getPropertiesAsJson(adminHubConfig.getDbName(DatabaseKind.FINAL));
        return (ObjectNode) ObjectMapperFactory.getObjectMapper().readTree(json);
    }
}
