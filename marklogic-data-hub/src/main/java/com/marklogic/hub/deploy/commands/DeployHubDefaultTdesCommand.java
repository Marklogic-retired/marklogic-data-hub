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
import com.marklogic.hub.impl.HubConfigImpl;
import org.apache.commons.io.IOUtils;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

public class DeployHubDefaultTdesCommand extends AbstractCommand {

    private HubConfigImpl hubConfig;

    public DeployHubDefaultTdesCommand(HubConfig hubConfig) {
        this.hubConfig = (HubConfigImpl) hubConfig;
        setExecuteSortOrder(SortOrderConstants.DEPLOY_TRIGGERS + 1);
    }

    @Override
    public void execute(CommandContext context) {
        try {
            JSONDocumentManager documentManager = hubConfig.newStagingClient(hubConfig.getStagingSchemasDbName()).newJSONDocumentManager();
            ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(getClass().getClassLoader());
            for (Resource r : resolver.getResources("classpath*:/tdes/**/*.json")) {
                File file = new File("tdes/" + r.getFilename());
                InputStream inputStream = r.getInputStream();
                StringHandle handle = new StringHandle(IOUtils.toString(inputStream));
                inputStream.close();

                String uri = "/tde/" + file.getName();
                DocumentMetadataHandle metadata = buildMetadata();
                DocumentWriteSet stagingSchemasWriteSet = documentManager.newWriteSet();
                stagingSchemasWriteSet.add(new DocumentWriteOperationImpl(DocumentWriteOperation.OperationType.DOCUMENT_WRITE, uri, metadata, handle));
                documentManager.write(stagingSchemasWriteSet);
            }
        } catch (IOException e) {
            throw new RuntimeException("Unable to access TDE's: " + e.getMessage(), e);
        }
    }

    protected DocumentMetadataHandle buildMetadata() {
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        DocumentPermissionsParser documentPermissionsParser = new DefaultDocumentPermissionsParser();
        String tdePermissions = "data-hub-common,read,data-hub-job-monitor,read,data-hub-developer,update";

        metadata.getCollections().add("ml-data-hub-tde");
        metadata.getCollections().add("http://marklogic.com/xdmp/tde");
        documentPermissionsParser.parsePermissions(tdePermissions, metadata.getPermissions());
        return metadata;
    }

}
