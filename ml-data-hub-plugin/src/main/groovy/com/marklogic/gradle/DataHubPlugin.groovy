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

import com.marklogic.appdeployer.ConfigDir
import com.marklogic.appdeployer.command.Command
import com.marklogic.appdeployer.impl.SimpleAppDeployer
import com.marklogic.gradle.task.*
import com.marklogic.hub.ApplicationConfig
import com.marklogic.hub.deploy.commands.LoadHubModulesCommand
import com.marklogic.hub.deploy.commands.LoadUserStagingModulesCommand
import com.marklogic.hub.impl.*
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.context.annotation.AnnotationConfigApplicationContext

@EnableAutoConfiguration
class DataHubPlugin implements Plugin<Project> {

    private DataHubImpl dataHub
    private ScaffoldingImpl scaffolding
    private HubProjectImpl hubProject
    private HubConfigImpl hubConfig
    private LoadHubModulesCommand loadHubModulesCommand
    private LoadUserStagingModulesCommand loadUserStagingModulesCommand
    private MappingManagerImpl mappingManager
    private FlowManagerImpl flowManager
    private EntityManagerImpl entityManager

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
        setupHub(project)

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

        project.task("hubSaveIndexes", group: scaffoldGroup, type: SaveIndexes,
            description: "Saves the indexes defined in {entity-name}.entity.json file to staging and final entity config in src/main/entity-config/databases directory")

        project.task("hubDeployUserModules", group: deployGroup, type: DeployUserModulesTask,
            description: "Installs user modules into the STAGING modules database for DHF extension.")
        project.tasks.mlLoadModules.getDependsOn().add("hubDeployUserModules")
        project.tasks.replace("mlWatch", HubWatchTask)
        project.tasks.replace("mlDeleteModuleTimestampsFile", DeleteHubModuleTimestampsFileTask)

        // Tasks for deploying/undeploying the amps included in the DHF jar
        project.tasks.replace("hubDeployAmps", DeployHubAmpsTask);
        project.tasks.replace("hubUndeployAmps", UndeployHubAmpsTask);

        project.tasks.replace("mlClearModulesDatabase", ClearDHFModulesTask)
        project.tasks.replace("mlUpdateIndexes", UpdateIndexes)

        project.tasks.hubPreInstallCheck.getDependsOn().add("mlDeploySecurity")
        project.tasks.mlDeploy.getDependsOn().add("hubPreInstallCheck")
        project.tasks.mlReloadModules.setDependsOn(["mlClearModulesDatabase", "hubInstallModules", "mlLoadModules"])

        String flowGroup = "MarkLogic Data Hub Flow Management"
        project.task("hubRunFlow", group: flowGroup, type: RunFlowTask)
        project.task("hubDeleteJobs", group: flowGroup, type: DeleteJobsTask)
        project.task("hubExportJobs", group: flowGroup, type: ExportJobsTask)
        // This task is undocumented, so don't let it appear in the list
        project.task("hubImportJobs", group: null, type: ImportJobsTask)

        logger.info("Finished initializing ml-data-hub\n")
    }

    void setupHub(Project project) {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext()
        ctx.register(ApplicationConfig.class)
        ctx.refresh()

        hubConfig = ctx.getBean(HubConfigImpl.class)
        hubProject = ctx.getBean(HubProjectImpl.class)
        dataHub = ctx.getBean(DataHubImpl.class)
        scaffolding = ctx.getBean(ScaffoldingImpl.class)
        loadHubModulesCommand = ctx.getBean(LoadHubModulesCommand.class)
        loadUserStagingModulesCommand = ctx.getBean(LoadUserStagingModulesCommand.class)
        mappingManager = ctx.getBean(MappingManagerImpl.class)
        flowManager = ctx.getBean(FlowManagerImpl.class)
        entityManager = ctx.getBean(EntityManagerImpl.class)

        initializeProjectExtensions(project)
    }

    void initializeProjectExtensions(Project project) {

        def extensions = project.getExtensions()

        hubConfig.createProject(project.getProjectDir().getAbsolutePath())
        if(! hubProject.isInitialized()) {
            hubConfig.initHubProject()
        }

        // The Gradle set of properties is passed in as they've already been loaded and processed by the Gradle properties plugin.
        hubConfig.refreshProject(new ProjectPropertySource(project).getProperties(), false)

        hubConfig.setAppConfig(extensions.getByName("mlAppConfig"))
        hubConfig.setAdminConfig(extensions.getByName("mlAdminConfig"))
        hubConfig.setAdminManager(extensions.getByName("mlAdminManager"))
        hubConfig.setManageConfig(extensions.getByName("mlManageConfig"))
        hubConfig.setManageClient(extensions.getByName("mlManageClient"))

        project.extensions.add("hubConfig", hubConfig)
        project.extensions.add("hubProject", hubProject)
        project.extensions.add("dataHub", dataHub)
        project.extensions.add("scaffolding", scaffolding)
        project.extensions.add("loadHubModulesCommand", loadHubModulesCommand)
        project.extensions.add("loadUserStagingModulesCommand", loadUserStagingModulesCommand)
        project.extensions.add("mappingManager", mappingManager)
        project.extensions.add("flowManager", flowManager)
        project.extensions.add("entityManager", entityManager)

        configureAppDeployer(project)

        println "Will look for resource configuration files in the following directories:"
        for (ConfigDir configDir : hubConfig.getAppConfig().getConfigDirs()) {
            println "Configuration directory: " + configDir.getBaseDir()
        }
    }


    void configureAppDeployer(Project project) {
        SimpleAppDeployer mlAppDeployer = project.extensions.getByName("mlAppDeployer")
        if (mlAppDeployer == null) {
            throw new RuntimeException("You must apply the ml-gradle plugin before the ml-datahub plugin.")
        }

        DataHubImpl hubImpl = (DataHubImpl)dataHub;
        Map<String, List<Command>> commandsMap = hubImpl.buildCommandMap()

        /**
         * Need to update each ml(resource type)Commands extension that was added by ml-gradle. This accounts for
         * changes made by DataHubImpl to the command map.
         */
        List<Command> newSetOfCommands = new ArrayList()
        for (String key : commandsMap.keySet()) {
            List<Command> commands = commandsMap.get(key)
            newSetOfCommands.addAll(commands)
            if (project.extensions.findByName(key) != null) {
                List<Command> existingCommands = project.extensions.findByName(key)
                existingCommands.clear()
                existingCommands.addAll(commands)
            } else {
                project.extensions.add(key, commands);
            }
        }

        mlAppDeployer.setCommands(newSetOfCommands)

    }
}
