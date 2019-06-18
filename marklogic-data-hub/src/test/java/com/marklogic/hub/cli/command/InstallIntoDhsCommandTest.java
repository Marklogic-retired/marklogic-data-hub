package com.marklogic.hub.cli.command;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.cli.deploy.DhsDeployServersCommand;
import com.marklogic.hub.deploy.commands.DeployDatabaseFieldCommand;
import com.marklogic.hub.deploy.commands.LoadHubArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadHubModulesCommand;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class InstallIntoDhsCommandTest extends HubTestBase {

    @Test
    public void buildProjectProperties() {
        Properties props = new InstallIntoDhsCommand().buildProjectProperties();
        assertEquals("true", props.getProperty("mlIsHostLoadBalancer"), "This is needed to support running legacy flows");
        assertEquals("true", props.getProperty("mlIsProvisionedEnvironment"));

        // Verify role mappings
        assertEquals("flowDeveloper", props.getProperty("mlFlowDeveloperRole"));
        assertEquals("flowOperator", props.getProperty("mlFlowOperatorRole"));
        assertEquals("flowDeveloper", props.getProperty("mlDataHubAdminRole"),
            "As of 5.0.2, mlDataHubAdminRole is only used for setting permissions on triggers, so it's fine to map it to the flowDeveloper role");

        assertEquals("flowDeveloper,read,flowDeveloper,execute,flowDeveloper,insert,flowOperator,read,flowOperator,execute,flowOperator,insert",
            props.getProperty("mlModulePermissions"));
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
        assertEquals(9, commands.size());
        assertTrue(commands.get(0) instanceof DeployPrivilegesCommand);
        assertTrue(commands.get(1) instanceof DeployAmpsCommand);
        assertTrue(commands.get(2) instanceof DeployOtherDatabasesCommand);
        assertTrue(commands.get(3) instanceof DhsDeployServersCommand);
        assertTrue(commands.get(4) instanceof DeployTriggersCommand);
        assertTrue(commands.get(5) instanceof DeployDatabaseFieldCommand);
        assertTrue(commands.get(6) instanceof LoadHubModulesCommand);
        assertTrue(commands.get(7) instanceof LoadUserModulesCommand);
        assertTrue(commands.get(8) instanceof LoadHubArtifactsCommand);
    }
}
