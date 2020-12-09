package com.marklogic.hub.spark.sql.sources.v2;

import com.marklogic.client.document.DocumentManager;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubClientConfig;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

public class ModuleWriter extends LoggingObject {

    private HubClient hubClient;
    private HubClientConfig hubClientConfig;

    public ModuleWriter(HubClient hubClient, HubClientConfig hubClientConfig) {
        this.hubClient = hubClient;
        this.hubClientConfig = hubClientConfig;
    }

    public void loadModuleIfNotPresent(String modulePath, Format format) {
        if (!endpointExists(modulePath)) {
            try {
                DocumentManager modMgr = hubClient.getModulesClient().newDocumentManager();
                DocumentMetadataHandle metadata = buildDocumentMetadata();
                logger.info("Loading module: " + modulePath);
                modMgr.write(modulePath, metadata, new InputStreamHandle(new ClassPathResource(modulePath).getInputStream()).withFormat(format));
            } catch (IOException e) {
                throw new RuntimeException("Unable to write endpoint at path: " + modulePath + "; cause: " + e.getMessage(), e);
            }
        }
    }

    private boolean endpointExists(String scriptPath) {
        return !(hubClient.getModulesClient().newJSONDocumentManager().exists(scriptPath) == null);
    }

    private DocumentMetadataHandle buildDocumentMetadata() {
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        String modulePermissions = hubClientConfig.getModulePermissions();
        new DefaultDocumentPermissionsParser().parsePermissions(modulePermissions, metadata.getPermissions());

        // It seems preferable to use this collection so that modules loaded by the connector are considered OOTB
        // modules. Otherwise, if the modules are not loaded in this collection, tasks like mlClearUserModules will
        // delete them, which does not seem expected.
        metadata.getCollections().addAll("hub-core-module");

        return metadata;
    }
}
