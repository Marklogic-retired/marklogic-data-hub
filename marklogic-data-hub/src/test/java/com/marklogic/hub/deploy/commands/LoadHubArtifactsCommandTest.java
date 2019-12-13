package com.marklogic.hub.deploy.commands;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class LoadHubArtifactsCommandTest extends HubTestBase {

    private String originalModulePermissions;

    @BeforeEach
    public void setup() {
        originalModulePermissions = adminHubConfig.getModulePermissions();
    }

    @AfterEach
    public void tearDown() {
        adminHubConfig.setModulePermissions(originalModulePermissions);
    }

    @Test
    public void verifyDefaultPermissions() {
        DocumentMetadataHandle h = loadHubArtifactsCommand.buildMetadata(adminHubConfig.getFlowPermissions(),"http://marklogic.com/data-hub/flow");
        assertEquals(1, h.getCollections().size());
        assertEquals("http://marklogic.com/data-hub/flow", h.getCollections().iterator().next());


        DocumentMetadataHandle.DocumentPermissions perms = h.getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-flow-reader").iterator().next());

        h = loadHubArtifactsCommand.buildMetadata(adminHubConfig.getStepDefinitionPermissions(),"http://marklogic.com/data-hub/step-definition");
        assertEquals(1, h.getCollections().size());
        assertEquals("http://marklogic.com/data-hub/step-definition", h.getCollections().iterator().next());


        perms = h.getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-step-definition-reader").iterator().next());
    }

    @Test
    public void customPermissions() {
        //ensuring that permissions are user configured as opposed to the defaults
        HubConfigImpl config = new HubConfigImpl();

        config.setFlowPermissions("manage-user,read,manage-admin,update");
        config.setStepDefinitionPermissions("manage-user,read,manage-admin,update");

        DocumentMetadataHandle.DocumentPermissions perms = loadUserArtifactsCommand.buildMetadata(config.getStepDefinitionPermissions(),"http://marklogic.com/data-hub/step-definition").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-step-definition-reader"));

        perms = loadUserArtifactsCommand.buildMetadata(config.getFlowPermissions(),"http://marklogic.com/data-hub/flow").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-flow-writer"));
    }
}

