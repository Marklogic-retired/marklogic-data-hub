package com.marklogic.hub.cli;

import com.beust.jcommander.Parameter;
import com.beust.jcommander.Parameters;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.DeployDatabaseFieldCommand;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.resource.hosts.HostManager;
import org.springframework.http.ResponseEntity;

import java.util.*;

@Parameters(commandDescription = "Install or upgrade DHF into a DHS environment")
public class InstallDhfInDhsCommand extends AbstractInstallerCommand {

    @Parameter(
        names = {"-h", "--hostname"},
        required = true,
        description = "Name of the MarkLogic host that the installer connects to (should correspond to the value of the 'mlHost' property). " +
            "This is used for changing the group on the host so that query options can be loaded into the staging/final servers in both " +
            "the Curator and Evaluator groups. Note that changing the group forces MarkLogic to restart."
    )
    private String hostname;

    @Override
    public void run(Options options) {
        initializeProject(options);

        logger.info("Installing DHF version " + hubConfig.getJarVersion());

        HubAppDeployer deployer = new HubAppDeployer(
            hubConfig.getManageClient(), hubConfig.getAdminManager(), null, hubConfig.newStagingClient());

        logger.info("Getting current group for host: " + hostname);
        final String originalGroupName = new HostManager(hubConfig.getManageClient()).getAssignedGroupName(hostname);
        logger.info(format("Current group is %s; will set host %s back to that group after DHF is deployed",
            originalGroupName, hostname));

        try {
            String groupName = "Evaluator";
            modifyHubConfigForDhs(groupName);
            setHostToGroup(hubConfig, groupName);
            deployer.setCommands(buildCommandsForDhs());
            deployer.deploy(hubConfig.getAppConfig());

            // Update the servers in the Curator group
            groupName = "Curator";
            modifyHubConfigForDhs(groupName);
            deployer.setCommands(Arrays.asList(new DhsDeployServersCommand()));
            deployer.deploy(hubConfig.getAppConfig());

            // Load the modules via the Curator group so that query options are registered there
            setHostToGroup(hubConfig, groupName);
            deployer.setCommands(dataHub.buildCommandMap().get("mlModuleCommands"));
            deployer.deploy(hubConfig.getAppConfig());
        } finally {
            setHostToGroup(hubConfig, originalGroupName);
        }
    }

    /**
     * In the spirit of whitelisting, we'll only setup the commands that we know we need for installing DHF.
     * We may need a more broad set of commands for user files.
     */
    protected List<Command> buildCommandsForDhs() {
        List<Command> commands = new ArrayList<>();
        commands.add(new DeployPrivilegesCommand());
        commands.add(new DeployAmpsCommand());
        commands.add(new DhsDeployDatabasesCommand(hubConfig));
        commands.add(new DhsDeployServersCommand());
        commands.add(new DeployTriggersCommand());
        commands.add(new DeployDatabaseFieldCommand());

        Map<String, List<Command>> commandMap = dataHub.buildCommandMap();
        commands.addAll(commandMap.get("mlModuleCommands"));

        return commands;
    }

    protected void modifyHubConfigForDhs(String groupName) {
        // DHS will handle all forest creation
        hubConfig.getAppConfig().setCreateForests(false);
        hubConfig.getAppConfig().setGroupName(groupName);
    }

    /**
     * The intended use case is that an executable DHF jar can be run from any directory, which means we need to first
     * initialize a DHF project (specifically, generating the gradle.properties file) and then refresh HubConfig based
     * on those properties and anything a client passed in via JVM props.
     *
     * @param options
     */
    protected void initializeProject(Options options) {
        // Include System properties so that a client can override e.g. mlHost/mlUsername/mlPassword via JVM props
        Properties props = new Properties();
        for (String key : System.getProperties().stringPropertyNames()) {
            props.put(key, System.getProperties().getProperty(key));
        }

        // Properties required for DHS
        props.setProperty("mlIsHostLoadBalancer", "true");
        props.setProperty("mlIsProvisionedEnvironment", "true");

        // Overrides for DHS
        props.setProperty("mlFlowDeveloperRole", "flowDeveloper");
        props.setProperty("mlFlowOperatorRole", "flowOperator");
        // Mapping this to flowDeveloper for now,
        props.setProperty("mlDataHubAdminRole", "flowDeveloper");
        props.setProperty("mlModulePermissions",
            "rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute,flowDeveloper,read,flowDeveloper,execute,flowDeveloper,insert,flowOperator,read,flowOperator,execute");

        initializeProject(options, props);
    }

    protected void setHostToGroup(HubConfigImpl hubConfig, String groupName) {
        logger.info(String.format("Setting group to '%s' for host '%s'", groupName, hostname));
        ResponseEntity<String> response = new HostManager(hubConfig.getManageClient()).setHostToGroup(hostname, groupName);
        if (response != null && response.getHeaders().getLocation() != null) {
            hubConfig.getAdminManager().waitForRestart();
        }
        logger.info(String.format("Finished setting group to '%s' for host '%s'", groupName, hostname));
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }
}
