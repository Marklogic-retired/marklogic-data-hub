package com.marklogic.hub.deploy.commands;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
        DocumentMetadataHandle h = loadHubArtifactsCommand.buildDocumentMetadata("some-collection");
        assertEquals(1, h.getCollections().size());
        assertEquals("some-collection", h.getCollections().iterator().next());

        final String message = "To ensure that hub artifacts have at least some permissions on them when " +
            "deploying DHF to ML 10, mlModulePermissions is expected to be used to set permissions. This " +
            "should result in rest-reader and rest-writer permissions being added.";

        DocumentMetadataHandle.DocumentPermissions perms = h.getPermissions();
        Set<DocumentMetadataHandle.Capability> capabilities = perms.get("rest-reader");
        assertEquals(1, capabilities.size(), message);
        assertEquals(DocumentMetadataHandle.Capability.READ, capabilities.iterator().next());

        capabilities = perms.get("rest-writer");
        assertEquals(2, capabilities.size(), message);
        assertTrue(capabilities.contains(DocumentMetadataHandle.Capability.INSERT));
        assertTrue(capabilities.contains(DocumentMetadataHandle.Capability.UPDATE));
    }

    @Test
    public void noModulePermissions() {
        adminHubConfig.setModulePermissions("");
        DocumentMetadataHandle h = loadHubArtifactsCommand.buildDocumentMetadata("some-collection");
        assertEquals(0, h.getPermissions().size(), "If the user for some reason sets mlModulePermissions to an empty string, " +
            "no error should occur; the document permissions should just be empty");
    }
}

