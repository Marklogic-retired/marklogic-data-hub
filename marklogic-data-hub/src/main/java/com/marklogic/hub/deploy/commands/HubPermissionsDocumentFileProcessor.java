package com.marklogic.hub.deploy.commands;

import com.marklogic.client.ext.file.DocumentFile;
import com.marklogic.client.ext.file.DocumentFileProcessor;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.io.DocumentMetadataHandle;

public class HubPermissionsDocumentFileProcessor implements DocumentFileProcessor {
    private String permissions;
    private DocumentPermissionsParser documentPermissionsParser;

    public HubPermissionsDocumentFileProcessor(String permissions) {
        this(permissions, new DefaultDocumentPermissionsParser());
    }

    public HubPermissionsDocumentFileProcessor(String permissions, DocumentPermissionsParser documentPermissionsParser) {
        this.permissions = permissions;
        this.documentPermissionsParser = documentPermissionsParser;
    }

    @Override
    public DocumentFile processDocumentFile(DocumentFile documentFile) {
        if (permissions != null && documentPermissionsParser != null) {
            DocumentMetadataHandle metadata = documentFile.getDocumentMetadata();
            if (metadata != null) {
                DocumentMetadataHandle.DocumentPermissions permissionsMeta = metadata.getPermissions();
                documentPermissionsParser.parsePermissions(permissions, permissionsMeta);
                if (documentFile.getUri().startsWith("/marklogic.rest.") || documentFile.getUri().contains("rest-api")) {
                    permissionsMeta.add("rest-extension-user", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.EXECUTE);
                    permissionsMeta.add("rest-reader-internal", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.EXECUTE);
                    permissionsMeta.add("rest-admin-internal", DocumentMetadataHandle.Capability.UPDATE);
                    permissionsMeta.add("application-plugin-registrar", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE, DocumentMetadataHandle.Capability.EXECUTE);
                }
            }
        }
        return documentFile;
    }
}
