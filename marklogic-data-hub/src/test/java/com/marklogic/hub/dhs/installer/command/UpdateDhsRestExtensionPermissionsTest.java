package com.marklogic.hub.dhs.installer.command;

import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dhs.installer.deploy.UpdateDhsModulesPermissionsCommand;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class UpdateDhsRestExtensionPermissionsTest extends AbstractHubCoreTest {

    /**
     * Cannot run this test in DHS, as it depends on installHubModules, which messages up the DHS
     * installation.
     */
    @Test
    public void testUpdateDhsResourcePermissions() {
        try {
            runAsAdmin();
            new UpdateDhsModulesPermissionsCommand(getHubConfig()).execute(newCommandContext());

            GenericDocumentManager modMgr = getHubClient().getModulesClient().newDocumentManager();

            DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
            modMgr.readMetadata("/marklogic.rest.resource/mlDbConfigs/assets/metadata.xml", metadataHandle);
            DocumentMetadataHandle.DocumentPermissions perms = metadataHandle.getPermissions();

            Assertions.assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-environment-manager").iterator().next());
            Assertions.assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("rest-extension-user").iterator().next());

            DocumentMetadataHandle moduleMetadataHandle = new DocumentMetadataHandle();
            modMgr.readMetadata("/marklogic.rest.resource/mlBatches/assets/resource.sjs", moduleMetadataHandle);
            DocumentMetadataHandle.DocumentPermissions modulePerms = moduleMetadataHandle.getPermissions();

            Assertions.assertEquals(DocumentMetadataHandle.Capability.UPDATE, modulePerms.get("data-hub-environment-manager").iterator().next());
            Assertions.assertNull(modulePerms.get("rest-admin-internal"));

            moduleMetadataHandle = new DocumentMetadataHandle();
            modMgr.readMetadata("/marklogic.rest.resource/mlBatches/assets/resource.xqy", moduleMetadataHandle);
            modulePerms = moduleMetadataHandle.getPermissions();

            Assertions.assertEquals(DocumentMetadataHandle.Capability.UPDATE, modulePerms.get("data-hub-environment-manager").iterator().next());
            Assertions.assertNull(modulePerms.get("rest-admin-internal"));

            moduleMetadataHandle = new DocumentMetadataHandle();
            modMgr.readMetadata("/marklogic.rest.transform/mlGenerateFunctionMetadata/assets/transform.sjs", moduleMetadataHandle);
            modulePerms = moduleMetadataHandle.getPermissions();

            Assertions.assertEquals(DocumentMetadataHandle.Capability.UPDATE, modulePerms.get("data-hub-environment-manager").iterator().next());
            Assertions.assertNull(modulePerms.get("rest-admin-internal"));

            moduleMetadataHandle = new DocumentMetadataHandle();
            modMgr.readMetadata("/marklogic.rest.transform/mlGenerateFunctionMetadata/assets/transform.xqy", moduleMetadataHandle);
            modulePerms = moduleMetadataHandle.getPermissions();

            Assertions.assertEquals(DocumentMetadataHandle.Capability.UPDATE, modulePerms.get("data-hub-environment-manager").iterator().next());
            Assertions.assertNull(modulePerms.get("rest-admin-internal"));
        } finally {
            new DatabaseManager(getHubClient().getManageClient()).clearDatabase(HubConfig.DEFAULT_MODULES_DB_NAME);
            installHubModules();
            installHubArtifacts();
        }
    }

}
