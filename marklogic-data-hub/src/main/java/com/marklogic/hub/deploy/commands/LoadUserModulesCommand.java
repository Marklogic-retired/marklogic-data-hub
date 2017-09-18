package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.modules.AllButAssetsModulesFinder;
import com.marklogic.appdeployer.command.modules.AssetModulesFinder;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.modulesloader.Modules;
import com.marklogic.client.modulesloader.impl.*;
import com.marklogic.client.modulesloader.xcc.DefaultDocumentFormatGetter;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.util.CacheBustingXccAssetLoader;
import com.marklogic.hub.deploy.util.EntityDefModulesFinder;
import com.marklogic.hub.deploy.util.HubFileFilter;
import com.marklogic.hub.error.LegacyFlowsException;
import com.marklogic.hub.flow.Flow;
import org.apache.commons.io.IOUtils;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
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
        File timestampFile = hubConfig.getUserModulesDeployTimestampFile();
        PropertiesModuleManager pmm = new PropertiesModuleManager(timestampFile);
        if (forceLoad) {
            pmm.deletePropertiesFile();
        }
        return pmm;
    }

    private CacheBustingXccAssetLoader getAssetLoader(AppConfig config) {
        CacheBustingXccAssetLoader l = new CacheBustingXccAssetLoader();
        l.setHost(config.getHost());
        l.setUsername(config.getRestAdminUsername());
        l.setPassword(config.getRestAdminPassword());
        l.setDatabaseName(config.getModulesDatabaseName());
        if (config.getAppServicesPort() != null) {
            l.setPort(config.getAppServicesPort());
        }

        String permissions = config.getModulePermissions();
        if (permissions != null) {
            l.setPermissions(permissions);
        }

        String[] extensions = config.getAdditionalBinaryExtensions();
        if (extensions != null) {
            DefaultDocumentFormatGetter getter = new DefaultDocumentFormatGetter();
            for (String ext : extensions) {
                getter.getBinaryExtensions().add(ext);
            }
            l.setDocumentFormatGetter(getter);
        }

        FileFilter assetFileFilter = config.getAssetFileFilter();
        if (assetFileFilter != null) {
            l.setFileFilter(assetFileFilter);
        }

        l.setBulkLoad(config.isBulkLoadAssets());
        return l;
    }

    private DefaultModulesLoader getStagingModulesLoader(AppConfig config) {
        XccAssetLoader assetLoader = getAssetLoader(config);
        assetLoader.setFileFilter(new HubFileFilter());
        assetLoader.setPermissions(config.getModulePermissions());

        this.threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
        this.threadPoolTaskExecutor.setCorePoolSize(16);

        // 10 minutes should be plenty of time to wait for REST API modules to be loaded
        this.threadPoolTaskExecutor.setAwaitTerminationSeconds(60 * 10);
        this.threadPoolTaskExecutor.setWaitForTasksToCompleteOnShutdown(true);

        this.threadPoolTaskExecutor.afterPropertiesSet();

        DefaultModulesLoader modulesLoader = new DefaultModulesLoader(assetLoader);
        modulesLoader.setModulesManager(getModulesManager());
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

    @Override
    public void execute(CommandContext context) {
        FlowManager flowManager = new FlowManager(hubConfig);
        List<String> legacyFlows = flowManager.getLegacyFlows();
        if (legacyFlows.size() > 0) {
            throw new LegacyFlowsException(legacyFlows);
        }

        AppConfig config = context.getAppConfig();

        DatabaseClient stagingClient = hubConfig.newStagingClient();
        DatabaseClient finalClient = hubConfig.newFinalClient();

        Path userModulesPath = hubConfig.getHubPluginsDir();
        File baseDir = userModulesPath.normalize().toAbsolutePath().toFile();
        Path startPath = userModulesPath.resolve("entities");

        // load any user files under plugins/* int the modules database.
        // this will ignore REST folders under entities
        DefaultModulesLoader modulesLoader = getStagingModulesLoader(config);
        modulesLoader.loadModules(baseDir, new AssetModulesFinder(), stagingClient);

        JSONDocumentManager entityDocMgr = finalClient.newJSONDocumentManager();

        AllButAssetsModulesFinder allButAssetsModulesFinder = new AllButAssetsModulesFinder();

        try {
            if (startPath.toFile().exists()) {

                // load Flow Definitions
                List<Flow> flows = flowManager.getLocalFlows();
                XMLDocumentManager documentManager = hubConfig.newModulesDbClient().newXMLDocumentManager();
                DocumentWriteSet documentWriteSet = documentManager.newWriteSet();

                for (Flow flow : flows) {
                    StringHandle handle = new StringHandle(flow.serialize());
                    handle.setFormat(Format.XML);
                    documentWriteSet.add(flow.getFlowDbPath(), handle);
                }
                if (documentWriteSet.size() > 0) {
                    documentManager.write(documentWriteSet);
                }

                Files.walkFileTree(startPath, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                        File currentDir = dir.normalize().toAbsolutePath().toFile();

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
                            Modules modules = new EntityDefModulesFinder().findModules(dir.toFile());
                            DocumentMetadataHandle meta = new DocumentMetadataHandle();
                            meta.getCollections().add("http://marklogic.com/entity-services/models");
                            documentPermissionsParser.parsePermissions(hubConfig.modulePermissions, meta.getPermissions());
                            for (Resource r : modules.getAssets()) {
                                InputStream inputStream = r.getInputStream();
                                StringHandle handle = new StringHandle(IOUtils.toString(inputStream));
                                inputStream.close();
                                entityDocMgr.write("/entities/" + r.getFilename(), meta, handle);
                            }
                            return FileVisitResult.CONTINUE;
                        }
                        else {
                            return FileVisitResult.CONTINUE;
                        }
                    }
                });
            }
            threadPoolTaskExecutor.shutdown();
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}

