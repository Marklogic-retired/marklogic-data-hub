package com.marklogic.hub;

import com.marklogic.client.io.DocumentMetadataHandle;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * TODO Move this to testFixures once that configuration depends on JUnit 5.
 */
public class DocumentMetadataHelper {

    private String uri;
    private DocumentMetadataHandle metadata;

    public DocumentMetadataHelper(String uri, DocumentMetadataHandle metadata) {
        this.uri = uri;
        this.metadata = metadata;
    }

    public DocumentMetadataHandle getMetadata() {
        return metadata;
    }

    public void assertMetadataKey(String key, String value) {
        assertEquals(value, metadata.getMetadataValues().get(key),
            String.format("Expected metadata key '%s' to have value of '%s'", key, value));
    }

    public void assertDataHubMetadata(String username, String flowName, String stepName) {
        assertMetadataKey("datahubCreatedBy", username);
        assertMetadataKey("datahubCreatedInFlow", flowName);
        assertMetadataKey("datahubCreatedByStep", stepName);
        assertNotNull(metadata.getMetadataValues().get("datahubCreatedOn"));
        assertNotNull(metadata.getMetadataValues().get("datahubCreatedByJob"));
    }

    public void assertInCollections(String... collections) {
        for (String collection : collections) {
            assertTrue(metadata.getCollections().contains(collection),
                String.format("Expected document with URI %s to be in collection %s", uri, collection));
        }
    }

    public void assertHasPermissions(String role, DocumentMetadataHandle.Capability... capabilities) {
        for (DocumentMetadataHandle.Capability capability : capabilities) {
            assertTrue(metadata.getPermissions().containsKey(role),
                String.format("Expected document with URI %s to have permission with role %s", uri, role));
            Set<DocumentMetadataHandle.Capability> set = metadata.getPermissions().get(role);
            assertTrue(set.contains(capability),
                String.format("Expected document with URI %s to have permission with role %s and capability %s", uri, role, capability));
        }
    }
}
