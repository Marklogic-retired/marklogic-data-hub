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
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
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

        if (forceLoad) {
            pmm.deletePropertiesFile();
        }
        return pmm;
    }

    @Override
    public void execute(CommandContext context) {
        DatabaseClient stagingClient = hubConfig.newStagingClient();
        DatabaseClient finalClient = hubConfig.newFinalClient();

        JSONDocumentManager finalDocMgr = finalClient.newJSONDocumentManager();
        JSONDocumentManager stagingDocMgr = stagingClient.newJSONDocumentManager();

        DocumentWriteSet finalStepDocumentWriteSet = finalDocMgr.newWriteSet();
        DocumentWriteSet stagingStepDocumentWriteSet = stagingDocMgr.newWriteSet();
        DocumentWriteSet finalFlowDocumentWriteSet = finalDocMgr.newWriteSet();
        DocumentWriteSet stagingFlowDocumentWriteSet = stagingDocMgr.newWriteSet();


        PropertiesModuleManager propertiesModuleManager = getModulesManager();
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(getClass().getClassLoader());
        Resource[] resources = null;

        try {

            // lets do flows
            resources = resolver.getResources("classpath*:/hub-internal-artifacts/flows/**/*.flow.json");
            for (Resource r : resources) {
                File flowFile = new File("hub-internal-artifacts/flows/" + r.getFilename());
                InputStream inputStream = r.getInputStream();
                StringHandle handle = new StringHandle(IOUtils.toString(inputStream));
                inputStream.close();
                DocumentMetadataHandle meta = buildDocumentMetadata("http://marklogic.com/data-hub/flow");

                if (forceLoad || propertiesModuleManager.hasFileBeenModifiedSinceLastLoaded(flowFile)) {
                    stagingFlowDocumentWriteSet.add("/flows/" + flowFile.getName(), meta, handle);
                    finalFlowDocumentWriteSet.add("/flows/" + flowFile.getName(), meta, handle);
                    propertiesModuleManager.saveLastLoadedTimestamp(flowFile, new Date());
                }
            }


            // lets do step-definitions
            resources = resolver.getResources("classpath*:/hub-internal-artifacts/step-definitions/**/*.step.json");
            for (Resource r : resources) {
                File flowFile = new File("hub-internal-artifacts/step-definitions/" + r.getURL().getPath().substring(r.getURL().getPath().indexOf("hub-internal-artifacts/step-definitions/")));
                InputStream inputStream = r.getInputStream();
                StringHandle handle = new StringHandle(IOUtils.toString(inputStream));
                inputStream.close();
                DocumentMetadataHandle meta = buildDocumentMetadata("http://marklogic.com/data-hub/step-definition");

                if (forceLoad || propertiesModuleManager.hasFileBeenModifiedSinceLastLoaded(flowFile)) {
                    stagingStepDocumentWriteSet.add("/step-definitions/" + flowFile.getParentFile().getParentFile().getName() + "/" + flowFile.getParentFile().getName() + "/" + flowFile.getName(), meta, handle);
                    finalStepDocumentWriteSet.add("/step-definitions/" + flowFile.getParentFile().getParentFile().getName() + "/" + flowFile.getParentFile().getName() + "/" + flowFile.getName(), meta, handle);
                    propertiesModuleManager.saveLastLoadedTimestamp(flowFile, new Date());
                }
            }
        }
        catch (IOException e) {
            e.printStackTrace();
        }

        if (stagingStepDocumentWriteSet.size() > 0) {
            stagingDocMgr.write(stagingStepDocumentWriteSet);
            finalDocMgr.write(stagingStepDocumentWriteSet);
        }
        if (stagingFlowDocumentWriteSet.size() > 0) {
            stagingDocMgr.write(stagingFlowDocumentWriteSet);
            finalDocMgr.write(stagingFlowDocumentWriteSet);
        }

    }

    /**
     * Per DHFPROD-2772, module permissions are being assigned to hub artifacts, which matches what is done for user
     * artifacts. This ensures that in ML 10, each hub artifact has some permissions on it and can thus be accessed by
     * a non-admin user when DHF is installed by a user without any default permissions (e.g. the admin user).
     *
     * @param collections
     * @return
     */
    protected DocumentMetadataHandle buildDocumentMetadata(String... collections) {
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().addAll(collections);
        documentPermissionsParser.parsePermissions(hubConfig.getModulePermissions(), meta.getPermissions());
        return meta;
    }

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }
}
