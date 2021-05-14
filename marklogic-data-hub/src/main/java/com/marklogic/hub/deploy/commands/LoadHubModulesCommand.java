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
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.file.*;
import com.marklogic.client.ext.modulesloader.impl.*;
import com.marklogic.client.ext.tokenreplacer.DefaultTokenReplacer;
import com.marklogic.client.ext.tokenreplacer.TokenReplacer;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.SystemService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Properties;

/**
 * Handles loading modules that are contained within the DHF jar.
 */
@Component
public class LoadHubModulesCommand extends AbstractCommand {


    @Autowired
    private HubConfig hubConfig;

    private Throwable caughtException;

    public LoadHubModulesCommand() {
        /**
         * Hub modules should be loaded before any other modules - including those depended on via
         * ml-gradle's mlBundle dependency - to ensure that the DHF REST rewriter is available before any REST
         * extensions are loaded via a /v1/config/* endpoint.
         */
        setExecuteSortOrder(SortOrderConstants.LOAD_MODULES - 1);
    }

    /**
     * For use outside of a Spring container.
     *
     * @param hubConfig
     */
    public LoadHubModulesCommand(HubConfig hubConfig) {
        this();
        this.hubConfig = hubConfig;
    }

    @Override
    public void execute(CommandContext context) {
        DatabaseClient modulesClient = hubConfig.newModulesDbClient();

        AssetFileLoader assetFileLoader = new AssetFileLoader(modulesClient);
        prepareAssetFileLoader(assetFileLoader, context);

        DefaultModulesLoader modulesLoader = new DefaultModulesLoader(assetFileLoader);
        modulesLoader.addFailureListener((throwable, client) -> {
            // ensure we throw the first exception
            if (caughtException == null) {
                caughtException = throwable;
            }
        });

        // When this command is run, should always load all modules
        modulesLoader.setModulesManager(null);

        if (caughtException == null) {
            logger.info("Loading non-REST modules");
            modulesLoader.loadModules("classpath*:/ml-modules", new DefaultModulesFinder(), modulesClient);

            createCustomRewriters();

            logger.info("Loading REST options for staging server");
            modulesLoader.loadModules("classpath*:/ml-modules-staging", new SearchOptionsFinder(), hubConfig.newStagingClient());
        }

        if (caughtException == null) {
            logger.info("Loading REST options for jobs server");
            DatabaseClient jobsClient = hubConfig.newJobDbClient();
            modulesLoader.loadModules("classpath*:/ml-modules-traces", new SearchOptionsFinder(), jobsClient);
            if (caughtException == null) {
                modulesLoader.loadModules("classpath*:/ml-modules-jobs", new SearchOptionsFinder(), jobsClient);
            }
        }

        if (caughtException != null) {
            throw new RuntimeException(caughtException);
        }
    }

    protected void createCustomRewriters() {
        logger.info("Creating custom rewriters for staging and job app servers");
        SystemService.on(hubConfig.newFinalClient(null)).createCustomRewriters();
    }

    protected void prepareAssetFileLoader(AssetFileLoader loader, CommandContext context) {
        AppConfig appConfig = context.getAppConfig();

        Integer batchSize = appConfig.getModulesLoaderBatchSize();
        if (batchSize != null) {
            loader.setBatchSize(batchSize);
        } else {
            // When running tests, the config.sjs/config.xqy modules are somehow being loaded twice - they're logged at
            // the beginning and at the end of the modules being loaded. Without a batch size set, they're loaded in one
            // transaction, causing a conflicting updates error.
            loader.setBatchSize(1);
        }

        JarDocumentFileReader jarDocumentFileReader = new JarDocumentFileReader();
        jarDocumentFileReader.addDocumentFileProcessor(new CacheBusterDocumentFileProcessor());
        jarDocumentFileReader.addDocumentFileProcessor(new TokenReplacerDocumentFileProcessor(buildModuleTokenReplacer(appConfig)));
        jarDocumentFileReader.addDocumentFileProcessor(new CollectionsDocumentFileProcessor("hub-core-module"));
        jarDocumentFileReader.addDocumentFileProcessor(new PermissionsDocumentFileProcessor(appConfig.getModulePermissions()));
        loader.setDocumentFileReader(jarDocumentFileReader);
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

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }
}
