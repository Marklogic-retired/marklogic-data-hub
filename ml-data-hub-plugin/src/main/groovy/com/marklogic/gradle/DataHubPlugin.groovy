package com.marklogic.gradle

import com.marklogic.appdeployer.impl.SimpleAppDeployer
import com.marklogic.gradle.task.*
import com.marklogic.hub.DataHub
import com.marklogic.hub.DefaultHubConfigFactory
import com.marklogic.hub.HubConfig
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class DataHubPlugin implements Plugin<Project> {

    private DataHub dataHub

    Logger logger = LoggerFactory.getLogger(getClass())

    @Override
    void apply(Project project) {
        if (DataHub.versionCompare(project.gradle.gradleVersion, "3.1") == -1) {
            logger.error("\n\n" +
                "********************************\n" +
                "Hold the phone!\n\n" +
                "You need Gradle 3.1 or greater.\n" +
                "********************************" +
                "\n\n")
            return
        }

        project.plugins.apply(MarkLogicPlugin.class)

        logger.info("\nInitializing data-hub-gradle")

        initializeProjectExtensions(project)
        configureAppDeployer(project)

        String deployGroup = "MarkLogic Data Hub Setup"
        project.task("hubEnableDebugging", group: deployGroup, type: EnableDebuggingTask)
        project.task("hubDisableDebugging", group: deployGroup, type: DisableDebuggingTask)
        project.task("hubEnableTracing", group: deployGroup, type: EnableTracingTask)
        project.task("hubDisableTracing", group: deployGroup, type: DisableTracingTask)
        project.task("hubInstallModules", type: DeployHubModulesTask).mustRunAfter(["mlClearModulesDatabase"])
        project.task("hubInfo", type: HubInfoTask)

        String scaffoldGroup = "MarkLogic Data Hub Scaffolding"
        project.task("hubInit", group: scaffoldGroup, type: InitProjectTask)
        project.task("hubCreateEntity", group: scaffoldGroup, type: CreateEntityTask)
        project.task("hubCreateHarmonizeFlow", group: scaffoldGroup, type: CreateHarmonizeFlowTask)
        project.task("hubCreateInputFlow", group: scaffoldGroup, type: CreateInputFlowTask)

        project.tasks.replace("mlLoadModules", DeployUserModulesTask)
        project.tasks.replace("mlWatch", HubWatchTask)
        project.tasks.replace("mlDeleteModuleTimestampsFile", DeleteHubModuleTimestampsFileTask)
        project.tasks.mlReloadModules.setDependsOn(["mlClearModulesDatabase", "hubInstallModules", "mlLoadModules"])

        String flowGroup = "MarkLogic Data Hub Flow Management"
        project.task("hubRunFlow", group: flowGroup, type: RunFlowTask)

        logger.info("Finished initializing ml-data-hub\n")
    }

    void initializeProjectExtensions(Project project) {
        HubConfig hubConfig = new DefaultHubConfigFactory(project, new ProjectPropertySource(project)).newHubConfig()
        hubConfig.updateAppConfig(project.mlAppConfig)
        project.extensions.add("hubConfig", hubConfig)

        dataHub = new DataHub(hubConfig)
        project.extensions.add("dataHub", dataHub)
    }

    void configureAppDeployer(Project project) {
        SimpleAppDeployer mlAppDeployer = project.extensions.getByName("mlAppDeployer")
        if (mlAppDeployer == null) {
            throw new RuntimeException("You must apply the ml-gradle plugin before the ml-datahub plugin.")
        }

        mlAppDeployer.setCommands(dataHub.getCommandList())
    }
}
