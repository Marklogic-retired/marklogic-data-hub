package com.marklogic.hub.cli;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.mgmt.resource.security.UserManager;
import com.marklogic.rest.util.ResourcesFragment;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class InstallerTest extends HubTestBase {

    @Test
    public void testInitialization() throws IOException {
        Installer installer = new Installer(super.dataHub, super.adminHubConfig);

        File tempDir = new File(System.getProperty("java.io.tmpdir"), getClass().getName());
        if (tempDir.exists()) {
            FileUtils.deleteDirectory(tempDir);
        }
        tempDir.mkdirs();

        installer.initializeProject(tempDir);

        ObjectNode database = installer.readJsonFromFile(new File(tempDir, "src/main/ml-config/databases/final-database.json"));
        assertFalse(database.has("range-element-index"), "The empty range index should have been removed so that " +
            "it doesn't result in any user-defined indexes being lost");

        ResourcesFragment existingUsers = new UserManager(adminHubConfig.getManageClient()).getAsXml();

        ObjectNode flowDeveloper = installer.readJsonFromFile(new File(tempDir, "src/main/hub-internal-config/security/users/flow-developer-user.json"));
        ObjectNode flowOperator = installer.readJsonFromFile(new File(tempDir, "src/main/hub-internal-config/security/users/flow-operator-user.json"));

        // Account for the test app having been deployed or not (in theory, it's been deployed)
        if (existingUsers.resourceExists("flow-developer")) {
            assertFalse(flowDeveloper.has("password"));
        } else {
            assertTrue(flowDeveloper.has("password"));
        }

        if (existingUsers.resourceExists("flow-operator")) {
            assertFalse(flowOperator.has("password"));
        } else {
            assertTrue(flowOperator.has("password"));
        }
    }
}
