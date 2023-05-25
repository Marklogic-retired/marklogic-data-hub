/*
 * Copyright (c) 2021 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.modules.AllButAssetsModulesFinder;
import com.marklogic.appdeployer.command.modules.LoadModulesCommand;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.file.CacheBusterDocumentFileProcessor;
import com.marklogic.client.ext.modulesloader.impl.AssetFileLoader;
import com.marklogic.client.ext.modulesloader.impl.DefaultModulesLoader;
import com.marklogic.client.ext.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.ext.modulesloader.impl.SearchOptionsFinder;
import com.marklogic.client.ext.modulesloader.impl.UserModulesFinder;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.util.HubFileFilter;
import com.marklogic.hub.impl.EntityManagerImpl;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;

import java.io.File;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Pattern;


/**
 * Extends ml-app-deployer's LoadModulesCommand, which expects to load from every path defined by "mlModulePaths", so
 * that it can also load from two DHF-specific locations - "./plugins" and "src/main/entity-config". Unfortunately,
 * those directories don't conform to the structure expected by ml-app-deployer (technically by DefaultModulesLoader
 * in ml-javaclient-util), so they require special handling, which this class provides.
 */
@Component
public class LoadUserModulesCommand extends LoadModulesCommand {

    private static final Pattern inputDirectoryPattern = Pattern.compile(".*[/\\\\]input[/\\\\].*");
    private static final Pattern harmonizeDirectoryPattern = Pattern.compile(".*[/\\\\]harmonize[/\\\\].*");
    private static final Pattern inputOrHarmonizePattern = Pattern.compile(".*[/\\\\](input|harmonize)[/\\\\][^/\\\\]+$");
    @Autowired
    private HubConfig hubConfig;

    @Autowired
    protected EntityManager entityManager;

    private final DocumentPermissionsParser documentPermissionsParser = new DefaultDocumentPermissionsParser();
    private ThreadPoolTaskExecutor threadPoolTaskExecutor;

    private boolean loadQueryOptions = true;
    private boolean loadAllModules = true;

    public void setForceLoad(boolean forceLoad) {
        this.forceLoad = forceLoad;
    }

    private boolean forceLoad = false;

    public LoadUserModulesCommand() {
        super();
        setExecuteSortOrder(460);
    }

    /**
     * For use outside of a Spring container.
     *
     * @param hubConfig
     */
    public LoadUserModulesCommand(HubConfig hubConfig) {
        this();
        this.hubConfig = hubConfig;
        this.entityManager = new EntityManagerImpl(hubConfig);
    }

    private PropertiesModuleManager getModulesManager() {
        String hubUserTimestampFilePath = hubConfig.getHubProject().getUserModulesDeployTimestampFile();
        String appConfigTimestampFilePath = hubConfig.getAppConfig().getModuleTimestampsPath();
        PropertiesModuleManager pmm = new PropertiesModuleManager(hubUserTimestampFilePath);
        logger.info("Initializing PropertiesModuleManager with properties timestamp file: " + hubUserTimestampFilePath);

        if (forceLoad) {
            logger.info("Deleting properties timestamp file as part of force load: " + hubUserTimestampFilePath);
            pmm.deletePropertiesFile();

            // Need to delete ml-javaclient-utils timestamp file as well as modules present in the standard gradle locations are now
            // loaded by the modules loader in the parent class which adds these entries to the ml-javaclient-utils timestamp file
            if (appConfigTimestampFilePath != null) {
                File defaultTimestampFile = new File(appConfigTimestampFilePath);
                if (defaultTimestampFile.exists()) {
                    if (!defaultTimestampFile.delete()) {
                        logger.info("Unable to delete module timestamp file: " + defaultTimestampFile.getAbsolutePath());
                    }
                }
            }
        }
        pmm.initialize();
        return pmm;
    }

    private AssetFileLoader getAssetFileLoader(AppConfig config, PropertiesModuleManager moduleManager) {
        AssetFileLoader assetFileLoader = new AssetFileLoader(hubConfig.newModulesDbClient(), moduleManager);
        assetFileLoader.addDocumentFileProcessor(new CacheBusterDocumentFileProcessor());
        //Add file extensions to HubFileFilter.accept() to prevent mappings, entities  files being loaded to Modules db
        assetFileLoader.addFileFilter(new HubFileFilter());
        assetFileLoader.setPermissions(config.getModulePermissions());
        return assetFileLoader;
    }

    private DefaultModulesLoader getStagingModulesLoader(AppConfig config) {
        this.threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
        this.threadPoolTaskExecutor.setCorePoolSize(16);
        // 10 minutes should be plenty of time to wait for REST API modules to be loaded
        this.threadPoolTaskExecutor.setAwaitTerminationSeconds(60 * 10);
        this.threadPoolTaskExecutor.setWaitForTasksToCompleteOnShutdown(true);
        this.threadPoolTaskExecutor.afterPropertiesSet();

        PropertiesModuleManager moduleManager = getModulesManager();
        AssetFileLoader assetFileLoader = getAssetFileLoader(config, moduleManager);

        DefaultModulesLoader modulesLoader = new DefaultModulesLoader(assetFileLoader);
        modulesLoader.setModulesManager(moduleManager);
        modulesLoader.setTaskExecutor(this.threadPoolTaskExecutor);
        modulesLoader.setShutdownTaskExecutorAfterLoadingModules(false);

        return modulesLoader;
    }

    static boolean isInputRestDir(Path dir) {
        return dir.endsWith("REST") && inputDirectoryPattern.matcher(dir.toString()).matches();
    }

    static boolean isHarmonizeRestDir(Path dir) {
        return dir.endsWith("REST") && harmonizeDirectoryPattern.matcher(dir.toString()).matches();
    }

    static boolean isFlowPropertiesFile(@NotNull Path dir) {
        Path dirFileName = dir.getFileName();
        Path parent = dir.getParent();
        Path parentFileName = parent != null ? parent.getFileName(): null;
        if (dirFileName == null || parentFileName == null) {
            return false;
        }
        String fileNameStr = dir.getFileName().toString();
        String parentFileNameStr = parentFileName.toString();
        String parentStr = parent.toString();
        return dir.toFile().isFile() && fileNameStr.endsWith(".properties") && inputOrHarmonizePattern.matcher(parentStr).matches() && fileNameStr.equals(parentFileNameStr + ".properties");
    }

    /**
     * Ask the parent class to load modules first, which should consist of reading from every path defined by
     * mlModulePaths / appConfig.getModulePaths. By default, that's just src/main/ml-modules. If any mlRestApi
     * dependencies are included, those will be in the set of module paths as well.
     *
     * The one catch here is that if any REST extensions under ./plugins have dependencies on mlRestApi libraries or
     * library modules in ml-modules, those extensions will fail to load. However, REST extensions under ./plugins
     * aren't technically supported anymore, so this should not be an issue.
     *
     * The loadAllModules bit is included solely to preserve the functionality of the DeployUserModulesTask - i.e.
     * only load from the hub-specific module locations.
     */
    private void loadModulesFromStandardMlGradleLocations(CommandContext context) {
        super.execute(context);
    }

    @Override
    public void execute(CommandContext context) {

        AppConfig config = context.getAppConfig();

        DatabaseClient stagingClient = hubConfig.newStagingClient();
        DatabaseClient finalClient = hubConfig.newFinalClient();

        Path userModulesPath = hubConfig.getHubPluginsDir();
        String baseDir = "";
        String EncodedBaseDir = userModulesPath.normalize().toAbsolutePath().toString();

        try {
            //This handles the decoding of special characters in a file location path.
            baseDir = URLDecoder.decode(EncodedBaseDir, StandardCharsets.UTF_8.name());
        }
        catch (Exception e){
            logger.warn("Issue decoding directory path.", e);
        }
        // load any user files under plugins/* int the modules database.
        // this will ignore REST folders under entities
        DefaultModulesLoader modulesLoader = getStagingModulesLoader(config);
        // Load modules from standard ml-gradle location after 'PropertiesModuleManager' is initialized. This will ensure
        // that in case of 'forceLoad', the ml-javaclient-utils timestamp file is deleted first.
        if (loadAllModules) {
            loadModulesFromStandardMlGradleLocations(context);
        }
        modulesLoader.loadModules(baseDir, new UserModulesFinder(), stagingClient);

        // Don't load these while "watching" modules (i.e. mlWatch is being run), as users can't change these
        if (loadQueryOptions) {
            modulesLoader.loadModules("classpath*:/ml-modules-final", new SearchOptionsFinder(), finalClient);
        }

        AllButAssetsModulesFinder allButAssetsModulesFinder = new AllButAssetsModulesFinder();

        // deploy the auto-generated ES search options, but not if mlWatch is being run, as it will result in the same
        // options being generated and loaded over and over
        if (loadQueryOptions) {
            String gerProjectDir = hubConfig.getHubProject().getProjectDirString();
            String decodedFileName = null;
            try {
                //This handles the decoding of special characters in a file location path
                decodedFileName = URLDecoder.decode(gerProjectDir, StandardCharsets.UTF_8.name());
            }
            catch (Exception e){
                logger.warn("Issue decoding directory path.", e);
            }
            assert decodedFileName != null;
            Path entityConfigDir = Paths.get(decodedFileName, HubConfig.ENTITY_CONFIG_DIR);
            if (!entityConfigDir.toFile().exists()) {
                if (!entityConfigDir.toFile().mkdirs()) {
                    logger.warn("Unable to create entity directory: " + entityConfigDir.toAbsolutePath());
                }
            }
            entityManager.deployQueryOptions();
        }
    }

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        if (this.entityManager == null) {
            this.entityManager = new EntityManagerImpl(hubConfig);
        }
    }

    public void setLoadQueryOptions(boolean loadQueryOptions) {
        this.loadQueryOptions = loadQueryOptions;
    }

    public void setLoadAllModules(boolean loadAllModules) {
        this.loadAllModules = loadAllModules;
    }
}

