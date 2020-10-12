/*
 * Copyright (c) 2020 MarkLogic Corporation
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

import com.marklogic.appdeployer.AppConfig
import com.marklogic.appdeployer.command.Command
import com.marklogic.appdeployer.command.CommandContext
import com.marklogic.appdeployer.impl.SimpleAppDeployer
import com.marklogic.gradle.task.*
import com.marklogic.gradle.task.client.WatchTask
import com.marklogic.gradle.task.command.HubUpdateIndexesCommand
import com.marklogic.gradle.task.databases.UpdateIndexesTask
import com.marklogic.gradle.task.deploy.DeployAsDeveloperTask
import com.marklogic.gradle.task.deploy.DeployAsSecurityAdminTask
import com.marklogic.hub.gradle.task.ApplyProjectZipTask
import com.marklogic.hub.gradle.task.DeleteLegacyMappingsTask
import com.marklogic.hub.gradle.task.ConvertForHubCentralTask
import com.marklogic.hub.gradle.task.FixCreatedByStepTask
import com.marklogic.hub.ApplicationConfig
import com.marklogic.hub.deploy.commands.*
import com.marklogic.hub.deploy.util.ModuleWatchingConsumer
import com.marklogic.hub.gradle.task.PreviewFixCreatedByStepTask
import com.marklogic.hub.gradle.task.PullConfigurationFilesTask
import com.marklogic.hub.impl.*
import com.marklogic.hub.legacy.impl.LegacyFlowManagerImpl
import com.marklogic.mgmt.ManageClient
import com.marklogic.mgmt.ManageConfig
import com.marklogic.mgmt.admin.AdminConfig
import com.marklogic.mgmt.admin.AdminManager
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

        logger.info("\nInitializing ml-data-hub Gradle plugin")
        setupHub(project)

        String setupGroup = "Data Hub Setup"
        project.task("hubInit", group: setupGroup, type: InitProjectTask)
        project.task("hubUpdate", group: setupGroup, type: UpdateHubTask)
        project.task("hubVersion", group: setupGroup, type: HubVersionTask,
            description: "Prints the versions of Data Hub and MarkLogic associated with the value of mlHost, and also prints the version of " +
                "Data Hub associated with this Gradle task")
        project.task("hubExportProject", group: setupGroup, type: ExportProjectTask,
            description: "Exports the contents of the hub project directory")

        String deployGroup = "Data Hub Deploy"
        project.task("hubDeployAsSecurityAdmin", group: deployGroup, type: DeployAsSecurityAdminTask,
            description: "Deploy roles as a user with the data-hub-security-admin role")
        project.task("hubDeployAsDeveloper", group: deployGroup, type: DeployAsDeveloperTask,
            description: "Deploy project configuration as a user with the data-hub-developer role"
        )
            .dependsOn("mlPrepareBundles", "hubGeneratePii", "hubSaveIndexes") // Needed for https://github.com/marklogic-community/ml-gradle/wiki/Bundles
            .mustRunAfter("hubDeployAsSecurityAdmin")
        project.task("hubDeploy", group: deployGroup, dependsOn: ["hubDeployAsDeveloper", "hubDeployAsSecurityAdmin"],
            description: "Deploy project configuration as a user with the data-hub-security-admin and data-hub-developer roles")
        project.task("dhsDeploy", dependsOn: ["hubDeploy"],
            description: "dhsDeploy has been replaced in 5.2.0 by hubDeploy and similar tasks. It is now simply an alias for hubDeploy.")
        project.task("hubPreInstallCheck", type: PreinstallCheckTask,
            description: "Ascertains whether a MarkLogic server can accept installation of the DHF.  Requires administrative privileges to the server.")
        project.task("hubInfo", type: HubInfoTask)

        String hubConversionGroup = "Data Hub Conversion"
        project.task("hubDeleteLegacyMappings", group: hubConversionGroup, type: DeleteLegacyMappingsTask,
            description: "Delete installed legacy mappings, which are mappings that have not been converted into the format required by Hub Central"
        ).mustRunAfter("hubDeployUserArtifacts")
        project.task("hubConvertForHubCentral", group: hubConversionGroup, type: ConvertForHubCentralTask,
            description: "Convert flows, mappings and entity models in the local project that were created before version 5.3.0 into the new format required for usage within Hub Central"
        ).finalizedBy(["hubSaveIndexes"])

        String developGroup = "Data Hub Develop"
        project.task("hubApplyProjectZip", group: developGroup, type: ApplyProjectZipTask,
            description: "Apply a project zip that was downloaded from Hub Central to this project. This will first delete " +
                "all user files that can be managed with Hub Central, which are: entity models, entity model-based files, flows, and steps. " +
                "The contents of the project zip, specified via -Pfile=/path/to/hub-central-project.zip, " +
                "will then be extracted into the project directory.")
        project.task("hubPullConfigurationFiles", group: developGroup, type: PullConfigurationFilesTask,
            description: "Download user configuration files from a Hub Central instance and apply them to this project. " +
                "This consists of downloading the user configuration files (entity models, entity model-based files, flows, and steps) as a zip, " +
                "deleting all such user configuration files in the project directory, "+
                "and finally extracting the contents of the downloaded zip into the project directory.")
        project.task("hubClearUserData", type: ClearUserDataTask, group: developGroup,
            description: "Clears user data in the staging, final, and job databases, only leaving behind hub and user " +
                "artifacts. Requires sufficient privilege to be able to clear each of the databases. " +
                "Requires -Pconfirm=true to be set so this isn't accidentally executed.")
        project.task("hubClearUserArtifacts", type: ClearUserArtifactsTask, group: developGroup,
            description: "Clears all user artifacts in the staging, final databases. Requires -Pconfirm=true to be set so this isn't accidentally executed.")
        project.task("hubClearUserModules", type: ClearUserModulesTask, group: developGroup,
            description: "Clears user modules in the modules database, only leaving the modules " +
                "that come with DataHub installation. Requires -Pconfirm=true to be set so this isn't accidentally executed.")
        project.task("hubCreateMapping", group: developGroup, type: CreateMappingTask)
        project.task("hubCreateStepDefinition", group: developGroup, type: CreateStepDefinitionTask,
            description: "Create a new step definition in your project; specify a name via -PstepDefName=YourStepDefName, " +
                "a type (either 'ingestion' or 'custom'; defaults to 'custom') via -PstepDefType=ingestion|custom, " +
                "and a format (either 'sjs' or 'xqy'; defaults to 'sjs') via -Pformat=sjs|xqy")
        project.task("hubCreateStep", group: developGroup, type: CreateStepTask,
            description: "Create a new step file and write it to the staging and final databases and to your project; specify a step name via -PstepName=YourStepName, " +
                "a step type via -PstepType=(ingestion|mapping|custom|matching|merging)")
        project.task("hubAddStepToFlow", group: developGroup, type: AddStepToFlowTask,
            description: "Add a step to a flow in staging and final databases and write it to your project; specify a flow name via -PflowName=YourFlowName, " +
                "step name via -PstepName=YourStepName and a step type via -PstepType=(ingestion|mapping|custom|matching|merging|mastering)")
        project.task("hubCreateEntity", group: developGroup, type: CreateEntityTask)
        project.task("hubCreateFlow", group: developGroup, type: CreateFlowTask,
            description: "Create a new flow file and write it to the staging and final database and to your project; specify a flow name with -PflowName=YourFlowName and " +
                "optionally generate a default set of inline steps by including -PwithInlineSteps=true")
        project.task("hubGeneratePii", group: developGroup, type: GeneratePiiTask,
            description: "Generates Security Configuration for all Entity Properties marked 'pii'")
        project.task("hubGenerateTDETemplates", group: developGroup, type: GenerateTDETemplateFromEntityTask,
            description: "Generates TDE Templates from the entity definition files. It is possible to only generate TDE templates" +
                " for specific entities by setting the (comma separated) project property 'entityNames'. E.g. -PentityNames=Entity1,Entity2")
        project.task("hubSaveIndexes", group: developGroup, type: SaveIndexes,
            description: "Saves the indexes defined in {entity-name}.entity.json file to staging and final entity config in src/main/entity-config/databases directory")
        project.task("hubInstallModules", group: developGroup, type: DeployHubModulesTask,
            description: "Installs DHF internal modules.  Requires flow-developer-role or equivalent.")
            .mustRunAfter(["mlClearModulesDatabase"])
        project.task("hubDeployUserModules", group: developGroup, type: DeployUserModulesTask,
            description: "Installs user modules from the plugins and src/main/entity-config directories.")
            .finalizedBy(["hubDeployUserArtifacts"])
        project.task("hubDeployArtifacts", group: developGroup, type: DeployHubArtifactsTask,
            description: "Installs hub artifacts such as default mappings and default flows.")
        project.task("hubDeployUserArtifacts", group: developGroup, type: DeployUserArtifactsTask,
            description: "Installs user artifacts such as entities and mappings.")
        // DHF uses an additional timestamps file needs to be deleted when the ml-gradle one is deleted
        project.task("hubDeleteModuleTimestampsFile", type: DeleteHubModuleTimestampsFileTask, group: developGroup)
        project.tasks.mlDeleteModuleTimestampsFile.getDependsOn().add("hubDeleteModuleTimestampsFile")

        String runGroup = "Data Hub Run"
        project.task("hubRunFlow", group: runGroup, type: RunFlowTask)
        project.task("hubEnableDebugging", group: runGroup, type: EnableDebuggingTask,
            description: "Enables debugging on the running DHF server. Requires flow-developer-role or equivalent.")
        project.task("hubDisableDebugging", group: runGroup, type: DisableDebuggingTask,
            description: "Disables debugging on the running DHF server. Requires flow-developer-role or equivalent.")
        project.task("hubEnableTracing", group: runGroup, type: EnableTracingTask,
            description: "Enables tracing on the running DHF server. Requires flow-developer-role or equivalent.")
        project.task("hubDisableTracing", group: runGroup, type: DisableTracingTask,
            description: "Disables tracing on the running DHF server. Requires flow-developer-role or equivalent.")
        project.task("hubUnmergeEntities", group: runGroup, type: UnmergeEntitiesTask,
            description: "Reverses the last set of merges made into the given merge URI.\n -PmergeURI=URI. \n" +
                "-PretainAuditTrail=<true|false> (default true) determines if provenance for the merge/unmerge is kept. \n" +
                "-PblockFutureMerges=<true|false> (default true) ensures that the documents won't be merged together in the next mastering run.")
        project.task("hubMergeEntities", group: runGroup, type: MergeEntitiesTask,
            description: "Manually merge documents together given a set of options.\n -PmergeURIs=<URI1>,...,<URIn> –  the URIs of the documents to merge, separated by commas.\n" +
                "-PflowName=<true|false> – optional; if true, the merged document will be moved to an archive collection; if false, the merged document will be deleted. Defaults to true.\n" +
                "-Pstep=<masteringStepNumber> – optional; The number of the mastering step with settings. Defaults to 1.\n" +
                "-Ppreview=<true|false> – optional; if true, the merge doc is returned in the response body and not committed to the database; if false, the merged document will be saved. Defaults to false.\n" +
                "-Poptions=<stepOptionOverrides> – optional; Any overrides to the mastering step options. Defaults to {}.")

        project.task("hubFixCreatedByStep", type: FixCreatedByStepTask, group: runGroup,
            description: "Fix the value of the datahubCreatedByStep metadata key on documents where the value is a step " +
                "definition name instead of a step name. Specify the database to perform this in via -Pdatabase=(name of staging or final database).")
        project.task("hubPreviewFixCreatedByStep", type: PreviewFixCreatedByStepTask, group: runGroup,
            description: "Previews running hubFixCreatedByStep by printing the number of documents whose datahubCreatedByStep " +
                "metadata key is a step definition name instead of a step name. " +
                "Specify the database to perform this in via -Pdatabase=(name of staging or final database).")

        String legacyFlowGroup = "Data Hub Legacy Flow"
        project.task("hubCreateHarmonizeFlow", group: legacyFlowGroup, type: CreateHarmonizeLegacyFlowTask)
        project.task("hubCreateInputFlow", group: legacyFlowGroup, type: CreateInputLegacyFlowTask)
        project.task("hubRunLegacyFlow", group: legacyFlowGroup, type: RunLegacyFlowTask)
        project.task("hubDeleteJobs", group: legacyFlowGroup, type: DeleteJobsTask)
        project.task("hubExportLegacyJobs", group: legacyFlowGroup, type: ExportLegacyJobsTask)
        project.task("hubImportJobs", group: legacyFlowGroup, type: ImportJobsTask)

        ((UpdateIndexesTask)project.tasks.getByName("mlUpdateIndexes")).command = new HubUpdateIndexesCommand(dataHub)

        WatchTask watchTask = project.tasks.getByName("mlWatch")
        CommandContext commandContext = new CommandContext(hubConfig.getAppConfig(), hubConfig.getManageClient(), hubConfig.getAdminManager())
        watchTask.onModulesLoaded = new ModuleWatchingConsumer(commandContext, generateFunctionMetadataCommand)
        watchTask.afterModulesLoadedCallback = new AfterModulesLoadedCallback(loadUserModulesCommand, commandContext)

        // DHF has triggers that generate TDE and entity file in the schemas database so finalizing by
        // "hubDeployUserArtifacts" which will refresh these files after "mlReloadSchemas" clears them.
        project.tasks.mlReloadSchemas.finalizedBy(["hubDeployUserArtifacts"])

        // mlDeploySecurity can't be used here because it will deploy amps under src/main/ml-config, and those will fail
        // to deploy since the modules database hasn't been created yet.
        project.task("hubDeploySecurity", type: HubDeploySecurityTask)
        project.tasks.hubPreInstallCheck.getDependsOn().add("hubDeploySecurity")
        project.tasks.mlDeploy.getDependsOn().add("hubPreInstallCheck")

        logger.info("Finished initializing ml-data-hub\n")
    }

    void setupHub(Project project) {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext()
        ctx.register(ApplicationConfig.class)
        ctx.refresh()

        hubConfig = ctx.getBean(HubConfigImpl.class)
        hubProject = hubConfig.getHubProject()
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

        project.extensions.add("dataHubApplicationContext", ctx)

        initializeProjectExtensions(project)
    }

    void initializeProjectExtensions(Project project) {

        def extensions = project.getExtensions()

        hubConfig.createProject(project.getProjectDir().getAbsolutePath())

        boolean calledHubInitOrUpdate = userCalledTask(project, "hubinit") || userCalledTask(project, "hubupdate")
        if (!calledHubInitOrUpdate && !hubProject.isInitialized()) {
            throw new GradleException("Please initialize your project first by running the 'hubInit' Gradle task, or update it by running the 'hubUpdate' Gradle task")
        }

        else {
            // By default, DHF uses gradle-local.properties for your local environment.
            def envNameProp = project.hasProperty("environmentName") ? project.property("environmentName") : "local"
            hubConfig.withPropertiesFromEnvironment(envNameProp.toString())

            AppConfig mlGradleAppConfig = extensions.getByName("mlAppConfig")
            ManageConfig mlGradleManageConfig = extensions.getByName("mlManageConfig")
            AdminConfig mlGradleAdminConfig = extensions.getByName("mlAdminConfig")

            // Apply all of the properties loaded by Gradle to hubConfig
            // Have to reuse the Config objects created by ml-gradle so that they're updated based on DHF properties
            hubConfig.applyProperties(new ProjectPropertySource(project), mlGradleAppConfig, mlGradleManageConfig, mlGradleAdminConfig)

            // Because applying DHF properties may have modified the ManageConfig/AdminConfig objects, we need to re-set
            // those to force the underlying connection objects to be rebuilt
            ManageClient mlGradleManageClient = extensions.getByName("mlManageClient")
            mlGradleManageClient.setManageConfig(mlGradleManageConfig)
            AdminManager mlGradleAdminManager = extensions.getByName("mlAdminManager")
            mlGradleAdminManager.setAdminConfig(mlGradleAdminConfig)

            // Turning off CMA for resources that have bugs in ML 9.0-7/8
            // TODO This can likely be removed now that DHF requires a version higher than those, but will need to test
            // to confirm.
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
