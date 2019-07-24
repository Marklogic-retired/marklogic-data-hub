package com.marklogic.hub.cli.command;

import com.beust.jcommander.Parameters;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.hub.cli.Options;
import com.marklogic.hub.cli.deploy.CopyQueryOptionsCommand;
import com.marklogic.hub.cli.deploy.DhsDeployServersCommand;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.*;
import org.springframework.context.ApplicationContext;

import java.util.*;

@Parameters(commandDescription = "Install or upgrade DHF into a DHS environment")
public class InstallIntoDhsCommand extends AbstractInstallerCommand {

    @Override
    public void run(ApplicationContext context, Options options) {
        initializeProject(context, options, buildDefaultProjectProperties());

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
        commands.add(new DeployDatabaseFieldCommand());

        Map<String, List<Command>> commandMap = dataHub.buildCommandMap();

        // Gets the DHF-specific command for loading triggers into the staging triggers database
        commands.addAll(commandMap.get("mlTriggerCommands"));

        for (Command c : commandMap.get("mlModuleCommands")) {
            if (c instanceof LoadHubModulesCommand || c instanceof LoadHubArtifactsCommand) {
                commands.add(c);
            }

            // Need this to pick up what's in ml-modules-final
            else if (c instanceof LoadUserModulesCommand) {
                commands.add(c);
            }
        }

        commands.add(new CopyQueryOptionsCommand(hubConfig));

        return commands;
    }

    protected void modifyHubConfigForDhs(String groupName) {
        // DHS will handle all forest creation
        hubConfig.getAppConfig().setCreateForests(false);
        hubConfig.getAppConfig().setGroupName(groupName);
    }

    /**
     * Builds a default set of project properties based on assumptions of how DHS works. These can then be overridden
     * via "-P" arguments on the command line.
     *
     * @return
     */
    protected Properties buildDefaultProjectProperties() {
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
        props.setProperty("mlAppServicesPort", "8010");

        props.setProperty("mlFlowDeveloperRole", "flowDeveloper");
        props.setProperty("mlFlowOperatorRole", "flowOperator");
        // Mapping this to flowDeveloper for now,
        props.setProperty("mlDataHubAdminRole", "flowDeveloper");
        props.setProperty("mlModulePermissions",
            "flowDeveloper,read,flowDeveloper,execute,flowDeveloper,insert,flowOperator,read,flowOperator,execute,flowOperator,insert");

        setDefaultPropertiesForSecureConnections(props);
    }

    /**
     * As of DHS 2.6.0, all connections to DHS require secure connections. This method then configures both
     * ml-app-deployer and DHF properties to use secure connections. In addition, all DatabaseClient connections
     * default to using basic security, again per DHF 2.6.0.
     *
     * @param props
     */
    protected void setDefaultPropertiesForSecureConnections(Properties props) {
        props.setProperty("mlAdminScheme", "https");
        props.setProperty("mlAdminSimpleSsl", "true");

        props.setProperty("mlManageScheme", "https");
        props.setProperty("mlManageSimpleSsl", "true");

        props.setProperty("mlAppServicesAuthentication", "basic");
        props.setProperty("mlAppServicesSimpleSsl", "true");

        props.setProperty("mlFinalAuth", "basic");
        props.setProperty("mlFinalSimpleSsl", "true");

        props.setProperty("mlJobAuth", "basic");
        props.setProperty("mlJobSimpleSsl", "true");

        props.setProperty("mlStagingAuth", "basic");
        props.setProperty("mlStagingSimpleSsl", "true");
    }
}
