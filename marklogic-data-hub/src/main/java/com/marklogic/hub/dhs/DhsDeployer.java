package com.marklogic.hub.dhs;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.CmaConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.alert.DeployAlertActionsCommand;
import com.marklogic.appdeployer.command.alert.DeployAlertConfigsCommand;
import com.marklogic.appdeployer.command.alert.DeployAlertRulesCommand;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.appdeployer.command.schemas.LoadSchemasCommand;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.security.DeployProtectedPathsCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.appdeployer.command.tasks.DeployScheduledTasksCommand;
import com.marklogic.appdeployer.command.temporal.DeployTemporalAxesCommand;
import com.marklogic.appdeployer.command.temporal.DeployTemporalCollectionsCommand;
import com.marklogic.appdeployer.command.temporal.DeployTemporalCollectionsLSQTCommand;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.deploy.HubAppDeployer;
import com.marklogic.hub.deploy.commands.*;
import com.marklogic.hub.dhs.installer.deploy.DeployHubAmpsCommand;
import com.marklogic.hub.dhs.installer.deploy.DeployHubQueryRolesetsCommand;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.hub.impl.VersionInfo;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Handles deploying resources to DHS.
 */
public class DhsDeployer extends LoggingObject {

    public void deployAsDeveloper(HubConfigImpl hubConfig) {
        throwExceptionIfMarkLogicVersionIsInvalid(hubConfig);
        prepareAppConfigForDeployingToDhs(hubConfig);

        HubAppDeployer dhsDeployer = new HubAppDeployer(hubConfig.getManageClient(), hubConfig.getAdminManager(), null, null);
        dhsDeployer.setCommands(buildCommandsForDeveloper(hubConfig));
        dhsDeployer.deploy(hubConfig.getAppConfig());
    }

    public void deployAsSecurityAdmin(HubConfigImpl hubConfig) {
        throwExceptionIfMarkLogicVersionIsInvalid(hubConfig);
        prepareAppConfigForDeployingToDhs(hubConfig);

        HubAppDeployer dhsDeployer = new HubAppDeployer(hubConfig.getManageClient(), hubConfig.getAdminManager(), null, null);
        dhsDeployer.setCommands(buildCommandsForSecurityAdmin());
        dhsDeployer.deploy(hubConfig.getAppConfig());
    }

    public void throwExceptionIfMarkLogicVersionIsInvalid(HubConfig hubConfig) {
        MarkLogicVersion mlVersion = new MarkLogicVersion(hubConfig.getManageClient());
        if (!mlVersion.supportsDataHubFramework()) {
            throw new RuntimeException(String.format("Cannot proceed as this version of Data Hub does not support the detected version of MarkLogic:\n" +
                    "MarkLogic host: %s\n" +
                    "MarkLogic version: %s\n" +
                    "Data Hub client version: %s\n" +
                    "Please see https://docs.marklogic.com/datahub/refs/version-compatibility.html for information on the minimum required MarkLogic version.", hubConfig.getHost(), mlVersion.getVersionString(), VersionInfo.getBuildVersion()));
        }
    }

    /**
     * The AppConfig object belonging to HubConfig can be configured based on known DHS environment settings. This
     * minimizes the number of properties that a user needs to specify themselves - i.e. the user shouldn't be expected
     * to configure all the properties that are known to be true about a DHS instance.
     *
     * @param hubConfig
     */
    protected void prepareAppConfigForDeployingToDhs(HubConfig hubConfig) {
        /**
         * It's likely the user has this set for deploying to DHS. But in case the user wants to test this on an
         * on-premise installation, it may not seem intuitive to set it to true. But it needs to be set to true so that
         * DHF knows to e.g. remove certain properties when updating databases to avoid privilege errors. The property
         * should arguably be interpreted as "is the user restricted" as opposed to "is the environment provisioned".
         */
        hubConfig.setIsProvisionedEnvironment(true);

        setKnownValuesForDhsDeployment(hubConfig);

        AppConfig appConfig = hubConfig.getAppConfig();

        // We always want all user modules loaded
        appConfig.setModuleTimestampsPath(null);

        // We never want forests created, DHS handles that
        appConfig.setCreateForests(false);

        removeHubInternalConfigFromConfigDirs(appConfig);
        addEntityConfigToConfigDirs(hubConfig.getHubProject(), appConfig);

        // 8000 is not available in DHS
        int port = hubConfig.getPort(DatabaseKind.STAGING);
        logger.info("Setting App-Services port to: " + port);
        appConfig.setAppServicesPort(port);

        if (hubConfig.getSimpleSsl(DatabaseKind.STAGING)) {
            logger.info("Enabling simple SSL for App-Services");
            appConfig.setAppServicesSimpleSslConfig();
        }

        String authMethod = hubConfig.getAuthMethod(DatabaseKind.STAGING);
        if (authMethod != null) {
            logger.info("Setting security context type for App-Services to: " + authMethod);
            appConfig.setAppServicesSecurityContextType(SecurityContextType.valueOf(authMethod.toUpperCase()));
        }

        // As part of the fix for DHFPROD-5073, disabling all CMA usage, as data-hub-developer/operator are not allowed
        // to use CMA for all resource types
        appConfig.setCmaConfig(new CmaConfig(false));

        // See DeployAsDeveloperTest for comments on why CMA is used for protected paths - seems to deal with a timing
        // issue when deploying many protected paths a certain amount of time after deploying query rolesets.
        appConfig.getCmaConfig().setDeployProtectedPaths(true);
    }

    /**
     * The contents of hub-internal-config should have been deployed to DHS already via the DHF installer. And
     * it is expected that a user will have permission to deploy all of the resources in this directory.
     *
     * @param appConfig
     */
    protected void removeHubInternalConfigFromConfigDirs(AppConfig appConfig) {
        List<ConfigDir> safeConfigDirs = new ArrayList<>();
        appConfig.getConfigDirs().forEach(configDir -> {
            final String path = configDir.getBaseDir().getAbsolutePath();
            if (!path.toLowerCase().endsWith("hub-internal-config")) {
                safeConfigDirs.add(configDir);
            }
        });
        appConfig.setConfigDirs(safeConfigDirs);
    }

    /**
     * Because the hub-internal-config directory is excluded, the staging database won't be updated unless the user has
     * a staging-database.json file in their ml-config directory. That means that the indexes in entity-config won't be
     * applied. To avoid this, the entity-config directory is added as a configDir.
     *
     * @param hubProject
     * @param appConfig
     */
    protected void addEntityConfigToConfigDirs(HubProject hubProject, AppConfig appConfig) {
        File entityConfigDir = hubProject.getEntityConfigDir().toFile();
        if (entityConfigDir.exists()) {
            File f = hubProject.getProjectDir().resolve(entityConfigDir.toString()).normalize().toAbsolutePath().toFile();
            appConfig.getConfigDirs().add(new ConfigDir(f));
        }
    }

    /**
     * Per DHFPROD-2897, these are known values in a DHS installation that can be set so that they override any changes
     * the user may have made for their on-premise installation.
     *
     * @param hubConfig
     */
    protected void setKnownValuesForDhsDeployment(HubConfig hubConfig) {
        hubConfig.setHttpName(DatabaseKind.STAGING, HubConfig.DEFAULT_STAGING_NAME);
        hubConfig.setHttpName(DatabaseKind.FINAL, HubConfig.DEFAULT_FINAL_NAME);
        hubConfig.setHttpName(DatabaseKind.JOB, HubConfig.DEFAULT_JOB_NAME);
        hubConfig.setDbName(DatabaseKind.STAGING, HubConfig.DEFAULT_STAGING_NAME);
        hubConfig.setDbName(DatabaseKind.FINAL, HubConfig.DEFAULT_FINAL_NAME);
        hubConfig.setDbName(DatabaseKind.JOB, HubConfig.DEFAULT_JOB_NAME);
        hubConfig.setDbName(DatabaseKind.MODULES, HubConfig.DEFAULT_MODULES_DB_NAME);
        hubConfig.setDbName(DatabaseKind.STAGING_TRIGGERS, HubConfig.DEFAULT_STAGING_TRIGGERS_DB_NAME);
        hubConfig.setDbName(DatabaseKind.STAGING_SCHEMAS, HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
        hubConfig.setDbName(DatabaseKind.FINAL_TRIGGERS, HubConfig.DEFAULT_FINAL_TRIGGERS_DB_NAME);
        hubConfig.setDbName(DatabaseKind.FINAL_SCHEMAS, HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);

        AppConfig appConfig = hubConfig.getAppConfig();
        if (appConfig != null) {
            appConfig.setContentDatabaseName(hubConfig.getDbName(DatabaseKind.FINAL));
            appConfig.setTriggersDatabaseName(hubConfig.getDbName(DatabaseKind.FINAL_TRIGGERS));
            appConfig.setSchemasDatabaseName(hubConfig.getDbName(DatabaseKind.FINAL_SCHEMAS));
            appConfig.setModulesDatabaseName(hubConfig.getDbName(DatabaseKind.MODULES));

            Map<String, String> customTokens = appConfig.getCustomTokens();
            customTokens.put("%%mlStagingDbName%%", hubConfig.getDbName(DatabaseKind.STAGING));
            customTokens.put("%%mlFinalDbName%%", hubConfig.getDbName(DatabaseKind.FINAL));
            customTokens.put("%%mlJobDbName%%", hubConfig.getDbName(DatabaseKind.JOB));
            customTokens.put("%%mlModulesDbName%%", hubConfig.getDbName(DatabaseKind.MODULES));
            customTokens.put("%%mlStagingAppserverName%%", hubConfig.getDbName(DatabaseKind.STAGING));
            customTokens.put("%%mlFinalAppserverName%%", hubConfig.getDbName(DatabaseKind.FINAL));
            customTokens.put("%%mlJobAppserverName%%", hubConfig.getDbName(DatabaseKind.JOB));
            customTokens.put("%%mlStagingTriggersDbName%%", hubConfig.getDbName(DatabaseKind.STAGING_TRIGGERS));
            customTokens.put("%%mlStagingSchemasDbName%%", hubConfig.getDbName(DatabaseKind.STAGING_SCHEMAS));
            customTokens.put("%%mlFinalTriggersDbName%%", hubConfig.getDbName(DatabaseKind.FINAL_TRIGGERS));
            customTokens.put("%%mlFinalSchemasDbName%%", hubConfig.getDbName(DatabaseKind.FINAL_SCHEMAS));
        }
    }

    protected List<Command> buildCommandsForSecurityAdmin() {
        List<Command> commands = new ArrayList<>();
        commands.add(new DeployPrivilegesCommand());
        commands.add(new DeployRolesCommand());
        commands.add(new DeployHubAmpsCommand());
        return commands;
    }

    protected List<Command> buildCommandsForDeveloper(HubConfig hubConfig) {
        List<Command> commands = new ArrayList<>();

        DeployOtherDatabasesCommand deployOtherDatabasesCommand = new DeployOtherDatabasesCommand();
        HubDeployDatabaseCommandFactory dbCommandFactory = new HubDeployDatabaseCommandFactory(hubConfig);
        dbCommandFactory.setMergeEntityConfigFiles(false);
        deployOtherDatabasesCommand.setDeployDatabaseCommandFactory(dbCommandFactory);
        deployOtherDatabasesCommand.setResourceFilenamesIncludePattern(buildPatternForDatabasesToUpdateIndexesFor());
        commands.add(deployOtherDatabasesCommand);

        // Per DHFPROD-5073, need this so that OOTB DH fields/indexes can be restored in case they're removed by the user
        commands.add(new DeployDatabaseFieldCommand());

        commands.add(new DeployAlertConfigsCommand());
        commands.add(new DeployAlertActionsCommand());
        commands.add(new DeployAlertRulesCommand());

        commands.add(new LoadUserArtifactsCommand(hubConfig));
        LoadUserModulesCommand loadUserModulesCommand = new LoadUserModulesCommand(hubConfig);
        loadUserModulesCommand.setForceLoad(true);
        commands.add(loadUserModulesCommand);
        commands.add(new GenerateFunctionMetadataCommand(hubConfig));

        commands.add(new DeployTemporalAxesCommand());
        commands.add(new DeployTemporalCollectionsCommand());
        commands.add(new DeployTemporalCollectionsLSQTCommand());
        commands.add(new DeployTriggersCommand());
        commands.add(new LoadSchemasCommand());
        commands.add(new DeployScheduledTasksCommand());

        /**
         * Have run into an odd problem where when a user without the "security" role deploys QRs immediately after
         * deploying PPs, the PPs don't work. Deploying PPs immediately after QRs does result in the PPs working. Or,
         * deploying QRs some amount of time after deploying PPs works as well. So in this context, PPs are deployed
         * after everything else is done, and QRs are deployed first based on the default sort order of the command.
         */
        DeployProtectedPathsCommand pathsCommand = new DeployProtectedPathsCommand();
        pathsCommand.setExecuteSortOrder(Integer.MAX_VALUE);
        commands.add(pathsCommand);

        commands.add(new DeployHubQueryRolesetsCommand());

        return commands;
    }

    /**
     * In a provisioned environment, only the databases defined by this pattern can be updated.
     *
     * @return database name pattern
     */
    protected Pattern buildPatternForDatabasesToUpdateIndexesFor() {
        return Pattern.compile("(staging|final|job)-database.json");
    }
}
