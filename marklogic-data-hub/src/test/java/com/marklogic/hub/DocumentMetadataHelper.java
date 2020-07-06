package com.marklogic.hub;

import com.marklogic.client.io.DocumentMetadataHandle;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertTrue;

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

    public void assertInCollection(String collection) {
        assertTrue(metadata.getCollections().contains(collection),
            String.format("Expected document with URI %s to be in collection %s", uri, collection));
    }

    public void assertHasPermission(String role, DocumentMetadataHandle.Capability capability) {
        assertTrue(metadata.getPermissions().containsKey(role),
            String.format("Expected document with URI %s to have permission with role %s", uri, role));
        Set<DocumentMetadataHandle.Capability> capabilities = metadata.getPermissions().get(role);
        assertTrue(capabilities.contains(capability),
            String.format("Expected document with URI %s to have permission with role %s and capability %s", uri, role, capability));
    }
}
