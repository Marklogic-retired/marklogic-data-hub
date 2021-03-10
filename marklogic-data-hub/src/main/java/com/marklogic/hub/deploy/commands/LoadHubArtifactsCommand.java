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
import com.marklogic.client.document.DocumentWriteOperation;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.impl.DocumentWriteOperationImpl;
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
import java.util.*;

/**
 * Loads hub artifacts (ootb flows and step defs). This will be deployed after triggers
 */
@Component
public class LoadHubArtifactsCommand extends AbstractCommand {

    /**
     * Hub artifacts are deployed after triggers for no particular reason yet other than that user artifacts must be
     * deployed after both triggers (because of entity models) and after hub artifacts.
     */
    public static int SORT_ORDER = SortOrderConstants.DEPLOY_TRIGGERS + 10;

    @Autowired
    private HubConfig hubConfig;

    private DocumentPermissionsParser documentPermissionsParser = new DefaultDocumentPermissionsParser();

    public LoadHubArtifactsCommand() {
        super();
        setExecuteSortOrder(SORT_ORDER);
    }

    /**
     * For use outside of a Spring container.
     *
     * @param hubConfig
     */
    public LoadHubArtifactsCommand(HubConfig hubConfig) {
        this();
        this.hubConfig = hubConfig;
    }

    @Override
    public void execute(CommandContext context) {
        JSONDocumentManager finalDocMgr = hubConfig.newFinalClient().newJSONDocumentManager();
        JSONDocumentManager stagingDocMgr = hubConfig.newStagingClient().newJSONDocumentManager();

        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(getClass().getClassLoader());

        Map<String, DocumentWriteOperation> writeOps = new HashMap<>();

        try {
            for (Resource r : resolver.getResources("classpath*:/hub-internal-artifacts/flows/**/*.flow.json")) {
                File file = new File("hub-internal-artifacts/flows/" + r.getFilename());
                InputStream inputStream = r.getInputStream();
                StringHandle handle = new StringHandle(IOUtils.toString(inputStream));
                inputStream.close();
                DocumentMetadataHandle meta = buildMetadata(hubConfig.getFlowPermissions(), "http://marklogic.com/data-hub/flow");
                String uri = "/flows/" + file.getName();
                writeOps.put(uri, new DocumentWriteOperationImpl(DocumentWriteOperation.OperationType.DOCUMENT_WRITE, uri, meta, handle));
            }

            for (Resource r : resolver.getResources("classpath*:/hub-internal-artifacts/step-definitions/**/*.step.json")) {
                File file = new File("hub-internal-artifacts/step-definitions/" + r.getURL().getPath().substring(r.getURL().getPath().indexOf("hub-internal-artifacts/step-definitions/")));
                InputStream inputStream = r.getInputStream();
                StringHandle handle = new StringHandle(IOUtils.toString(inputStream));
                inputStream.close();
                DocumentMetadataHandle meta = buildMetadata(hubConfig.getStepDefinitionPermissions(), "http://marklogic.com/data-hub/step-definition");
                String uri = "/step-definitions/" + file.getParentFile().getParentFile().getName() + "/" + file.getParentFile().getName() + "/" + file.getName();
                writeOps.put(uri, new DocumentWriteOperationImpl(DocumentWriteOperation.OperationType.DOCUMENT_WRITE, uri, meta, handle));
            }

            // A Map is used to collect the DocumentWriteOperations to ensure if multiple copies of the same artifact
            // are found on the classpath - which seems to happen in some scenarios when running tests - then only
            // one copy is loaded, thus avoiding conflicting update errors.
            DocumentWriteSet stagingWriteSet = stagingDocMgr.newWriteSet();
            DocumentWriteSet finalWriteSet = finalDocMgr.newWriteSet();
            for (String uri : writeOps.keySet()) {
                DocumentWriteOperation op = writeOps.get(uri);
                stagingWriteSet.add(op);
                finalWriteSet.add(op);
            }
            stagingDocMgr.write(stagingWriteSet);
            finalDocMgr.write(finalWriteSet);
        }
        catch (IOException e) {
            throw new RuntimeException("Unable to access hub artifacts: " + e.getMessage(), e);
        }

    }

    /**
     * As of 5.2.0, artifact permissions are separate from module permissions. If artifact permissions
     * are not defined, then it falls back to using default permissions.
     *
     * @param permissions
     * @param collection
     * @return
     */
    protected DocumentMetadataHandle buildMetadata(String permissions, String collection) {
        DocumentMetadataHandle meta = new DocumentMetadataHandle();

        meta.getCollections().add(collection);
        meta.getCollections().add("hub-core-artifact");
        documentPermissionsParser.parsePermissions(permissions, meta.getPermissions());
        return meta;
    }

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }
}
