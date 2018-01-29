package com.marklogic.gradle

import com.marklogic.appdeployer.impl.SimpleAppDeployer
import com.marklogic.gradle.task.*
import com.marklogic.hub.DataHub
import com.marklogic.hub.HubConfigBuilder
import com.marklogic.hub.util.Versions
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class DataHubPlugin implements Plugin<Project> {

    private DataHub dataHub

    Logger logger = LoggerFactory.getLogger(getClass())

    @Override
    void apply(Project project) {
        if (Versions.compare(project.gradle.gradleVersion, "3.4") == -1) {
            logger.error("\n\n" +
                "********************************\n" +
                "Hold the phone!\n\n" +
                "You need Gradle 3.4 or greater.\n" +
                "We provide gradle wrappers ./gradlew or gradlew.bat for your convenience.\n" +
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
        project.task("hubPreInstallCheck", type: PreinstallCheckTask)
        project.task("hubInfo", type: HubInfoTask)
        project.task("hubUpdate", group: deployGroup, type: UpdateHubTask)

        String scaffoldGroup = "MarkLogic Data Hub Scaffolding"
        project.task("hubInit", group: scaffoldGroup, type: InitProjectTask)
        project.task("hubCreateEntity", group: scaffoldGroup, type: CreateEntityTask)
        project.task("hubCreateHarmonizeFlow", group: scaffoldGroup, type: CreateHarmonizeFlowTask)
        project.task("hubCreateInputFlow", group: scaffoldGroup, type: CreateInputFlowTask)

        project.tasks.replace("mlLoadModules", DeployUserModulesTask)
        project.tasks.replace("mlWatch", HubWatchTask)
        project.tasks.replace("mlDeleteModuleTimestampsFile", DeleteHubModuleTimestampsFileTask)
        project.tasks.mlDeploy.getDependsOn().add("hubPreInstallCheck")
        project.tasks.mlReloadModules.setDependsOn(["mlClearModulesDatabase", "hubInstallModules", "mlLoadModules"])

        String flowGroup = "MarkLogic Data Hub Flow Management"
        project.task("hubRunFlow", group: flowGroup, type: RunFlowTask)
        project.task("hubDeleteJobs", group: flowGroup, type: DeleteJobsTask )

        logger.info("Finished initializing ml-data-hub\n")
    }

    void initializeProjectExtensions(Project project) {
        def projectDir = project.getProjectDir().getAbsolutePath()
        def properties = new ProjectPropertySource(project).getProperties()
        def extensions = project.getExtensions()

        def hubConfig = HubConfigBuilder.newHubConfigBuilder(projectDir)
            .withProperties(properties)
            .withAppConfig(extensions.getByName("mlAppConfig"))
            .withAdminConfig(extensions.getByName("mlAdminConfig"))
            .withAdminManager(extensions.getByName("mlAdminManager"))
            .withManageConfig(extensions.getByName("mlManageConfig"))
            .withManageClient(extensions.getByName("mlManageClient"))
            .build()
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
