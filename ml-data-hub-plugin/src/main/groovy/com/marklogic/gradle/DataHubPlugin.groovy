/*
 * Copyright 2012-2019 MarkLogic Corporation
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
import com.marklogic.appdeployer.command.CommandContext
import com.marklogic.appdeployer.impl.SimpleAppDeployer
import com.marklogic.gradle.task.*
import com.marklogic.gradle.task.client.WatchTask
import com.marklogic.gradle.task.command.HubUpdateIndexesCommand
import com.marklogic.gradle.task.databases.ClearModulesDatabaseTask
import com.marklogic.gradle.task.databases.UpdateIndexesTask
import com.marklogic.gradle.task.dhs.DhsDeployTask
import com.marklogic.hub.ApplicationConfig
import com.marklogic.hub.cli.command.InstallIntoDhsCommand
import com.marklogic.hub.deploy.commands.ClearDHFModulesCommand
import com.marklogic.hub.deploy.commands.GenerateFunctionMetadataCommand
import com.marklogic.hub.deploy.commands.GeneratePiiCommand
import com.marklogic.hub.deploy.commands.LoadHubArtifactsCommand
import com.marklogic.hub.deploy.commands.LoadHubModulesCommand
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand
import com.marklogic.hub.deploy.util.ModuleWatchingConsumer
import com.marklogic.hub.impl.*
import com.marklogic.hub.legacy.impl.LegacyFlowManagerImpl
import org.gradle.api.GradleException
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
    private LoadHubArtifactsCommand loadHubArtifactsCommand
    private LoadUserModulesCommand loadUserModulesCommand
    private LoadUserArtifactsCommand loadUserArtifactsCommand
    private MappingManagerImpl mappingManager
    private MasteringManagerImpl masteringManager
    private StepDefinitionManagerImpl stepManager
    private FlowManagerImpl flowManager
    private LegacyFlowManagerImpl legacyFlowManager
    private EntityManagerImpl entityManager
    private GeneratePiiCommand generatePiiCommand
    private GenerateFunctionMetadataCommand generateFunctionMetadataCommand

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
            description: "Enables debugging on the running DHF server. Requires flow-developer-role or equivalent.")
        project.task("hubDisableDebugging", group: deployGroup, type: DisableDebuggingTask,
            description: "Disables debugging on the running DHF server. Requires flow-developer-role or equivalent.")
        project.task("hubEnableTracing", group: deployGroup, type: EnableTracingTask,
            description: "Enables tracing on the running DHF server. Requires flow-developer-role or equivalent.")
        project.task("hubDisableTracing", group: deployGroup, type: DisableTracingTask,
            description: "Disables tracing on the running DHF server. Requires flow-developer-role or equivalent.")
        project.task("hubPreInstallCheck", group: deployGroup, type: PreinstallCheckTask,
            description: "Ascertains whether a MarkLogic server can accept installation of the DHF.  Requires administrative privileges to the server.")
        project.task("hubInfo", group: deployGroup, type: HubInfoTask)
        project.task("hubUpdate", group: deployGroup, type: UpdateHubTask)

        String scaffoldGroup = "MarkLogic Data Hub Scaffolding"
        project.task("hubInit", group: scaffoldGroup, type: InitProjectTask)
        project.task("hubCreateMapping", group: scaffoldGroup, type: CreateMappingTask)
        project.task("hubCreateStepDefinition", group: scaffoldGroup, type: CreateStepDefinitionTask)
        project.task("hubCreateEntity", group: scaffoldGroup, type: CreateEntityTask)
        project.task("hubCreateFlow", group: scaffoldGroup, type: CreateFlowTask)
        project.task("hubCreateHarmonizeFlow", group: scaffoldGroup, type: CreateHarmonizeLegacyFlowTask)
        project.task("hubCreateInputFlow", group: scaffoldGroup, type: CreateInputLegacyFlowTask)
        project.task("hubGenerateExplorerOptions", group: scaffoldGroup, type: GenerateExplorerQueryOptions,
            description: "Generates the query options files required for Explorer application")
            .finalizedBy(["hubDeployUserModules"])
        project.task("hubGeneratePii", group: scaffoldGroup, type: GeneratePiiTask,
            description: "Generates Security Configuration for all Entity Properties marked 'pii'")
        project.task("hubGenerateTDETemplates", group: scaffoldGroup, type: GenerateTDETemplateFromEntityTask,
            description: "Generates TDE Templates from the entity definition files. It is possible to only generate TDE templates" +
                " for specific entities by setting the (comma separated) project property 'entityNames'. E.g. -PentityNames=Entity1,Entity2")
        project.task("hubSaveIndexes", group: scaffoldGroup, type: SaveIndexes,
            description: "Saves the indexes defined in {entity-name}.entity.json file to staging and final entity config in src/main/entity-config/databases directory")

        project.tasks.mlPostDeploy.getDependsOn().add("hubGenerateExplorerOptions")

        // Hub Mastering tasks
        String masteringGroup = "MarkLogic Data Hub Mastering Tasks"
        project.task("hubUnmergeEntities", group: masteringGroup, type: UnmergeEntitiesTask,
            description: "Reverses the last set of merges made into the given merge URI.\n -PmergeURI=URI. \n" +
                "-PretainAuditTrail=<true|false> (default true) determines if provenance for the merge/unmerge is kept. \n" +
                "-PblockFutureMerges=<true|false> (default true) ensures that the documents won't be merged together in the next mastering run.")

        project.task("hubMergeEntities", group: masteringGroup, type: MergeEntitiesTask,
            description: "Manually merge documents together given a set of options.\n -PmergeURIs=<URI1>,...,<URIn> –  the URIs of the documents to merge, separated by commas.\n" +
                "-PflowName=<true|false> – optional; if true, the merged document will be moved to an archive collection; if false, the merged document will be deleted. Defaults to true.\n" +
                "-Pstep=<masteringStepNumber> – optional; The number of the mastering step with settings. Defaults to 1.\n" +
                "-Ppreview=<true|false> – optional; if true, the merge doc is returned in the response body and not committed to the database; if false, the merged document will be saved. Defaults to false.\n" +
                "-Poptions=<stepOptionOverrides> – optional; Any overrides to the mastering step options. Defaults to {}.")

        ((UpdateIndexesTask)project.tasks.getByName("mlUpdateIndexes")).command = new HubUpdateIndexesCommand(dataHub)

        WatchTask watchTask = project.tasks.getByName("mlWatch")
        CommandContext commandContext = new CommandContext(hubConfig.getAppConfig(), hubConfig.getManageClient(), hubConfig.getAdminManager())
        watchTask.onModulesLoaded = new ModuleWatchingConsumer(commandContext, generateFunctionMetadataCommand)
        watchTask.afterModulesLoadedCallback = new AfterModulesLoadedCallback(loadUserModulesCommand, commandContext)

        ((ClearModulesDatabaseTask)project.tasks.getByName("mlClearModulesDatabase")).command = new ClearDHFModulesCommand(hubConfig, dataHub)
        project.tasks.mlClearModulesDatabase.getDependsOn().add("mlDeleteModuleTimestampsFile")

        /*
            DHF has triggers that generate TDE and entity file in the schemas database so finalizing by
            "hubDeployUserArtifacts" which will refresh these files after "mlReloadSchemas" clears them.
        */
        project.tasks.mlReloadSchemas.finalizedBy(["hubDeployUserArtifacts"])

        project.task("hubInstallModules", group: deployGroup, type: DeployHubModulesTask,
            description: "Installs DHF internal modules.  Requires flow-developer-role or equivalent.")
            .mustRunAfter(["mlClearModulesDatabase"])

        // This isn't likely to be used, but it's being kept for regression purposes for now
        project.task("hubDeployUserModules", group: deployGroup, type: DeployUserModulesTask,
            description: "Installs user modules from the plugins and src/main/entity-config directories.")
            .finalizedBy(["hubDeployUserArtifacts"])

        project.task("hubDeployArtifacts", group: deployGroup, type: DeployHubArtifactsTask,
            description: "Installs hub artifacts such as default mappings and default flows.")

        project.task("hubDeployUserArtifacts", group: deployGroup, type: DeployUserArtifactsTask,
            description: "Installs user artifacts such as entities and mappings.")

        // DHF uses an additional timestamps file needs to be deleted when the ml-gradle one is deleted
        project.task("hubDeleteModuleTimestampsFile", type: DeleteHubModuleTimestampsFileTask, group: deployGroup)
        project.tasks.mlDeleteModuleTimestampsFile.getDependsOn().add("hubDeleteModuleTimestampsFile")

        /**
         * mlDeploySecurity can't be used here because it will deploy amps under src/main/ml-config, and those will fail
         * to deploy since the modules database hasn't been created yet.
         */
        project.task("hubDeploySecurity", type: HubDeploySecurityTask)
        project.tasks.hubPreInstallCheck.getDependsOn().add("hubDeploySecurity")
        project.tasks.mlDeploy.getDependsOn().add("hubPreInstallCheck")

        String legacyFlowGroup = "MarkLogic Data Hub LegacyFlow Management"
        project.task("hubRunLegacyFlow", group: legacyFlowGroup, type: RunLegacyFlowTask)
        project.task("hubDeleteJobs", group: legacyFlowGroup, type: DeleteJobsTask)
        project.task("hubExportLegacyJobs", group: legacyFlowGroup, type: ExportLegacyJobsTask)
        // This task is undocumented, so don't let it appear in the list
        project.task("hubImportJobs", group: null, type: ImportJobsTask)

        String flowGroup = "MarkLogic Data Hub Flow Management"
        project.task("hubRunFlow", group: flowGroup, type: RunFlowTask)

        String dhsGroup = "DHS"
        project.task("dhsDeploy", group: dhsGroup, type: DhsDeployTask,
            description: "Deploy project resources and modules into a DHS instance"
        ).finalizedBy(["hubGenerateExplorerOptions"])

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
        loadHubArtifactsCommand = ctx.getBean(LoadHubArtifactsCommand.class)
        loadUserModulesCommand = ctx.getBean(LoadUserModulesCommand.class)
        loadUserArtifactsCommand = ctx.getBean(LoadUserArtifactsCommand.class)
        mappingManager = ctx.getBean(MappingManagerImpl.class)
        masteringManager = ctx.getBean(MasteringManagerImpl.class)
        stepManager = ctx.getBean(StepDefinitionManagerImpl.class)
        flowManager = ctx.getBean(FlowManagerImpl.class)
        legacyFlowManager = ctx.getBean(LegacyFlowManagerImpl.class)
        entityManager = ctx.getBean(EntityManagerImpl.class)
        generatePiiCommand = ctx.getBean(GeneratePiiCommand.class)
        generateFunctionMetadataCommand = ctx.getBean(GenerateFunctionMetadataCommand.class)

        project.extensions.add("dataHubApplicationContext", ctx)

        initializeProjectExtensions(project)
    }

    void initializeProjectExtensions(Project project) {

        def extensions = project.getExtensions()

        hubConfig.createProject(project.getProjectDir().getAbsolutePath())

        boolean calledHubInit = this.userCalledTask(project, "hubinit")
        boolean calledHubUpdate = this.userCalledTask(project, "hubupdate")
        boolean calledHubInitOrUpdate = calledHubInit || calledHubUpdate

        if (!calledHubInitOrUpdate && !hubProject.isInitialized()) {
            throw new GradleException("Please initialize your project first by running the 'hubInit' Gradle task, or update it by running the 'hubUpdate' Gradle task")
        }

        else {

            // If the user called hubInit, only load the configuration. Refreshing the project will fail because
            // gradle.properties doesn't exist yet.
            if (calledHubInit) {
                hubConfig.loadConfigurationFromProperties(new ProjectPropertySource(project).getProperties(), false)
            }
             else {
                Properties props = new ProjectPropertySource(project).getProperties()

                if (userCalledTask(project, "dhsdeploy")) {
                    new InstallIntoDhsCommand().applyDhsSpecificProperties(props)
                }

                hubConfig.refreshProject(props, false)
            }

            // By default, DHF uses gradle-local.properties for your local environment.
            def envNameProp = project.hasProperty("environmentName") ? project.property("environmentName") : "local"
            hubConfig.withPropertiesFromEnvironment(envNameProp.toString())

            hubConfig.setAppConfig(extensions.getByName("mlAppConfig"))
            hubConfig.setAdminConfig(extensions.getByName("mlAdminConfig"))
            hubConfig.setAdminManager(extensions.getByName("mlAdminManager"))
            hubConfig.setManageConfig(extensions.getByName("mlManageConfig"))
            hubConfig.setManageClient(extensions.getByName("mlManageClient"))

            // Turning off CMA for resources that have bugs in ML 9.0-7/8
            hubConfig.getAppConfig().getCmaConfig().setCombineRequests(false);
            hubConfig.getAppConfig().getCmaConfig().setDeployDatabases(false);
            hubConfig.getAppConfig().getCmaConfig().setDeployRoles(false);
            hubConfig.getAppConfig().getCmaConfig().setDeployUsers(false);

            project.extensions.add("hubConfig", hubConfig)
            project.extensions.add("hubProject", hubProject)
            project.extensions.add("dataHub", dataHub)
            project.extensions.add("scaffolding", scaffolding)
            project.extensions.add("loadHubModulesCommand", loadHubModulesCommand)
            project.extensions.add("loadHubArtifactsCommand", loadHubArtifactsCommand)
            project.extensions.add("loadUserModulesCommand", loadUserModulesCommand)
            project.extensions.add("loadUserArtifactsCommand", loadUserArtifactsCommand)
            project.extensions.add("mappingManager", mappingManager)
            project.extensions.add("masteringManager", masteringManager)
            project.extensions.add("stepManager", stepManager)
            project.extensions.add("flowManager", flowManager)
            project.extensions.add("legacyFlowManager", legacyFlowManager)
            project.extensions.add("entityManager", entityManager)
            project.extensions.add("generatePiiCommand", generatePiiCommand)

            configureAppDeployer(project)
        }
    }

    boolean userCalledTask(Project project, String lowerCaseTaskName) {
        for (String taskName : project.getGradle().getStartParameter().getTaskNames()) {
            if (taskName.toLowerCase().equals(lowerCaseTaskName)) {
                return true
            }
        }
        return false
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
