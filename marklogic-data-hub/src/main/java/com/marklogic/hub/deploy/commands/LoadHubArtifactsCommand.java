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
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.ext.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.HubConfig;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;

/**
 * Loads user artifacts like mappings and entities. This will be deployed after triggers
 */
@Component
public class LoadHubArtifactsCommand extends AbstractCommand {

    @Autowired
    private HubConfig hubConfig;

    private DocumentPermissionsParser documentPermissionsParser = new DefaultDocumentPermissionsParser();

    public void setForceLoad(boolean forceLoad) {
        this.forceLoad = forceLoad;
    }

    private boolean forceLoad = false;

    public LoadHubArtifactsCommand() {
        super();

        // Sort order for this command must be more than LoadUserArtifactsCommand
        setExecuteSortOrder(SortOrderConstants.DEPLOY_TRIGGERS + 10);
    }

    private PropertiesModuleManager getModulesManager() {
        String timestampFile = hubConfig.getHubProject().getHubModulesDeployTimestampFile();
        PropertiesModuleManager pmm = new PropertiesModuleManager(timestampFile);

        // Need to delete ml-javaclient-utils timestamp file as well as modules present in the standard gradle locations are now
        // loaded by the modules loader in the parent class which adds these entries to the ml-javaclient-utils timestamp file
        String filePath = hubConfig.getAppConfig().getModuleTimestampsPath();
        File defaultTimestampFile = new File(filePath);

        if (forceLoad) {
            pmm.deletePropertiesFile();
            if (defaultTimestampFile.exists()) {
                defaultTimestampFile.delete();
            }
        }
        return pmm;
    }

    @Override
    public void execute(CommandContext context) {
        AppConfig config = context.getAppConfig();

        DatabaseClient stagingClient = hubConfig.newStagingClient();
        DatabaseClient finalClient = hubConfig.newFinalClient();

        JSONDocumentManager finalDocMgr = finalClient.newJSONDocumentManager();
        JSONDocumentManager stagingDocMgr = stagingClient.newJSONDocumentManager();

        DocumentWriteSet finalStepDocumentWriteSet = finalDocMgr.newWriteSet();
        DocumentWriteSet stagingStepDocumentWriteSet = stagingDocMgr.newWriteSet();
        DocumentWriteSet finalFlowDocumentWriteSet = finalDocMgr.newWriteSet();
        DocumentWriteSet stagingFlowDocumentWriteSet = stagingDocMgr.newWriteSet();


        PropertiesModuleManager propertiesModuleManager = getModulesManager();

        File defaultFlowFile = new File("/flows/default-flow.flow.json");
        File defaultStepIngestFile = new File("/steps/ingest/marklogic/default-ingest.step.json");
        File defaultStepMappingFile = new File("/steps/mapping/marklogic/default-mapping.step.json");

        // let's do flows
        InputStream inputStream = getClass().getResourceAsStream("/hub-internal-artifacts/flows/default-flow.flow.json");
        addToWriteSet(inputStream, "http://marklogic.com/data-hub/flow", defaultFlowFile, stagingFlowDocumentWriteSet, finalFlowDocumentWriteSet, propertiesModuleManager);

        // let's do steps
        inputStream = getClass().getResourceAsStream("/hub-internal-artifacts/steps/ingest/marklogic/default-ingest.step.json");
        addToWriteSet(inputStream, "http://marklogic.com/data-hub/step", defaultStepIngestFile, stagingStepDocumentWriteSet, finalStepDocumentWriteSet, propertiesModuleManager);

        inputStream = getClass().getResourceAsStream("/hub-internal-artifacts/steps/mapping/marklogic/default-mapping.step.json");
        addToWriteSet(inputStream, "http://marklogic.com/data-hub/step", defaultStepMappingFile, stagingStepDocumentWriteSet, finalStepDocumentWriteSet, propertiesModuleManager);

        if (stagingStepDocumentWriteSet.size() > 0) {
            stagingDocMgr.write(stagingStepDocumentWriteSet);
            finalDocMgr.write(stagingStepDocumentWriteSet);
        }
        if (stagingFlowDocumentWriteSet.size() > 0) {
            stagingDocMgr.write(stagingFlowDocumentWriteSet);
            finalDocMgr.write(stagingFlowDocumentWriteSet);
        }

    }

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }


    private void addToWriteSet(InputStream inputStream, String docCollection, File file, DocumentWriteSet stagingDocumentWriteSet, DocumentWriteSet finalDocumentWriteSet, PropertiesModuleManager propertiesModuleManager) {
        try {
            StringHandle handle = new StringHandle(IOUtils.toString(inputStream));
            inputStream.close();

            DocumentMetadataHandle meta = new DocumentMetadataHandle();
            meta.getCollections().add(docCollection);

            if (forceLoad || propertiesModuleManager.hasFileBeenModifiedSinceLastLoaded(file)) {
                stagingDocumentWriteSet.add(file.getPath(), meta, handle);
                finalDocumentWriteSet.add(file.getPath(), meta, handle);
                propertiesModuleManager.saveLastLoadedTimestamp(file, new Date());
            }
        }
        catch (IOException e) {
            e.printStackTrace();
        }
    }
}
