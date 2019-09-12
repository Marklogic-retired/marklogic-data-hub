package com.marklogic.hub.deploy.commands;

import com.marklogic.client.ext.file.DocumentFile;
import com.marklogic.client.ext.file.DocumentFileProcessor;
import com.marklogic.client.io.DocumentMetadataHandle;

public class HubRESTDocumentFileProcessor implements DocumentFileProcessor {

    public HubRESTDocumentFileProcessor() {
    }


    @Override
    public DocumentFile processDocumentFile(DocumentFile documentFile) {
        String docURI = documentFile.getUri();
        if (docURI.startsWith("/marklogic.rest.") || docURI.contains("rest-api")) {
            if (docURI.startsWith("/marklogic.rest.")) {
                String newURI = docURI.replaceFirst("^/marklogic\\.rest\\.(resource|transform)/", "/marklogic.rest.$1/ml:");
                documentFile.setUri(newURI);
            }
            DocumentMetadataHandle metadata = documentFile.getDocumentMetadata();
            if (metadata != null) {
                DocumentMetadataHandle.DocumentPermissions permissionsMeta = metadata.getPermissions();
                permissionsMeta.add("rest-extension-user", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.EXECUTE);
                permissionsMeta.add("rest-reader-internal", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.EXECUTE);
                permissionsMeta.add("rest-admin-internal", DocumentMetadataHandle.Capability.UPDATE);
                permissionsMeta.add("application-plugin-registrar", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE, DocumentMetadataHandle.Capability.EXECUTE);
            }
        }
        return documentFile;
    }
}
