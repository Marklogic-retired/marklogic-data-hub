package com.marklogic.hub.deploy.commands;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DocumentMetadataHelper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class FinishHubDeploymentCommandTest extends AbstractHubCoreTest {

    @Test
    void loadDefaultTemplates() {
        FinishHubDeploymentCommand command = new FinishHubDeploymentCommand(getHubConfig());
        command.execute(newCommandContext());

        DatabaseClient stagingSchemasDatabaseClient = getHubConfig().newStagingClient(getHubConfig().getStagingSchemasDbName());
        DatabaseClient finalSchemasDatabaseClient = getHubConfig().newStagingClient(getHubConfig().getFinalSchemasDbName());

        assertEquals(1, getDocumentCount(stagingSchemasDatabaseClient));
        assertEquals(1, getDocumentCount(finalSchemasDatabaseClient));

        DocumentMetadataHelper helper = getMetadata(stagingSchemasDatabaseClient, "/hub-template/StepResponse.json");
        helper.assertInCollections("hub-template", "http://marklogic.com/xdmp/tde");
        helper.assertHasPermissions("data-hub-common", DocumentMetadataHandle.Capability.READ);
        helper.assertHasPermissions("data-hub-job-monitor", DocumentMetadataHandle.Capability.READ);
        helper.assertHasPermissions("data-hub-developer", DocumentMetadataHandle.Capability.UPDATE);

        helper = getMetadata(finalSchemasDatabaseClient, "/hub-template/StepResponse.json");
        helper.assertInCollections("hub-template", "http://marklogic.com/xdmp/tde");
        helper.assertHasPermissions("data-hub-common", DocumentMetadataHandle.Capability.READ);
        helper.assertHasPermissions("data-hub-job-monitor", DocumentMetadataHandle.Capability.READ);
        helper.assertHasPermissions("data-hub-developer", DocumentMetadataHandle.Capability.UPDATE);
    }
}
