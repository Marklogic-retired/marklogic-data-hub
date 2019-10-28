package com.marklogic.hub.cli.command;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.ResourceFilenameFilter;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.cli.Options;
import com.marklogic.hub.cli.deploy.CopyQueryOptionsCommand;
import com.marklogic.hub.cli.deploy.DhsDeployServersCommand;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.util.Collections;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class InstallIntoDhsCommandTest extends HubTestBase {

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
        command.dataHub = super.dataHub;

        List<Command> commands = command.buildCommandsForDhs();
        assertEquals(12, commands.size());
        Collections.sort(commands, (c1, c2) -> c1.getExecuteSortOrder().compareTo(c2.getExecuteSortOrder()));

        int index = 0;
        assertTrue(commands.get(index++) instanceof DeployPrivilegesCommand);
        assertTrue(commands.get(index++) instanceof DeployRolesCommand);
        assertTrue(commands.get(index++) instanceof DeployOtherDatabasesCommand);
        assertTrue(commands.get(index++) instanceof DeployDatabaseFieldCommand);
        assertTrue(commands.get(index++) instanceof DhsDeployServersCommand);
        assertTrue(commands.get(index++) instanceof LoadHubModulesCommand);
        assertTrue(commands.get(index++) instanceof DeployAmpsCommand);
        assertTrue(commands.get(index++) instanceof LoadUserModulesCommand);
        assertTrue(commands.get(index++) instanceof CopyQueryOptionsCommand);
        assertTrue(commands.get(index++) instanceof DeployTriggersCommand);
        assertTrue(commands.get(index++) instanceof DeployHubTriggersCommand);
        assertTrue(commands.get(index++) instanceof LoadHubArtifactsCommand);

        DeployRolesCommand deployRolesCommand = (DeployRolesCommand) commands.get(1);
        ResourceFilenameFilter filter = (ResourceFilenameFilter) deployRolesCommand.getResourceFilenameFilter();
        File dir = new File(PROJECT_PATH); // the directory doesn't matter, only the filename
        assertTrue(filter.accept(dir, "entity-model-reader.json"));
        assertTrue(filter.accept(dir, "explorer-architect.json"));
        assertFalse(filter.accept(dir, "flow-developer-role.json"),
            "As of 5.1.0, the installer should only deploy entity-model-reader and explorer-architect");
    }

    private void verifyDefaultProperties(Properties props) {
        assertEquals("true", props.getProperty("mlIsHostLoadBalancer"), "This is needed to support running legacy flows");
        assertEquals("true", props.getProperty("mlIsProvisionedEnvironment"));

        // Verify role mappings
        assertEquals("flowDeveloper", props.getProperty("mlFlowDeveloperRole"));
        assertEquals("flowOperator", props.getProperty("mlFlowOperatorRole"));
        assertEquals("flowDeveloper", props.getProperty("mlDataHubAdminRole"),
            "As of 5.0.2, mlDataHubAdminRole is only used for setting permissions on triggers, so it's fine to map it to the flowDeveloper role");

        assertEquals("flowDeveloper,read,flowDeveloper,execute,flowDeveloper,insert,flowOperator,read,flowOperator,execute,flowOperator,insert",
            props.getProperty("mlModulePermissions"));

        assertEquals("8010", props.getProperty("mlAppServicesPort"), "8000 is not available in DHS, so the staging port is used instead for " +
            "loading non-REST modules");

        assertEquals("basic", props.getProperty("mlAppServicesAuthentication"));
        assertEquals("basic", props.getProperty("mlFinalAuth"));
        assertEquals("basic", props.getProperty("mlJobAuth"));
        assertEquals("basic", props.getProperty("mlStagingAuth"));
    }
}
