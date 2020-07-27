package com.marklogic.hub.dhs.installer.command;

import com.beust.jcommander.Parameters;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.dhs.installer.Options;
import com.marklogic.hub.dhs.installer.deploy.CopyQueryOptionsCommand;
import com.marklogic.hub.dhs.installer.deploy.DhsDeployServersCommand;
import com.marklogic.hub.dhs.installer.deploy.UpdateDhsModulesPermissionsCommand;
import org.springframework.context.ApplicationContext;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.regex.Pattern;

@Parameters(commandDescription = "Install or upgrade DHF into a DHS environment")
public class InstallIntoDhsCommand extends AbstractInstallerCommand {

    @Override
    public void run(ApplicationContext context, Options options) {
        initializeProject(context, options, buildDefaultProjectProperties(options));

        ObjectNode canInstall = canInstallDhs();
        if(canInstall.get("canBeInstalled").asBoolean()){
            logger.info("Installing DHF version " + hubConfig.getJarVersion());

            HubAppDeployer deployer = new HubAppDeployer(hubConfig.getManageClient(), hubConfig.getAdminManager(), null, null);

            String groupName = "Evaluator";
            modifyHubConfigForDhs(groupName);
            deployer.setCommands(buildCommandsForDhs(options));
            deployer.deploy(hubConfig.getAppConfig());

            // Update the servers in the Curator group
            groupName = "Curator";
            modifyHubConfigForDhs(groupName);
            DhsDeployServersCommand dhsDeployServersCommand = new DhsDeployServersCommand();
            dhsDeployServersCommand.setServerVersion(serverVersion);
            deployer.setCommands(Arrays.asList(dhsDeployServersCommand));
            deployer.deploy(hubConfig.getAppConfig());
        }
        else {
            logger.error("Unable to install DHF version " + hubConfig.getJarVersion());
            System.err.println(canInstall.get("message").asText());
            System.exit(1);
        }
    }

    /**
     * In the spirit of whitelisting, we'll only setup the commands that we know we need for installing DHF.
     * We may need a more broad set of commands for user files.
     */
    protected List<Command> buildCommandsForDhs(Options options) {
        DeployOtherDatabasesCommand dbCommand = new DeployOtherDatabasesCommand();
        HubDeployDatabaseCommandFactory dbCommandFactory = new HubDeployDatabaseCommandFactory(hubConfig);
        dbCommandFactory.setMergeExistingArrayProperties(true);
        dbCommand.setDeployDatabaseCommandFactory(dbCommandFactory);

        List<String> groupNames = Arrays.asList(options.getGroupNames().split(","));

        List<Command> commands = new ArrayList<>();
        commands.add(new DeployPrivilegesCommand());

        DeployRolesCommand deployRolesCommand = new DeployRolesCommand();
        deployRolesCommand.setResourceFilenamesExcludePattern(
            Pattern.compile("(flow-developer-role|flow-operator-role|data-hub-admin-role).*")
        );
        commands.add(deployRolesCommand);

        commands.add(new DeployAmpsCommand());
        commands.add(dbCommand);

        DhsDeployServersCommand ddsc = new DhsDeployServersCommand();
        ddsc.setServerVersion(serverVersion);
        commands.add(ddsc);

        commands.add(new DeployDatabaseFieldCommand());

        commands.add(new DeployTriggersCommand());
        commands.add(new DeployHubTriggersCommand(hubConfig.getStagingTriggersDbName()));

        commands.add(new LoadHubModulesCommand(hubConfig));
        commands.add(new LoadHubArtifactsCommand(hubConfig));

        // DHS is known to be compatible with entity-services-based mapping. Setting this field avoids the need to make
        // another DatabaseClient, which the Versions class will do.
        GenerateFunctionMetadataCommand generateFunctionMetadataCommand = new GenerateFunctionMetadataCommand(hubConfig, true);
        generateFunctionMetadataCommand.setCatchExceptionsForUserModules(true);
        commands.add(generateFunctionMetadataCommand);

        commands.add(new CopyQueryOptionsCommand(hubConfig, groupNames,
            Arrays.asList(options.getServerNames().split(",")), hubConfig.getDbName(DatabaseKind.JOB)
        ));
        commands.add(new UpdateDhsModulesPermissionsCommand(hubConfig));

        commands.add(new CreateGranularPrivilegesCommand(hubConfig, groupNames));

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
     * @param options
     * @return
     */
    protected Properties buildDefaultProjectProperties(Options options) {
        // Include System properties so that a client can override e.g. mlHost/mlUsername/mlPassword via JVM props
        Properties props = new Properties();
        for (String key : System.getProperties().stringPropertyNames()) {
            props.put(key, System.getProperties().getProperty(key));
        }

        props.setProperty("mlIsHostLoadBalancer", "true");
        props.setProperty("mlIsProvisionedEnvironment", "true");
        props.setProperty("mlAppServicesPort", "8010");

        props.setProperty("mlFlowDeveloperRole", "flowDeveloper");
        props.setProperty("mlFlowOperatorRole", "flowOperator");
        props.setProperty("mlModulePermissions",
            "data-hub-module-reader,read,data-hub-module-reader,execute,data-hub-environment-manager,update,rest-extension-user,execute");

        props.setProperty("mlAppServicesAuthentication", "basic");
        props.setProperty("mlFinalAuth", "basic");
        props.setProperty("mlJobAuth", "basic");
        props.setProperty("mlStagingAuth", "basic");

        if (options.isDisableSsl()) {
            logger.info("Not setting default property values for secure connections to MarkLogic");
        } else {
            setDefaultPropertiesForSecureConnections(props);
        }

        return props;
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

        props.setProperty("mlAppServicesSimpleSsl", "true");
        props.setProperty("mlFinalSimpleSsl", "true");
        props.setProperty("mlJobSimpleSsl", "true");
        props.setProperty("mlStagingSimpleSsl", "true");
    }
}
