package com.marklogic.hub.deploy.commands;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DocumentMetadataHelper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class DeployHubDefaultTdesCommandTest extends AbstractHubCoreTest {

    @Test
    void deployDefaultTdes() {
        DeployHubDefaultTdesCommand command = new DeployHubDefaultTdesCommand(getHubConfig());
        command.execute(newCommandContext());
        DatabaseClient schemasDatabaseClient = getHubConfig().newStagingClient(getHubConfig().getStagingSchemasDbName());
        assertEquals(1, getDocumentCount(schemasDatabaseClient));
        DocumentMetadataHelper helper = getMetadata(schemasDatabaseClient, "/tde/JobsData.json");
        helper.assertInCollections("ml-data-hub-tde", "http://marklogic.com/xdmp/tde");
        helper.assertHasPermissions("data-hub-common", DocumentMetadataHandle.Capability.READ);
        helper.assertHasPermissions("data-hub-job-monitor", DocumentMetadataHandle.Capability.READ);
        helper.assertHasPermissions("data-hub-developer", DocumentMetadataHandle.Capability.UPDATE);
    }
}
