package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.file.CollectionsDocumentFileProcessor;
import com.marklogic.client.ext.file.JarDocumentFileReader;
import com.marklogic.client.ext.file.PermissionsDocumentFileProcessor;
import com.marklogic.client.ext.file.TokenReplacerDocumentFileProcessor;
import com.marklogic.client.ext.modulesloader.impl.AssetFileLoader;
import com.marklogic.client.ext.modulesloader.impl.DefaultModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.DefaultModulesLoader;
import com.marklogic.client.ext.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.ext.tokenreplacer.DefaultTokenReplacer;
import com.marklogic.client.ext.tokenreplacer.PropertiesSource;
import com.marklogic.client.ext.tokenreplacer.TokenReplacer;
import com.marklogic.com.marklogic.client.ext.file.CacheBusterDocumentFileProcessor;
import com.marklogic.com.marklogic.client.ext.modulesloader.impl.SearchOptionsFinder;
import com.marklogic.hub.HubConfig;

import java.io.File;
import java.util.Map;
import java.util.Properties;

public class LoadHubModulesCommand extends AbstractCommand {
    private HubConfig hubConfig;

    private Throwable caughtException;

    public LoadHubModulesCommand(HubConfig hubConfig) {
        setExecuteSortOrder(SortOrderConstants.LOAD_MODULES);
        this.hubConfig = hubConfig;
    }

    private TokenReplacer buildModuleTokenReplacer(AppConfig appConfig) {
        DefaultTokenReplacer r = new DefaultTokenReplacer();
        final Map<String, String> customTokens = appConfig.getCustomTokens();
        if (customTokens != null && !customTokens.isEmpty()) {
            r.addPropertiesSource(() -> {
                Properties p = new Properties();
                p.putAll(customTokens);
                return p;
            });
        }

        return r;
    }

    @Override
    public void execute(CommandContext context) {
        String timestampFile = hubConfig.getHubModulesDeployTimestampFile();
        PropertiesModuleManager propsManager = new PropertiesModuleManager(timestampFile);
        propsManager.deletePropertiesFile();

        DatabaseClient modulesClient = hubConfig.newModulesDbClient();

        AppConfig appConfig = context.getAppConfig();
        AssetFileLoader assetFileLoader = new AssetFileLoader(modulesClient);
        JarDocumentFileReader jarDocumentFileReader = new JarDocumentFileReader();
        jarDocumentFileReader.addDocumentFileProcessor(new CacheBusterDocumentFileProcessor());
        jarDocumentFileReader.addDocumentFileProcessor(new TokenReplacerDocumentFileProcessor(buildModuleTokenReplacer(appConfig)));
        jarDocumentFileReader.addDocumentFileProcessor(new CollectionsDocumentFileProcessor("hub-core-module"));
        jarDocumentFileReader.addDocumentFileProcessor(new PermissionsDocumentFileProcessor(appConfig.getModulePermissions()));
        assetFileLoader.setDocumentFileReader(jarDocumentFileReader);

        DefaultModulesLoader modulesLoader = new DefaultModulesLoader(assetFileLoader);
        modulesLoader.addFailureListener((throwable, client) -> {
            // ensure we throw the first exception
            if (caughtException == null) {
                caughtException = throwable;
            }
        });
        modulesLoader.setModulesManager(propsManager);
        if (caughtException == null) {
            modulesLoader.loadModules("classpath*:/ml-modules", new DefaultModulesFinder(), modulesClient);
        }
        if (caughtException == null) {
            modulesLoader.loadModules("classpath*:/ml-modules-traces", new SearchOptionsFinder(), hubConfig.newTraceDbClient());
        }
        if (caughtException == null) {
            modulesLoader.loadModules("classpath*:/ml-modules-jobs", new SearchOptionsFinder(), hubConfig.newJobDbClient());
        }
        if (caughtException == null) {
            modulesLoader.loadModules("classpath*:/ml-modules-final", new SearchOptionsFinder(), hubConfig.newFinalClient());
        }

        if (caughtException != null) {
            throw new RuntimeException(caughtException);
        }
    }
}
