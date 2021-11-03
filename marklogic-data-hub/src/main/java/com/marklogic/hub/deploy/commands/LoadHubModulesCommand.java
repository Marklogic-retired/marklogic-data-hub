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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.file.*;
import com.marklogic.client.ext.modulesloader.ModulesLoader;
import com.marklogic.client.ext.modulesloader.impl.*;
import com.marklogic.client.ext.tokenreplacer.DefaultTokenReplacer;
import com.marklogic.client.ext.tokenreplacer.TokenReplacer;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.SystemService;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Properties;

/**
 * Handles loading modules that are contained within the DHF jar.
 */
@Component
public class LoadHubModulesCommand extends AbstractCommand {

    private final static String CUSTOM_REWRITER_URI = "/data-hub/5/rest-api/staging-rewriter.xml";

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
        ModulesLoader modulesLoader = newModulesLoader(context, modulesClient);

        final boolean switchToDefaultRewriter = needToSwitchToDefaultRewriter();
        if (switchToDefaultRewriter) {
            switchSingleAppserverToDefaultRewriter();
        }

        try {
            if (caughtException == null) {
                logger.info("Loading DHF modules");
                modulesLoader.loadModules("classpath*:/ml-modules", new DefaultModulesFinder(), modulesClient);

                createCustomRewriters();

                logger.info("Loading REST search options for staging server");
                modulesLoader.loadModules("classpath*:/ml-modules-staging", new SearchOptionsFinder(), hubConfig.newStagingClient());
            }
        } finally {
            if (switchToDefaultRewriter) {
                switchSingleAppServerToCustomRewriter();
            }
        }

        if (caughtException == null) {
            loadJobsSearchOptions(modulesLoader);
        }

        if (caughtException != null) {
            throw new RuntimeException(caughtException);
        }
    }

    /**
     * @return true if the staging and final app server are the same, and the custom rewriter doesn't exist. In this
     * scenario, modules can't be loaded via the single app server because its custom rewriter doesn't exist yet. So
     * we need to temporarily switch to the default REST rewriter, load the modules and generate the custom rewriter,
     * and then switch back to the custom rewriter.
     */
    protected boolean needToSwitchToDefaultRewriter() {
        Integer stagingPort = hubConfig.getPort(DatabaseKind.STAGING);
        if (stagingPort != null && stagingPort.equals(hubConfig.getPort(DatabaseKind.FINAL))) {
            logger.info("Staging and final app servers use the same port, so checking to see if custom rewriter exists");
            DatabaseClient client = hubConfig.newAppServicesModulesClient();
            boolean exists = client.newDocumentManager().exists(CUSTOM_REWRITER_URI) != null;
            if (!exists) {
                logger.info("Custom rewriter does not exist, so will switch app server to use the default rewriter so modules can be loaded");
                return true;
            } else {
                logger.info("Custom rewriter exists, so will not switch app server to use the default rewriter");
            }
        }
        return false;
    }

    private void switchSingleAppserverToDefaultRewriter() {
        final String uri = "/MarkLogic/rest-api/rewriter.xml";
        logger.info("Switching single appserver to use default rewriter: " + uri);
        updateStagingRewriter(uri);
    }

    private void switchSingleAppServerToCustomRewriter() {
        logger.info("Switching single appserver to use custom rewriter: " + CUSTOM_REWRITER_URI);
        updateStagingRewriter(CUSTOM_REWRITER_URI);
    }

    private void updateStagingRewriter(String rewriterUrl) {
        try {
            new ServerManager(hubConfig.getManageClient()).save(new ObjectMapper().createObjectNode()
                .put("server-name", hubConfig.getHttpName(DatabaseKind.STAGING))
                .put("url-rewriter", rewriterUrl)
                .toString());
        } catch (Exception ex) {
            throw new RuntimeException("Unable to update url-rewriter property on staging app server; please ensure you " +
                "are using a user with privilege to do this, such as a user with the manage-admin or admin role; error: " + ex.getMessage(), ex);
        }
    }

    private void loadJobsSearchOptions(ModulesLoader modulesLoader) {
        logger.info("Loading REST search options for jobs server");
        DatabaseClient jobsClient = hubConfig.newJobDbClient();
        modulesLoader.loadModules("classpath*:/ml-modules-traces", new SearchOptionsFinder(), jobsClient);
        if (caughtException == null) {
            modulesLoader.loadModules("classpath*:/ml-modules-jobs", new SearchOptionsFinder(), jobsClient);
        }
    }
    
    private ModulesLoader newModulesLoader(CommandContext context, DatabaseClient client) {
        PropertiesModuleManager modulesManager = new PropertiesModuleManager(hubConfig.getAppConfig().getModuleTimestampsPath());
        AssetFileLoader assetFileLoader = new AssetFileLoader(client, modulesManager);
        prepareAssetFileLoader(assetFileLoader, context);

        DefaultModulesLoader modulesLoader = new DefaultModulesLoader(assetFileLoader);
        modulesLoader.setModulesManager(modulesManager);
        modulesLoader.addFailureListener((throwable, dbClient) -> {
            // ensure we throw the first exception
            if (caughtException == null) {
                caughtException = throwable;
            }
        });

        return modulesLoader;
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
