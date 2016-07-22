package com.marklogic.gradle

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.slf4j.LoggerFactory

import com.marklogic.appdeployer.AppConfig
import com.marklogic.appdeployer.AppDeployer
import com.marklogic.hub.DefaultHubConfigFactory
import com.marklogic.hub.DataHub
import com.marklogic.hub.commands.LoadHubModulesCommand
import com.marklogic.hub.commands.LoadUserModulesCommand

import com.marklogic.gradle.task.InitProjectTask
import com.marklogic.gradle.task.CreateEntityTask
import com.marklogic.gradle.task.CreateHarmonizeFlowTask
import com.marklogic.gradle.task.CreateInputFlowTask
import com.marklogic.gradle.task.RunFlowTask
import com.marklogic.gradle.task.EnableDebuggingTask
import com.marklogic.gradle.task.DisableDebuggingTask
import com.marklogic.gradle.task.EnableTracingTask
import com.marklogic.gradle.task.DisableTracingTask
import com.marklogic.gradle.task.DeployHubModulesTask
import com.marklogic.gradle.task.DeployUserModulesTask
import com.marklogic.gradle.task.HubWatchTask
import com.marklogic.hub.HubConfig
import com.marklogic.gradle.ProjectPropertySource

import com.marklogic.appdeployer.command.Command
import com.marklogic.appdeployer.command.CommandContext
import com.marklogic.appdeployer.command.alert.DeployAlertActionsCommand
import com.marklogic.appdeployer.command.alert.DeployAlertConfigsCommand
import com.marklogic.appdeployer.command.alert.DeployAlertRulesCommand
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand
import com.marklogic.appdeployer.command.appservers.UpdateRestApiServersCommand
import com.marklogic.appdeployer.command.cpf.DeployCpfConfigsCommand
import com.marklogic.appdeployer.command.cpf.DeployDomainsCommand
import com.marklogic.appdeployer.command.cpf.DeployPipelinesCommand
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand
import com.marklogic.appdeployer.command.databases.DeploySchemasDatabaseCommand
import com.marklogic.appdeployer.command.databases.DeployTriggersDatabaseCommand
import com.marklogic.appdeployer.command.flexrep.DeployConfigsCommand
import com.marklogic.appdeployer.command.flexrep.DeployFlexrepCommand
import com.marklogic.appdeployer.command.flexrep.DeployTargetsCommand
import com.marklogic.appdeployer.command.forests.ConfigureForestReplicasCommand
import com.marklogic.appdeployer.command.groups.DeployGroupsCommand
import com.marklogic.appdeployer.command.mimetypes.DeployMimetypesCommand
import com.marklogic.appdeployer.command.restapis.DeployRestApiServersCommand
import com.marklogic.appdeployer.command.schemas.LoadSchemasCommand
import com.marklogic.appdeployer.command.security.DeployAmpsCommand
import com.marklogic.appdeployer.command.security.DeployCertificateAuthoritiesCommand
import com.marklogic.appdeployer.command.security.DeployCertificateTemplatesCommand
import com.marklogic.appdeployer.command.security.DeployExternalSecurityCommand
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand
import com.marklogic.appdeployer.command.security.DeployProtectedCollectionsCommand
import com.marklogic.appdeployer.command.security.DeployRolesCommand
import com.marklogic.appdeployer.command.security.DeployUsersCommand
import com.marklogic.appdeployer.command.tasks.DeployScheduledTasksCommand
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand
import com.marklogic.appdeployer.command.viewschemas.DeployViewSchemasCommand

class DataHubPlugin implements Plugin<Project> {

    org.slf4j.Logger logger = LoggerFactory.getLogger(getClass())

    void apply(Project project) {
        logger.info("\nInitializing data-hub-gradle")

        initializeProjectExtensions(project)
        configureAppDeployer(project)

        String deployGroup = "MarkLogic Data Hub Setup"
        project.task("hubEnableDebugging", group: deployGroup, type: EnableDebuggingTask)
        project.task("hubDisableDebugging", group: deployGroup, type: DisableDebuggingTask)
        project.task("hubEnableTracing", group: deployGroup, type: EnableTracingTask)
        project.task("hubDisableTracing", group: deployGroup, type: DisableTracingTask)

        String scaffoldGroup = "MarkLogic Data Hub Scaffolding"
        project.task("hubInit", group: scaffoldGroup, type: InitProjectTask)
        project.task("hubCreateEntity", group: scaffoldGroup, type: CreateEntityTask)
        project.task("hubCreateHarmonizeFlow", group: scaffoldGroup, type: CreateHarmonizeFlowTask)
        project.task("hubCreateInputFlow", group: scaffoldGroup, type: CreateInputFlowTask)

        project.tasks.replace("mlLoadModules", DeployUserModulesTask)
        project.tasks.replace("mlWatch", HubWatchTask)
        String flowGroup = "MarkLogic Data Hub Flow Management"
        project.task("hubRunFlow", group: flowGroup, type: RunFlowTask)

        logger.info("Finished initializing ml-gradle\n")
    }

    void initializeProjectExtensions(Project project) {
        HubConfig hubConfig = new DefaultHubConfigFactory(new ProjectPropertySource(project)).newHubConfig()
        project.extensions.add("hubConfig", hubConfig)

        DataHub hub = new DataHub(hubConfig)
        project.extensions.add("dataHub", hub)

        hub.updateAppConfig(project.mlAppConfig)
    }

    void configureAppDeployer(Project project) {
        AppDeployer mlAppDeployer = project.extensions.getByName("mlAppDeployer")
        if (mlAppDeployer == null) {
            throw new RuntimeException("You must apply the ml-gradle plugin before the ml-datahub plugin.")
        }

        List<Command> commands = new ArrayList<Command>()

        // Security
        List<Command> securityCommands = new ArrayList<Command>()
        securityCommands.add(new DeployRolesCommand())
        securityCommands.add(new DeployUsersCommand())
        securityCommands.add(new DeployAmpsCommand())
        securityCommands.add(new DeployCertificateTemplatesCommand())
        securityCommands.add(new DeployCertificateAuthoritiesCommand())
        securityCommands.add(new DeployExternalSecurityCommand())
        securityCommands.add(new DeployPrivilegesCommand())
        securityCommands.add(new DeployProtectedCollectionsCommand())
        project.mlSecurityCommands.clear()
        project.mlSecurityCommands.addAll(securityCommands)
        commands.addAll(securityCommands)

        // Databases
        List<Command> dbCommands = new ArrayList<>()
        dbCommands.add(new DeployOtherDatabasesCommand())
        dbCommands.add(new DeployTriggersDatabaseCommand())
        dbCommands.add(new DeploySchemasDatabaseCommand())
        project.mlDatabaseCommands.clear()
        project.mlDatabaseCommands.addAll(dbCommands)
        commands.addAll(dbCommands)

        // Schemas
        commands.add(project.mlLoadSchemasCommand)

        // App servers
        List<Command> serverCommands = new ArrayList<Command>()
        serverCommands.add(new DeployOtherServersCommand())
        project.mlServerCommands.clear()
        project.mlServerCommands.addAll(serverCommands)
        commands.addAll(serverCommands)

        // Modules
        List<Command> modulesCommands = new ArrayList<Command>()
        modulesCommands.add(new LoadHubModulesCommand(project.hubConfig))
        modulesCommands.add(new LoadUserModulesCommand(project.hubConfig))
        commands.addAll(modulesCommands)

        // Alerting
        List<Command> alertCommands = new ArrayList<Command>()
        alertCommands.add(new DeployAlertConfigsCommand())
        alertCommands.add(new DeployAlertActionsCommand())
        alertCommands.add(new DeployAlertRulesCommand())
        project.mlAlertCommands.clear()
        project.mlAlertCommands.addAll(alertCommands)
        commands.addAll(alertCommands)

        // CPF
        List<Command> cpfCommands = new ArrayList<Command>()
        cpfCommands.add(new DeployCpfConfigsCommand())
        cpfCommands.add(new DeployDomainsCommand())
        cpfCommands.add(new DeployPipelinesCommand())
        project.mlCpfCommands.clear()
        project.mlCpfCommands.addAll(cpfCommands)
        commands.addAll(cpfCommands)

        // Flexrep
        List<Command> flexrepCommands = new ArrayList<Command>()
        flexrepCommands.add(new DeployConfigsCommand())
        flexrepCommands.add(new DeployTargetsCommand())
        flexrepCommands.add(new DeployFlexrepCommand())
        project.mlFlexrepCommands.clear()
        project.mlFlexrepCommands.addAll(flexrepCommands)
        commands.addAll(flexrepCommands)

        // Groups
        List<Command> groupCommands = new ArrayList<Command>()
        groupCommands.add(new DeployGroupsCommand())
        project.mlGroupCommands.clear()
        project.mlGroupCommands.addAll(groupCommands)
        commands.addAll(groupCommands)

        List<Command> mimetypeCommands = new ArrayList<Command>()
        mimetypeCommands.add(new DeployMimetypesCommand())
        project.mlMimetypeCommands.clear()
        project.mlMimetypeCommands.addAll(mimetypeCommands)
        commands.addAll(mimetypeCommands)

        // Forest replicas
        List<Command> replicaCommands = new ArrayList<Command>()
        replicaCommands.add(new ConfigureForestReplicasCommand())
        project.mlForestReplicaCommands.clear()
        project.mlForestReplicaCommands.addAll(replicaCommands)
        commands.addAll(replicaCommands)

        // Tasks
        List<Command> taskCommands = new ArrayList<Command>()
        taskCommands.add(new DeployScheduledTasksCommand())
        project.mlTaskCommands.clear()
        project.mlTaskCommands.addAll(taskCommands)
        commands.addAll(taskCommands)

        // Triggers
        List<Command> triggerCommands = new ArrayList<Command>()
        triggerCommands.add(new DeployTriggersCommand())
        project.mlTriggerCommands.clear()
        project.mlTriggerCommands.addAll(triggerCommands)
        commands.addAll(triggerCommands)

        // SQL Views
        List<Command> viewCommands = new ArrayList<Command>()
        viewCommands.add(new DeployViewSchemasCommand())
        project.mlViewCommands.clear()
        project.mlViewCommands.addAll(viewCommands)
        commands.addAll(viewCommands)

        mlAppDeployer.setCommands(commands)
    }
}
