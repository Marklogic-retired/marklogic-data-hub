package com.marklogic.hub.commands;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.HashSet;
import java.util.Set;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.modules.AllButAssetsModulesFinder;
import com.marklogic.appdeployer.command.modules.AssetModulesFinder;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.modulesloader.impl.DefaultModulesLoader;
import com.marklogic.client.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.modulesloader.impl.XccAssetLoader;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.util.HubFileFilter;

public class LoadUserModulesCommand extends AbstractCommand {

    private HubConfig hubConfig;

    public void setForceLoad(boolean forceLoad) {
        this.forceLoad = forceLoad;
    }

    private boolean forceLoad = false;

    public LoadUserModulesCommand(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    private DatabaseClient getDatabaseClient(AppConfig config, int port) {

        DatabaseClient client = DatabaseClientFactory.newClient(hubConfig.host, port, hubConfig.username, hubConfig.password,
                config.getRestAuthentication(), config.getRestSslContext(), config.getRestSslHostnameVerifier());
        return client;
    }

    @Override
    public void execute(CommandContext context) {
        AppConfig config = context.getAppConfig();

        DatabaseClient stagingClient = getDatabaseClient(config, hubConfig.stagingPort);
        DatabaseClient finalClient = getDatabaseClient(config, hubConfig.finalPort);

        Set<File> loadedFiles = new HashSet<File>();

        XccAssetLoader assetLoader = config.newXccAssetLoader();
        assetLoader.setFileFilter(new HubFileFilter());

        Path userModulesPath = Paths.get(hubConfig.projectDir, "plugins");
        DefaultModulesLoader modulesLoader = new DefaultModulesLoader(assetLoader);
        File timestampFile = Paths.get(hubConfig.projectDir, ".tmp", "user-modules-deploy-timestamps.properties").toFile();
        PropertiesModuleManager pmm = new PropertiesModuleManager(timestampFile);
        if (forceLoad) {
            pmm.deletePropertiesFile();
        }
        modulesLoader.setModulesManager(pmm);
        File baseDir = userModulesPath.normalize().toAbsolutePath().toFile();
        loadedFiles.addAll(modulesLoader.loadModules(baseDir, new AssetModulesFinder(), stagingClient));
        Path startPath = userModulesPath.resolve("entities");

        try {
            if (startPath.toFile().exists()) {
                Files.walkFileTree(startPath, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
                        throws IOException
                    {
                        boolean isRest = dir.endsWith("REST");

                        String dirStr = dir.toString();
                        boolean isInputDir = dirStr.matches(".*[/\\\\]input[/\\\\].*");
                        boolean isHarmonizeDir = dirStr.matches(".*[/\\\\]harmonize[/\\\\].*");
                        if (isRest) {
                            if (isInputDir) {
                                loadedFiles.addAll(modulesLoader.loadModules(dir.normalize().toAbsolutePath().toFile(), new AllButAssetsModulesFinder(), stagingClient));
                            }
                            else if (isHarmonizeDir) {
                                loadedFiles.addAll(modulesLoader.loadModules(dir.normalize().toAbsolutePath().toFile(), new AllButAssetsModulesFinder(), finalClient));
                            }
                            return FileVisitResult.SKIP_SUBTREE;
                        }
                        else {
                            return FileVisitResult.CONTINUE;
                        }
                    }
                });
            }
        }
        catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }

    }

}
