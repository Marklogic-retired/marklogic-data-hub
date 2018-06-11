/*
 * Copyright 2012-2018 MarkLogic Corporation
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
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.modules.AllButAssetsModulesFinder;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.ext.modulesloader.Modules;
import com.marklogic.client.ext.modulesloader.ModulesManager;
import com.marklogic.client.ext.modulesloader.impl.AssetFileLoader;
import com.marklogic.client.ext.modulesloader.impl.DefaultModulesLoader;
import com.marklogic.client.ext.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.com.marklogic.client.ext.file.CacheBusterDocumentFileProcessor;
import com.marklogic.com.marklogic.client.ext.modulesloader.impl.EntityDefModulesFinder;
import com.marklogic.com.marklogic.client.ext.modulesloader.impl.UserModulesFinder;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.util.HubFileFilter;
import com.marklogic.hub.error.LegacyFlowsException;
import com.marklogic.hub.flow.Flow;
import org.apache.commons.io.IOUtils;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Date;
import java.util.List;
import java.util.regex.Pattern;

public class LoadUserModulesCommand extends AbstractCommand {

    private HubConfig hubConfig;
    private DocumentPermissionsParser documentPermissionsParser = new DefaultDocumentPermissionsParser();
    private ThreadPoolTaskExecutor threadPoolTaskExecutor;

    public void setForceLoad(boolean forceLoad) {
        this.forceLoad = forceLoad;
    }

    private boolean forceLoad = false;

    public LoadUserModulesCommand(HubConfig hubConfig) {
        setExecuteSortOrder(SortOrderConstants.LOAD_MODULES + 1);
        this.hubConfig = hubConfig;
    }

    private PropertiesModuleManager getModulesManager() {
        String timestampFile = hubConfig.getUserModulesDeployTimestampFile();
        PropertiesModuleManager pmm = new PropertiesModuleManager(timestampFile);
        if (forceLoad) {
            pmm.deletePropertiesFile();
        }
        return pmm;
    }

    private AssetFileLoader getAssetFileLoader(AppConfig config, PropertiesModuleManager moduleManager) {
        AssetFileLoader assetFileLoader = new AssetFileLoader(hubConfig.newModulesDbClient(), moduleManager);
        assetFileLoader.addDocumentFileProcessor(new CacheBusterDocumentFileProcessor());
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

    boolean isInputRestDir(Path dir) {
        return dir.endsWith("REST") && dir.toString().matches(".*[/\\\\]input[/\\\\].*");
    }

    boolean isHarmonizeRestDir(Path dir) {
        return dir.endsWith("REST") && dir.toString().matches(".*[/\\\\]harmonize[/\\\\].*");
    }

    boolean isEntityDir(Path dir, Path startPath) {
        String dirStr = dir.toString();
        String startPathStr = Pattern.quote(startPath.toString());
        String regex = startPathStr + "[/\\\\][^/\\\\]+$";
        return dirStr.matches(regex);
    }

    boolean isFlowPropertiesFile(Path dir) {
        Path parent = dir.getParent();
        return dir.toFile().isFile() &&
            dir.getFileName().toString().endsWith(".properties") &&
            parent.toString().matches(".*[/\\\\](input|harmonize)[/\\\\][^/\\\\]+$") &&
            dir.getFileName().toString().equals(parent.getFileName().toString() + ".properties");
    }

    @Override
    public void execute(CommandContext context) {
        FlowManager flowManager = FlowManager.create(hubConfig);
        List<String> legacyFlows = flowManager.getLegacyFlows();
        if (legacyFlows.size() > 0) {
            throw new LegacyFlowsException(legacyFlows);
        }

        AppConfig config = context.getAppConfig();

        DatabaseClient stagingClient = hubConfig.newStagingManageClient();
        DatabaseClient finalClient = hubConfig.newFinalManageClient();

        Path userModulesPath = hubConfig.getHubPluginsDir();
        String baseDir = userModulesPath.normalize().toAbsolutePath().toString();
        Path startPath = userModulesPath.resolve("entities");

        // load any user files under plugins/* int the modules database.
        // this will ignore REST folders under entities
        DefaultModulesLoader modulesLoader = getStagingModulesLoader(config);
        modulesLoader.loadModules(baseDir, new UserModulesFinder(), stagingClient);

        JSONDocumentManager entityDocMgr = finalClient.newJSONDocumentManager();

        AllButAssetsModulesFinder allButAssetsModulesFinder = new AllButAssetsModulesFinder();

        Path dir = Paths.get(hubConfig.getProjectDir(), HubConfig.ENTITY_CONFIG_DIR);
        if (!dir.toFile().exists()) {
            dir.toFile().mkdirs();
        }

        // deploy the auto-generated ES search options
        EntityManager entityManager = EntityManager.create(hubConfig);
        entityManager.deployQueryOptions();

        try {
            if (startPath.toFile().exists()) {
                XMLDocumentManager documentManager = hubConfig.newModulesDbClient().newXMLDocumentManager();
                DocumentWriteSet documentWriteSet = documentManager.newWriteSet();

                ModulesManager modulesManager = modulesLoader.getModulesManager();

                Files.walkFileTree(startPath, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                        String currentDir = dir.normalize().toAbsolutePath().toString();

                        // for REST dirs we need to deploy all the REST stuff (transforms, options, services, etc)
                        if (isInputRestDir(dir)) {
                            modulesLoader.loadModules(currentDir, allButAssetsModulesFinder, stagingClient);
                            return FileVisitResult.SKIP_SUBTREE;
                        }
                        // for harmonize dir we put stuff in final
                        else if (isHarmonizeRestDir(dir)) {
                            modulesLoader.loadModules(currentDir, allButAssetsModulesFinder, finalClient);
                            return FileVisitResult.SKIP_SUBTREE;
                        }
                        else if (isEntityDir(dir, startPath.toAbsolutePath())) {
                            Modules modules = new EntityDefModulesFinder().findModules(dir.toString());
                            DocumentMetadataHandle meta = new DocumentMetadataHandle();
                            meta.getCollections().add("http://marklogic.com/entity-services/models");
                            documentPermissionsParser.parsePermissions(hubConfig.getModulePermissions(), meta.getPermissions());
                            for (Resource r : modules.getAssets()) {
                                if (forceLoad || modulesManager.hasFileBeenModifiedSinceLastLoaded(r.getFile())) {
                                    InputStream inputStream = r.getInputStream();
                                    StringHandle handle = new StringHandle(IOUtils.toString(inputStream));
                                    inputStream.close();
                                    entityDocMgr.write("/entities/" + r.getFilename(), meta, handle);
                                    modulesManager.saveLastLoadedTimestamp(r.getFile(), new Date());
                                }
                            }
                            return FileVisitResult.CONTINUE;
                        }
                        else {
                            return FileVisitResult.CONTINUE;
                        }
                    }

                    @Override
                    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs)
                        throws IOException
                    {
                        if (isFlowPropertiesFile(file) && modulesManager.hasFileBeenModifiedSinceLastLoaded(file.toFile())) {
                            Flow flow = flowManager.getFlowFromProperties(file);
                            StringHandle handle = new StringHandle(flow.serialize());
                            handle.setFormat(Format.XML);
                            documentWriteSet.add(flow.getFlowDbPath(), handle);
                            modulesManager.saveLastLoadedTimestamp(file.toFile(), new Date());
                        }
                        return FileVisitResult.CONTINUE;
                    }
                });

                if (documentWriteSet.size() > 0) {
                    documentManager.write(documentWriteSet);
                }
            }
            threadPoolTaskExecutor.shutdown();
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}

