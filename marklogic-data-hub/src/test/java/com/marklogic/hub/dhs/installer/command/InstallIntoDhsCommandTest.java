package com.marklogic.hub.dhs.installer.command;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.ResourceFilenameFilter;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.dhs.installer.Options;
import com.marklogic.hub.dhs.installer.deploy.CopyQueryOptionsCommand;
import com.marklogic.hub.dhs.installer.deploy.DhsDeployServersCommand;
import com.marklogic.hub.dhs.installer.deploy.UpdateDhsModulesPermissionsCommand;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

public class InstallIntoDhsCommandTest extends AbstractHubCoreTest {

    @Test
    public void buildDefaultProjectProperties() {
        Properties props = new InstallIntoDhsCommand().buildDefaultProjectProperties(new Options());

        verifyDefaultProperties(props);

        assertEquals("https", props.getProperty("mlAdminScheme"));
        assertEquals("true", props.getProperty("mlAdminSimpleSsl"));
        assertEquals("https", props.getProperty("mlManageScheme"));
        assertEquals("true", props.getProperty("mlManageSimpleSsl"));
        assertEquals("true", props.getProperty("mlAppServicesSimpleSsl"));
        assertEquals("true", props.getProperty("mlFinalSimpleSsl"));
        assertEquals("true", props.getProperty("mlJobSimpleSsl"));
        assertEquals("true", props.getProperty("mlStagingSimpleSsl"));
    }

    @Test
    public void buildDefaultProjectPropertiesWithoutSslEnabled() {
        Options options = new Options();
        options.setDisableSsl(true);

        Properties props = new InstallIntoDhsCommand().buildDefaultProjectProperties(options);
        verifyDefaultProperties(props);

        assertNull(props.getProperty("mlAdminScheme"));
        assertNull(props.getProperty("mlAdminSimpleSsl"));
        assertNull(props.getProperty("mlManageScheme"));
        assertNull(props.getProperty("mlManageSimpleSsl"));
        assertNull(props.getProperty("mlAppServicesSimpleSsl"));
        assertNull(props.getProperty("mlFinalSimpleSsl"));
        assertNull(props.getProperty("mlJobSimpleSsl"));
        assertNull(props.getProperty("mlStagingSimpleSsl"));
    }

    @Test
    public void modifyHubConfig() {
        HubConfigImpl config = new HubConfigImpl();
        config.setAppConfig(new AppConfig(), true);
        InstallIntoDhsCommand command = new InstallIntoDhsCommand();
        command.hubConfig = config;

        command.modifyHubConfigForDhs("Evaluator");
        assertEquals("Evaluator", config.getAppConfig().getGroupName(),
            "The group name needs to be set correctly so that servers are deployed to the correct group");
        assertFalse(config.getAppConfig().isCreateForests(), "DHF is not allowed to create forests, as DHS will handle that");
    }

    @Test
    public void buildCommandList() {
        InstallIntoDhsCommand command = new InstallIntoDhsCommand();
        command.hubConfig = super.getHubConfig();

        Options options = new Options();
        options.setGroupNames("Evaluator,Curator");

        List<Command> commands = command.buildCommandsForDhs(options);
        Collections.sort(commands, Comparator.comparing(Command::getExecuteSortOrder));

        int index = 0;
        System.out.println(commands);
        assertTrue(commands.get(index++) instanceof DeployPrivilegesCommand);
        assertTrue(commands.get(index++) instanceof DeployRolesCommand);
        assertTrue(commands.get(index++) instanceof DeployOtherDatabasesCommand);
        assertTrue(commands.get(index++) instanceof DeployDatabaseFieldCommand);
        assertTrue(commands.get(index++) instanceof DhsDeployServersCommand);
        assertTrue(commands.get(index++) instanceof LoadHubModulesCommand);
        assertTrue(commands.get(index++) instanceof UpdateDhsModulesPermissionsCommand);
        assertTrue(commands.get(index++) instanceof DeployAmpsCommand);
        assertTrue(commands.get(index++) instanceof GenerateFunctionMetadataCommand);
        assertTrue(commands.get(index++) instanceof CopyQueryOptionsCommand);
        assertTrue(commands.get(index++) instanceof DeployTriggersCommand);
        assertTrue(commands.get(index++) instanceof DeployHubTriggersCommand);
        assertTrue(commands.get(index++) instanceof LoadHubArtifactsCommand);
        assertTrue(commands.get(index++) instanceof CreateGranularPrivilegesCommand);
        assertEquals(14, commands.size());

        DeployRolesCommand deployRolesCommand = (DeployRolesCommand) commands.get(1);
        ResourceFilenameFilter filter = (ResourceFilenameFilter) deployRolesCommand.getResourceFilenameFilter();
        File dir = getHubProject().getProjectDir().toFile(); // the directory doesn't matter, only the filename
        assertTrue(filter.accept(dir, "data-hub-entity-model-reader.json"));
        assertTrue(filter.accept(dir, "data-hub-explorer-architect.json"));
        assertFalse(filter.accept(dir, "flow-developer-role.json"), "The DHF 'legacy' roles should not be deployed as they grant too many privileges for a DHS user");
        assertFalse(filter.accept(dir, "flow-operator-role.json"), "The DHF 'legacy' roles should not be deployed as they grant too many privileges for a DHS user");
        assertFalse(filter.accept(dir, "data-hub-admin-role.json"), "The DHF 'legacy' roles should not be deployed as they grant too many privileges for a DHS user");

        CreateGranularPrivilegesCommand createGranularPrivilegesCommand = (CreateGranularPrivilegesCommand) commands.get(13);
        List<String> names = createGranularPrivilegesCommand.getGroupNames();
        assertEquals("Evaluator", names.get(0));
        assertEquals("Curator", names.get(1));
        assertEquals(2, names.size());

        GenerateFunctionMetadataCommand generateFunctionMetadataCommand = (GenerateFunctionMetadataCommand) commands.get(8);
        assertTrue(generateFunctionMetadataCommand.isCatchExceptionsForUserModules(), "Per DHFPROD-5496, this command " +
            "should be configured to catch exceptions from user modules, as we don't want those to cause errors when " +
            "installing DHF into DHS. The expectation is that the user will fix their errors later and then run e.g. " +
            "hubDeploy to regenerate function metadata");
    }

    private void verifyDefaultProperties(Properties props) {
        assertEquals("true", props.getProperty("mlIsHostLoadBalancer"), "This is needed to support running legacy flows");
        assertEquals("true", props.getProperty("mlIsProvisionedEnvironment"));

        // Verify role mappings
        assertEquals("flowDeveloper", props.getProperty("mlFlowDeveloperRole"));
        assertEquals("flowOperator", props.getProperty("mlFlowOperatorRole"));

        assertEquals("data-hub-module-reader,read,data-hub-module-reader,execute,data-hub-environment-manager,update,rest-extension-user,execute",
            props.getProperty("mlModulePermissions"));

        assertEquals("8010", props.getProperty("mlAppServicesPort"), "8000 is not available in DHS, so the staging port is used instead for " +
            "loading non-REST modules");

        assertEquals("basic", props.getProperty("mlAppServicesAuthentication"));
        assertEquals("basic", props.getProperty("mlFinalAuth"));
        assertEquals("basic", props.getProperty("mlJobAuth"));
        assertEquals("basic", props.getProperty("mlStagingAuth"));
    }

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
