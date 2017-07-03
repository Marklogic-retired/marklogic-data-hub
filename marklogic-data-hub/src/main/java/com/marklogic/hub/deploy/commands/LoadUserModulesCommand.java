package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.modules.AllButAssetsModulesFinder;
import com.marklogic.appdeployer.command.modules.AssetModulesFinder;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.modulesloader.Modules;
import com.marklogic.client.modulesloader.impl.DefaultModulesLoader;
import com.marklogic.client.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.modulesloader.impl.XccAssetLoader;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.util.EntityDefModulesFinder;
import com.marklogic.hub.deploy.util.HubFileFilter;
import com.marklogic.hub.flow.FlowCacheInvalidator;
import org.apache.commons.io.IOUtils;
import org.springframework.core.io.Resource;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.regex.Pattern;

public class LoadUserModulesCommand extends AbstractCommand {

    private HubConfig hubConfig;

    public void setForceLoad(boolean forceLoad) {
        this.forceLoad = forceLoad;
    }

    private boolean forceLoad = false;

    public LoadUserModulesCommand(HubConfig hubConfig) {
        setExecuteSortOrder(SortOrderConstants.LOAD_MODULES + 1);
        this.hubConfig = hubConfig;
    }

    private PropertiesModuleManager getModulesManager() {
        File timestampFile = hubConfig.getModulesDeployTimestampFile();
        PropertiesModuleManager pmm = new PropertiesModuleManager(timestampFile);
        if (forceLoad) {
            pmm.deletePropertiesFile();
        }
        return pmm;
    }

    private DefaultModulesLoader getStagingModulesLoader(AppConfig config) {
        XccAssetLoader assetLoader = config.newXccAssetLoader();
        assetLoader.setFileFilter(new HubFileFilter());
        assetLoader.setPermissions(config.getModulePermissions());
        DefaultModulesLoader modulesLoader = new DefaultModulesLoader(assetLoader);
        modulesLoader.setModulesManager(getModulesManager());
        return modulesLoader;
    }

    @Override
    public void execute(CommandContext context) {
        AppConfig config = context.getAppConfig();

        DatabaseClient stagingClient = hubConfig.newStagingClient();
        DatabaseClient finalClient = hubConfig.newFinalClient();

        Path userModulesPath = Paths.get(hubConfig.projectDir, "plugins");
        File baseDir = userModulesPath.normalize().toAbsolutePath().toFile();
        Path startPath = userModulesPath.resolve("entities");

        // load any user files under plugins/* int the modules database.
        // this will ignore REST folders under entities
        DefaultModulesLoader modulesLoader = getStagingModulesLoader(config);
        modulesLoader.setShutdownTaskExecutorAfterLoadingModules(false);
        modulesLoader.loadModules(baseDir, new AssetModulesFinder(), stagingClient);

        JSONDocumentManager entityDocMgr = finalClient.newJSONDocumentManager();

        AllButAssetsModulesFinder allButAssetsModulesFinder = new AllButAssetsModulesFinder();

        try {
            if (startPath.toFile().exists()) {
                Files.walkFileTree(startPath, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
                        throws IOException {
                        File currentDir = dir.normalize().toAbsolutePath().toFile();
                        String dirStr = dir.toString();

                        // for REST dirs we need to deploy all the REST stuff (transforms, options, services, etc)
                        if (dir.endsWith("REST")) {
                            // for input dir we put stuff in staging
                            if (dirStr.matches(".*[/\\\\]input[/\\\\].*")) {
                                modulesLoader.loadModules(currentDir, allButAssetsModulesFinder, stagingClient);
                            }
                            // for harmonize dir we put stuff in final
                            else if (dirStr.matches(".*[/\\\\]harmonize[/\\\\].*")) {
                                modulesLoader.loadModules(currentDir, allButAssetsModulesFinder, finalClient);
                            }
                            return FileVisitResult.SKIP_SUBTREE;
                        }
                        else if (dirStr.matches(startPath.toAbsolutePath().toString().replace("\\", "\\\\") + "[/\\\\][^/\\\\]+$")) {
                            EntityDefModulesFinder entityDefModulesFinder = new EntityDefModulesFinder();
                            Modules modules = entityDefModulesFinder.findModules(dir.toFile());
                            DocumentMetadataHandle meta = new DocumentMetadataHandle();
                            meta.getCollections().add("http://marklogic.com/entity-services/models");
                            for (Resource r : modules.getAssets()) {
                                StringHandle handle = new StringHandle(IOUtils.toString(r.getInputStream()));
                                entityDocMgr.write("/entities/" + r.getFilename(), meta, handle);
                            }
                            return FileVisitResult.CONTINUE;
                        }
                        else {
                            return FileVisitResult.CONTINUE;
                        }
                    }
                });

                // invalidate the server's flow cache
                FlowCacheInvalidator invalidator = new FlowCacheInvalidator(stagingClient);
                invalidator.invalidateCache();
            }
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}

