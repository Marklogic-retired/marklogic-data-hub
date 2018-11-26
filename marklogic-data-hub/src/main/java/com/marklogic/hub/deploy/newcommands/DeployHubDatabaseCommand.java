package com.marklogic.hub.deploy.newcommands;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import com.marklogic.rest.util.JsonNodeUtil;

import java.io.File;
import java.io.IOException;

/**
 * Extends ml-app-deployer's standard command for deploying a single database and adds DHF-specific functionality.
 */
public class DeployHubDatabaseCommand extends DeployDatabaseCommand {

    private HubConfig hubConfig;
    private String databaseFilename;

    public DeployHubDatabaseCommand(HubConfig hubConfig, String databaseFilename) {
        super(databaseFilename);
        this.hubConfig = hubConfig;
        this.databaseFilename = databaseFilename;
        setExecuteSortOrder(SortOrderConstants.DEPLOY_OTHER_DATABASES);
        setUndoSortOrder(SortOrderConstants.DELETE_OTHER_DATABASES);
        this.setForestFilename(databaseFilename.replace("-database", "-forest"));
    }

    @Override
    protected String getPayload(CommandContext context) {
        String payload = super.getPayload(context);

        if (payload != null) {
            try {
                ObjectNode payloadNode = (ObjectNode) ObjectMapperFactory.getObjectMapper().readTree(payload);
                payloadNode = mergePayloadWithEntityConfigFileIfItExists(payloadNode);
                removeSchemaAndTriggersDatabaseSettingsInAProvisionedEnvironment(payloadNode);
                return payloadNode.toString();
            } catch (IOException e) {
                throw new DataHubConfigurationException(e);
            }
        }

        return payload;
    }

    private ObjectNode mergePayloadWithEntityConfigFileIfItExists(ObjectNode payloadNode) throws IOException {
        if (hubConfig.getEntityDatabaseDir() != null && this.databaseFilename != null) {
            File entityDatabaseDir = hubConfig.getEntityDatabaseDir().toFile();
            if (entityDatabaseDir != null) {
                File entityDatabaseFile = new File(entityDatabaseDir, this.databaseFilename);
                if (entityDatabaseFile != null && entityDatabaseFile.exists()) {
                    ObjectNode entityConfigNode = (ObjectNode) ObjectMapperFactory.getObjectMapper().readTree(entityDatabaseFile);
                    return JsonNodeUtil.mergeObjectNodes(payloadNode, entityConfigNode);
                }
            }
        }
        return payloadNode;
    }

    private void removeSchemaAndTriggersDatabaseSettingsInAProvisionedEnvironment(ObjectNode payload) {
        if (hubConfig.getIsProvisionedEnvironment()) {
            // for DHS we have to remove some keys
            logger.warn("Deploying indexes only to a provisioned environment");
            payload.remove("schema-database");
            payload.remove("triggers-database");
        }
    }

}
