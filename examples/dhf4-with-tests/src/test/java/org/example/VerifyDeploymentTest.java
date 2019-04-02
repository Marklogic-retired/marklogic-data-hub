package org.example;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.junit5.XmlNode;
import com.marklogic.junit5.dhf.AbstractDataHubTest;
import com.marklogic.junit5.dhf.DataHubTestConfig;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.api.server.Server;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.mapper.ResourceMapper;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import com.marklogic.mgmt.resource.cpf.DomainManager;
import com.marklogic.mgmt.resource.cpf.PipelineManager;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.resource.security.AmpManager;
import com.marklogic.mgmt.resource.security.PrivilegeManager;
import com.marklogic.mgmt.resource.security.RoleManager;
import com.marklogic.mgmt.resource.security.UserManager;
import com.marklogic.mgmt.resource.temporal.TemporalAxesManager;
import com.marklogic.mgmt.resource.temporal.TemporalCollectionManager;
import com.marklogic.mgmt.resource.triggers.TriggerManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Run this test after deploying the app to verify that all aspects of the deployment completed successfully.
 */
public class VerifyDeploymentTest extends AbstractDataHubTest {

    @Autowired
    DataHubTestConfig dataHubTestConfig;

    private ManageClient manageClient;
    private DatabaseClient databaseClient;
    private ResourceMapper resourceMapper;

    @BeforeEach
    public void setup() {
        ManageConfig config = new ManageConfig(dataHubTestConfig.getHost(), 8002, dataHubTestConfig.getUsername(),
            dataHubTestConfig.getPassword());
        manageClient = new ManageClient(config);

        resourceMapper = new DefaultResourceMapper(new API(manageClient));
    }

    @AfterEach
    public void teardown() {
        if (databaseClient != null) {
            databaseClient.release();
        }
    }

    @Test
    public void verifyDatabasesWereDeployed() {
        DatabaseManager mgr = new DatabaseManager(manageClient);
        assertTrue(mgr.exists("data-hub-FINAL"));
        assertTrue(mgr.exists("data-hub-final-SCHEMAS"));
        assertTrue(mgr.exists("data-hub-final-TRIGGERS"));
        assertTrue(mgr.exists("data-hub-JOBS"));
        assertTrue(mgr.exists("data-hub-MODULES"));
        assertTrue(mgr.exists("data-hub-STAGING"));
        assertTrue(mgr.exists("data-hub-staging-SCHEMAS"));
        assertTrue(mgr.exists("data-hub-staging-TRIGGERS"));
    }

    @Test
    public void verifyStagingDatabaseIsOverridden() {
        String json = new DatabaseManager(manageClient).getPropertiesAsJson("data-hub-STAGING");
        Database db = resourceMapper.readResource(json, Database.class);
        assertEquals(4, db.getRangeElementIndex().size(),
            "There should be 4 range indexes - 2 from the entity-config file, and 2 from the user's ml-config file.");

        assertEquals("entityConfigStaging1", db.getRangeElementIndex().get(0).getLocalname());
        assertEquals("entityConfigStaging2", db.getRangeElementIndex().get(1).getLocalname());
        assertEquals("userConfigStaging1", db.getRangeElementIndex().get(2).getLocalname());
        assertEquals("userConfigStaging2", db.getRangeElementIndex().get(3).getLocalname());

        assertTrue(db.getWordPositions(), "The user's staging-database file overrides this an sets it to true");
    }

    /**
     * Deploying from QS currently has a bug where the existing final-database.json file is overwritten. So this test
     * fails because only 2 range indexes are found instead of 4.
     */
    @Test
    public void verifyFinalDatabaseIsOverridden() {
        String json = new DatabaseManager(manageClient).getPropertiesAsJson("data-hub-FINAL");
        Database db = resourceMapper.readResource(json, Database.class);
        assertEquals(4, db.getRangeElementIndex().size(),
            "There should be 4 range indexes - 2 from the entity-config file, and 2 from the user's ml-config file.");

        assertEquals("entityConfigFinal1", db.getRangeElementIndex().get(0).getLocalname());
        assertEquals("entityConfigFinal2", db.getRangeElementIndex().get(1).getLocalname());
        assertEquals("userConfigFinal1", db.getRangeElementIndex().get(2).getLocalname());
        assertEquals("userConfigFinal2", db.getRangeElementIndex().get(3).getLocalname());
    }

    /**
     * As of 4.1.0, CPF resources under ml-config/cpf are deployed to the final database by default.
     */
    @Test
    public void verifyCpfResourcesWereDeployedToFinalDatabase() {
        DomainManager domainManager = new DomainManager(manageClient, "data-hub-final-TRIGGERS");
        assertTrue(domainManager.exists("sample-domain"));

        PipelineManager pipelineManager = new PipelineManager(manageClient, "data-hub-final-TRIGGERS");
        assertTrue(pipelineManager.exists("Sample Pipeline"));
        assertTrue(pipelineManager.exists("Status Change Handling"));
    }

    @Test
    public void verifySecurityResourcesWereDeployed() {
        UserManager userManager = new UserManager(manageClient);
        assertTrue(userManager.exists("flow-operator"));
        assertTrue(userManager.exists("example-user1"));
        assertTrue(userManager.exists("example-user2"),
            "This verifies that all locations in mlConfigPaths are being processed, as this user is defined in src/test/ml-config");

        RoleManager roleManager = new RoleManager(manageClient);
        assertTrue(roleManager.exists("flow-operator-role"));
        assertTrue(roleManager.exists("data-hub-admin-role"));
        assertTrue(roleManager.exists("example-role1"));

        PrivilegeManager privilegeManager = new PrivilegeManager(manageClient);
        assertTrue(privilegeManager.exists("dhf-internal-data-hub"));
        assertTrue(privilegeManager.exists("dhf-internal-entities"));
        assertTrue(privilegeManager.exists("dhf-internal-mappings"));
        assertTrue(privilegeManager.exists("dhf-internal-trace-ui"));
        assertTrue(privilegeManager.exists("example-privilege1"));

        AmpManager ampManager = new AmpManager(manageClient);
        final String payload = "{" +
            "  \"namespace\": \"org:example\"," +
            "  \"local-name\": \"echo\"," +
            "  \"document-uri\": \"/example/example-lib.xqy\"," +
            "  \"modules-database\": \"data-hub-MODULES\"," +
            "  \"role\": [\"admin\"]" +
            "}";
        assertTrue(ampManager.ampExists(payload));
    }

    @Test
    public void verifyServersWereDeployed() {
        ServerManager mgr = new ServerManager(manageClient);
        assertTrue(mgr.exists("data-hub-FINAL"));
        assertTrue(mgr.exists("data-hub-JOBS"));
        assertTrue(mgr.exists("data-hub-STAGING"));
    }

    @Test
    public void verifyStagingServerIsOverridden() {
        String json = new ServerManager(manageClient).getPropertiesAsJson("data-hub-STAGING");
        Server server = resourceMapper.readResource(json, Server.class);
        assertEquals("xml", server.getDefaultErrorFormat(),
            "The hub-internal-config file defaults this to json, but the ml-config file overrides it to be xml");
    }

    @Test
    public void verifyJobServerIsOverridden() {
        String json = new ServerManager(manageClient).getPropertiesAsJson("data-hub-JOBS");
        Server server = resourceMapper.readResource(json, Server.class);
        assertEquals("xml", server.getDefaultErrorFormat(),
            "The hub-internal-config file defaults this to json, but the ml-config file overrides it to be xml");
    }

    @Test
    public void verifyModulesDatabase() {
        databaseClient = newClient("data-hub-MODULES");

        boolean wasInstalledViaQuickStart = wasInstalledViaQuickStart(databaseClient);

        assertEquals(107, getModuleCountInDirectory("/data-hub/4/"), "DHF 4.1.0 has 107 modules in this directory");


        if (wasInstalledViaQuickStart) {
            assertEquals(3, getModuleCountInDirectory("/com.marklogic.hub/"), "DHF 4.1.0 has 3 modules in this directory when installed via QS");
        } else {
            assertEquals(2, getModuleCountInDirectory("/com.marklogic.hub/"), "DHF 4.1.0 has 2 modules in this directory");
        }

        assertEquals(5, getModuleCountInDirectory("/entities/"), "The Person entity has an input flow with 5 modules");

        assertEquals(24, getModuleCountInDirectory("/trace-ui/"), "DHF 4.1.0 has 24 modules in this directory");

        if (wasInstalledViaQuickStart) {
            // This is failing with QS, need to figure out why it doesn't read from a second module path (logging indicates that it does)
            assertEquals(1, getModuleCountInDirectory("/test/"), "QS doesn't know about mlRestApi dependencies; those are specific to Gradle; " +
                "but the 1 module under src/test/ml-modules should still be loaded");
        } else {
            assertEquals(24, getModuleCountInDirectory("/test/"),
                "marklogic-unit-test 0.12.0 has 23 modules in this directory. These modules are loaded via an ml-gradle mlRestApi dependency. " +
                    "The user then has a single module in this directory that's defined under src/test/ml-modules.");

            assertEquals(2, getModuleCountInDirectory("/marklogic.rest.resource/marklogic-unit-test/"),
                "The marklogic-unit-test resource extension should be installed via a Gradle deployment, but not via QS");
        }

        assertEquals(1, getModuleCountInDirectory("/example/"), "The src/main/ml-modules directory has one module in this directory");
        assertEquals(3, getModuleCountInDirectory("/marklogic.rest.resource/example-service/"));
        assertEquals(3, getModuleCountInDirectory("/marklogic.rest.transform/example-transform/"));


        assertEquals(6, getModuleCountInDirectory("/Default/"), "6 search options are expected in this directory; " +
            "final/default.xml; final/final-entity-options.xml; jobs/jobs.xml; jobs/traces.xml; " +
            "staging/default.xml; and staging/staging-entity-options.xml");

        if (wasInstalledViaQuickStart) {
            assertEquals(153, getModuleCountInDirectory("/"));
        } else {
            assertEquals(177, getModuleCountInDirectory("/"));
        }
    }

    /**
     * Staging schemas are loaded from src/main/hub-internal-config/schemas.
     */
    @Test
    public void verifyStagingSchemas() {
        databaseClient = newClient("data-hub-staging-SCHEMAS");

        final String schemaUri = "/staging-schema.xsd";
        new XmlNode(databaseClient.newXMLDocumentManager().read(schemaUri, new StringHandle()).get()).assertElementExists("/staging");

        final String tdeUri = "/tde/StagingPerson-0.0.1.tdex";
        DocumentMetadataHandle metadata = databaseClient.newDocumentManager().readMetadata(tdeUri, new DocumentMetadataHandle());
        assertEquals("http://marklogic.com/xdmp/tde", metadata.getCollections().iterator().next());
    }

    /**
     * Final schemas are loaded from src/main/ml-schemas.
     */
    @Test
    public void verifyFinalSchemas() {
        databaseClient = newClient("data-hub-final-SCHEMAS");

        final String schemaUri = "/db-final-schema.xsd";
        new XmlNode(databaseClient.newXMLDocumentManager().read(schemaUri, new StringHandle()).get()).assertElementExists("/database-final-schema");

        final String tdeUri = "/tde/Person-0.0.1.tdex";
        DocumentMetadataHandle metadata = databaseClient.newDocumentManager().readMetadata(tdeUri, new DocumentMetadataHandle());
        assertEquals("http://marklogic.com/xdmp/tde", metadata.getCollections().iterator().next());
    }

    @Test
    public void verifyTriggers() {
        TriggerManager mgr = new TriggerManager(manageClient, "data-hub-final-TRIGGERS");
        assertTrue(mgr.exists("final-trigger"));
        assertFalse(mgr.exists("staging-trigger"));

        mgr = new TriggerManager(manageClient, "data-hub-staging-TRIGGERS");
        assertFalse(mgr.exists("final-trigger"));
        assertTrue(mgr.exists("staging-trigger"));
    }

    @Test
    public void verifyFinalTemporal() {
        final String db = "data-hub-FINAL";

        assertTrue(new TemporalCollectionManager(manageClient, db).exists("final-temporal-collection"));

        TemporalAxesManager axesManager = new TemporalAxesManager(manageClient, db);
        assertTrue(axesManager.exists("final-system"));
        assertTrue(axesManager.exists("final-valid"));
    }

    @Test
    public void verifyStagingTemporal() {
        final String db = "data-hub-STAGING";

        assertTrue(new TemporalCollectionManager(manageClient, db).exists("staging-temporal-collection"));

        TemporalAxesManager axesManager = new TemporalAxesManager(manageClient, db);
        assertTrue(axesManager.exists("staging-system"));
        assertTrue(axesManager.exists("staging-valid"));
    }

    private int getModuleCountInDirectory(String directory) {
        String query = String.format("cts.estimate(cts.directoryQuery('%s', 'infinity'))", directory);
        return Integer.parseInt(databaseClient.newServerEval().javascript(query).evalAs(String.class));
    }

    private DatabaseClient newClient(String database) {
        return DatabaseClientFactory.newClient(dataHubTestConfig.getHost(), dataHubTestConfig.getStagingPort(), database,
            new DatabaseClientFactory.DigestAuthContext(dataHubTestConfig.getUsername(), dataHubTestConfig.getPassword()));
    }

    private boolean wasInstalledViaQuickStart(DatabaseClient client) {
        String query = "cts.exists(cts.documentQuery('/com.marklogic.hub/settings/__tracing_enabled__.xml'))";
        return Boolean.parseBoolean(client.newServerEval().javascript(query).evalAs(String.class));
    }
}
