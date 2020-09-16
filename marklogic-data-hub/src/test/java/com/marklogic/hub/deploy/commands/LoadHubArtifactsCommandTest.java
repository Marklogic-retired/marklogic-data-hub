package com.marklogic.hub.deploy.commands;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class LoadHubArtifactsCommandTest extends AbstractHubCoreTest {

    private String originalModulePermissions;

    @BeforeEach
    public void setup() {
        originalModulePermissions = getHubConfig().getModulePermissions();
    }

    @AfterEach
    public void tearDown() {
        getHubConfig().setModulePermissions(originalModulePermissions);
    }

    @Test
    public void verifyDefaultPermissions() {
        LoadHubArtifactsCommand loadHubArtifactsCommand = new LoadHubArtifactsCommand(getHubConfig());
        DocumentMetadataHandle h = loadHubArtifactsCommand.buildMetadata(getHubConfig().getFlowPermissions(), "http://marklogic.com/data-hub/flow");
        assertEquals(2, h.getCollections().size());
        Iterator<String> collections = h.getCollections().iterator();
        assertEquals("http://marklogic.com/data-hub/flow", collections.next());
        assertEquals("hub-core-artifact", collections.next(),
            "This collection is being introduced in 5.3.0 so that marklogic-data-hub-central has an easy way of not deleting artifacts " +
                "installed as part of DH Core. We'll soon take advantage of this in the DH Core test suite, along with " +
                "an upcoming capability for uninstalling user project files without uninstalling DH Core.");

        DocumentMetadataHandle.DocumentPermissions perms = h.getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-flow-reader").iterator().next());

        h = loadHubArtifactsCommand.buildMetadata(getHubConfig().getStepDefinitionPermissions(), "http://marklogic.com/data-hub/step-definition");
        assertEquals(2, h.getCollections().size());
        collections = h.getCollections().iterator();
        assertEquals("http://marklogic.com/data-hub/step-definition", collections.next());
        assertEquals("hub-core-artifact", collections.next());

        perms = h.getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-step-definition-reader").iterator().next());

        h = loadHubArtifactsCommand.buildMetadata(getHubConfig().getModulePermissions(), "hub-core-module");
        perms = h.getPermissions();
        List<DocumentMetadataHandle.Capability> dhModReader = new ArrayList<>();
        dhModReader.add(perms.get("data-hub-module-reader").iterator().next());
        dhModReader.add(perms.get("data-hub-module-reader").iterator().next());

        dhModReader.contains(DocumentMetadataHandle.Capability.READ);
        dhModReader.contains(DocumentMetadataHandle.Capability.EXECUTE);
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-module-writer").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.EXECUTE, perms.get("rest-extension-user").iterator().next());
    }

    @Test
    public void customPermissions() {
        //ensuring that permissions are user configured as opposed to the defaults
        HubConfigImpl config = new HubConfigImpl();

        config.setFlowPermissions("manage-user,read,manage-admin,update");
        config.setStepDefinitionPermissions("manage-user,read,manage-admin,update");
        config.setModulePermissions("manage-user,read,manage-admin,update");

        LoadUserArtifactsCommand loadUserArtifactsCommand = new LoadUserArtifactsCommand(getHubConfig());

        DocumentMetadataHandle.DocumentPermissions perms = loadUserArtifactsCommand.buildMetadata(config.getStepDefinitionPermissions(), "http://marklogic.com/data-hub/step-definition").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-step-definition-reader"));

        perms = loadUserArtifactsCommand.buildMetadata(config.getFlowPermissions(), "http://marklogic.com/data-hub/flow").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-flow-writer"));

        perms = loadUserArtifactsCommand.buildMetadata(config.getModulePermissions(), "hub-core-module").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-module-writer"));
    }
}

