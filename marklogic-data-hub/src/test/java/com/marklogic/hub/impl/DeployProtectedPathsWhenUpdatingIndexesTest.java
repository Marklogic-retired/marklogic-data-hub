package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.mgmt.resource.security.ProtectedPathManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.AfterEach;
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
public class DeployProtectedPathsWhenUpdatingIndexesTest extends HubTestBase {

    private final static String TEST_PATH_EXPRESSION = "/envelope//instance/SomeEntity/someProperty";

    @AfterEach
    public void teardown() {
        ProtectedPathManager mgr = new ProtectedPathManager(adminHubConfig.getManageClient());
        mgr.deleteByIdField(TEST_PATH_EXPRESSION);
        assertFalse(mgr.exists(TEST_PATH_EXPRESSION));
    }

    @Test
    public void test() {
        givenAProtectedPathFile();
        dataHub.updateIndexes();
        thenTheProtectedPathIsDeployed();
    }

    private void givenAProtectedPathFile() {
        ObjectNode node = ObjectMapperFactory.getObjectMapper().createObjectNode();
        node.put("path-expression", TEST_PATH_EXPRESSION);
        ObjectNode perm = node.putObject("permission");
        perm.put("role-name", "pii-reader");
        perm.put("capability", "read");
        ConfigDir configDir = new ConfigDir(new File(PROJECT_PATH, "src/main/ml-config"));
        File pathsDir = configDir.getProtectedPathsDir();
        pathsDir.mkdirs();
        File f = new File(pathsDir, "01_pii-protected-paths.json");
        logger.info("Writing protected path to: " + f.getAbsolutePath());
        try {
            ObjectMapperFactory.getObjectMapper().writeValue(f, node);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void thenTheProtectedPathIsDeployed() {
        ProtectedPathManager mgr = new ProtectedPathManager(adminHubConfig.getManageClient());
        assertTrue(
            mgr.exists(TEST_PATH_EXPRESSION),
            "Updating indexes should also result in protected paths being deployed so that when a user marks " +
                "a property as being PII and then chooses to update indexes, the corresponding protected path " +
                "will be deployed");
    }

}
