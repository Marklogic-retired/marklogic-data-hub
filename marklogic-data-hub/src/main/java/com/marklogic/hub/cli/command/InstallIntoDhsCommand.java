package com.marklogic.hub.cli.command;

import com.beust.jcommander.Parameters;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;
import com.marklogic.hub.cli.Options;
import com.marklogic.hub.cli.deploy.DhsDeployServersCommand;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.*;
import org.springframework.context.ApplicationContext;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

@Parameters(commandDescription = "Install or upgrade DHF into a DHS environment")
public class InstallIntoDhsCommand extends AbstractInstallerCommand {

    @Override
    public void run(ApplicationContext context, Options options) {
        initializeProject(context, options, buildProjectProperties());

        logger.info("Installing DHF version " + hubConfig.getJarVersion());

        HubAppDeployer deployer = new HubAppDeployer(
            hubConfig.getManageClient(), hubConfig.getAdminManager(), null, hubConfig.newStagingClient());

        String groupName = "Evaluator";
        modifyHubConfigForDhs(groupName);
        deployer.setCommands(buildCommandsForDhs());
        deployer.deploy(hubConfig.getAppConfig());

        // Update the servers in the Curator group
        groupName = "Curator";
        modifyHubConfigForDhs(groupName);
        deployer.setCommands(Arrays.asList(new DhsDeployServersCommand()));
        deployer.deploy(hubConfig.getAppConfig());
    }

    /**
     * In the spirit of whitelisting, we'll only setup the commands that we know we need for installing DHF.
     * We may need a more broad set of commands for user files.
     */
    protected List<Command> buildCommandsForDhs() {
        DeployOtherDatabasesCommand dbCommand = new DeployOtherDatabasesCommand();
        dbCommand.setDeployDatabaseCommandFactory(new HubDeployDatabaseCommandFactory(hubConfig));

        List<Command> commands = new ArrayList<>();
        commands.add(new DeployPrivilegesCommand());
        commands.add(new DeployAmpsCommand());
        commands.add(dbCommand);
        commands.add(new DhsDeployServersCommand());
        commands.add(new DeployTriggersCommand());
        commands.add(new DeployDatabaseFieldCommand());

        for (Command c : dataHub.buildCommandMap().get("mlModuleCommands")) {
            if (c instanceof LoadHubModulesCommand || c instanceof LoadHubArtifactsCommand) {
                commands.add(c);
            }

            // Need this to pick up what's in ml-modules-final
            else if (c instanceof LoadUserModulesCommand) {
                commands.add(c);
            }
        }

        return commands;
    }

    protected void modifyHubConfigForDhs(String groupName) {
        // DHS will handle all forest creation
        hubConfig.getAppConfig().setCreateForests(false);
        hubConfig.getAppConfig().setGroupName(groupName);
    }

    protected Properties buildProjectProperties() {
        // Include System properties so that a client can override e.g. mlHost/mlUsername/mlPassword via JVM props
        Properties props = new Properties();
        for (String key : System.getProperties().stringPropertyNames()) {
            props.put(key, System.getProperties().getProperty(key));
        }

        applyDhsSpecificProperties(props);
        return props;
    }

    /**
     * Public so that it can be reused by DHF Gradle plugin.
     *
     * @param props
     */
    public void applyDhsSpecificProperties(Properties props) {
        props.setProperty("mlIsHostLoadBalancer", "true");
        props.setProperty("mlIsProvisionedEnvironment", "true");

        props.setProperty("mlFlowDeveloperRole", "flowDeveloper");
        props.setProperty("mlFlowOperatorRole", "flowOperator");
        // Mapping this to flowDeveloper for now,
        props.setProperty("mlDataHubAdminRole", "flowDeveloper");
        props.setProperty("mlModulePermissions",
            "flowDeveloper,read,flowDeveloper,execute,flowDeveloper,insert,flowOperator,read,flowOperator,execute,flowOperator,insert");
    }
}
