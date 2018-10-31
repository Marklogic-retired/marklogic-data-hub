/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.marklogic.gradle

import com.marklogic.appdeployer.command.Command
import com.marklogic.appdeployer.impl.SimpleAppDeployer
import com.marklogic.gradle.task.*
import com.marklogic.hub.DataHub
import com.marklogic.hub.HubConfigBuilder
import com.marklogic.hub.impl.DataHubImpl
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
        project.task("hubEnableDebugging", group: deployGroup, type: EnableDebuggingTask,
            description: "Enables debugging on the running DHF server. Requires hub-admin-role or equivalent.")
        project.task("hubDisableDebugging", group: deployGroup, type: DisableDebuggingTask,
            description: "Disables debugging on the running DHF server. Requires hub-admin-role or equivalent.")
        project.task("hubEnableTracing", group: deployGroup, type: EnableTracingTask,
            description: "Enables tracing on the running DHF server. Requires hub-admin-role or equivalent.")
        project.task("hubDisableTracing", group: deployGroup, type: DisableTracingTask,
            description: "Disables tracing on the running DHF server. Requires hub-admin-role or equivalent.")
        project.task("hubInstallModules", group: deployGroup, type: DeployHubModulesTask,
            description: "Installs DHF internal modules.  Requires hub-admin-role or equivalent.")
            .mustRunAfter(["mlClearModulesDatabase"])
        project.task("hubPreInstallCheck", group: deployGroup, type: PreinstallCheckTask,
            description: "Ascertains whether a MarkLogic server can accept installation of the DHF.  Requires administrative privileges to the server.")
        project.task("hubInfo", group: deployGroup, type: HubInfoTask)
        project.task("hubUpdate", group: deployGroup, type: UpdateHubTask)

        String scaffoldGroup = "MarkLogic Data Hub Scaffolding"
        project.task("hubInit", group: scaffoldGroup, type: InitProjectTask)
        project.task("hubCreateMapping", group: scaffoldGroup, type: CreateMappingTask)
        project.task("hubCreateEntity", group: scaffoldGroup, type: CreateEntityTask)
        project.task("hubCreateHarmonizeFlow", group: scaffoldGroup, type: CreateHarmonizeFlowTask)
        project.task("hubCreateInputFlow", group: scaffoldGroup, type: CreateInputFlowTask)
        project.task("hubGeneratePii", group: scaffoldGroup, type: GeneratePiiTask,
            description: "Generates Security Configuration for all Entity Properties marked 'pii'")
        project.task("hubGenerateTDETemplates", group: scaffoldGroup, type: GenerateTDETemplateFromEntityTask,
            description: "Generates TDE Templates from the entity definition files. It is possible to only generate TDE templates" +
                " for specific entities by setting the (comma separated) project property 'entityNames'. E.g. -PentityNames=Entity1,Entity2")

        project.task("hubDeployUserModules", group: deployGroup, type: DeployUserModulesTask,
            description: "Installs user modules into the STAGING modules database for DHF extension.")
        project.tasks.mlLoadModules.getDependsOn().add("hubDeployUserModules")
        project.tasks.replace("mlWatch", HubWatchTask)
        project.tasks.replace("mlDeleteModuleTimestampsFile", DeleteHubModuleTimestampsFileTask)
        project.tasks.replace("mlDeployRoles", DeployHubRolesTask);
        project.tasks.replace("mlDeployUsers", DeployHubUsersTask);
        project.tasks.replace("mlDeployAmps", DeployHubAmpsTask);
        project.tasks.replace("mlUndeployRoles", UndeployHubRolesTask);
        project.tasks.replace("mlUndeployUsers", UndeployHubUsersTask);
        project.tasks.replace("mlUndeployAmps", UndeployHubAmpsTask);
        project.tasks.replace("mlClearModulesDatabase", ClearDHFModulesTask)
		project.tasks.replace("mlUpdateIndexes", UpdateIndexes)
        project.tasks.mlDeploySecurity.getDependsOn().add("mlDeployRoles");
        project.tasks.mlDeploySecurity.getDependsOn().add("mlDeployUsers");
        project.tasks.mlUndeploySecurity.getDependsOn().add("mlUndeployRoles");
        project.tasks.mlUndeploySecurity.getDependsOn().add("mlUndeployUsers");
        project.tasks.hubPreInstallCheck.getDependsOn().add("mlDeploySecurity")
        project.tasks.mlDeploy.getDependsOn().add("hubPreInstallCheck")
        project.tasks.mlReloadModules.setDependsOn(["mlClearModulesDatabase", "hubInstallModules", "mlLoadModules"])

        String flowGroup = "MarkLogic Data Hub Flow Management"
        project.task("hubRunFlow", group: flowGroup, type: RunFlowTask)
        project.task("hubDeleteJobs", group: flowGroup, type: DeleteJobsTask )
        project.task("hubExportJobs", group: flowGroup, type: ExportJobsTask )
        // This task is undocumented, so don't let it appear in the list
        project.task("hubImportJobs", group: null, type: ImportJobsTask )

        logger.info("Finished initializing ml-data-hub\n")
    }

    void initializeProjectExtensions(Project project) {
        def projectDir = project.getProjectDir().getAbsolutePath()
        def properties = new ProjectPropertySource(project).getProperties()
        def extensions = project.getExtensions()

        def hubConfig = HubConfigBuilder.newHubConfigBuilder(projectDir)
            .withProperties(properties)
            .withStagingAppConfig(extensions.getByName("mlAppConfig"))
            .withAdminConfig(extensions.getByName("mlAdminConfig"))
            .withAdminManager(extensions.getByName("mlAdminManager"))
            .withManageConfig(extensions.getByName("mlManageConfig"))
            .withManageClient(extensions.getByName("mlManageClient"))
            .build()
        project.extensions.add("hubConfig", hubConfig)

        dataHub = DataHub.create(hubConfig)
        project.extensions.add("dataHub", dataHub)
    }

    void configureAppDeployer(Project project) {
        SimpleAppDeployer mlAppDeployer = project.extensions.getByName("mlAppDeployer")
        if (mlAppDeployer == null) {
            throw new RuntimeException("You must apply the ml-gradle plugin before the ml-datahub plugin.")
        }
        List <Command> allCommands = new ArrayList()
        allCommands.addAll(((DataHubImpl)dataHub).getFinalCommandList())
        allCommands.addAll(((DataHubImpl)dataHub).getStagingCommandList())
        mlAppDeployer.setCommands(allCommands)
    }
}
