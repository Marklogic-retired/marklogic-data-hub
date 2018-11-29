package com.marklogic.hub.deploy.commands;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
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

    /**
     * When either staging-database.json or final-database.json is processed (and in the case of staging-database.json,
     * it could be under the hub config or user config directory), need to check to see if a same-named file is in the
     * entity config directory, where entity-specific database configuration is written. If so, it needs to be merged in
     * with the file being processed so that none of the entity configuration is lost.
     *
     * @param payloadNode
     * @return
     * @throws IOException
     */
    private ObjectNode mergePayloadWithEntityConfigFileIfItExists(ObjectNode payloadNode) throws IOException {
        if (hubConfig.getEntityDatabaseDir() != null && this.databaseFilename != null) {
            File entityDatabaseDir = hubConfig.getEntityDatabaseDir().toFile();
            if (entityDatabaseDir != null) {
                File entityDatabaseFile = new File(entityDatabaseDir, this.databaseFilename);
                if (entityDatabaseFile != null && entityDatabaseFile.exists()) {
                    if (logger.isInfoEnabled()) {
                        logger.info("Merging in file: " + entityDatabaseFile.getAbsolutePath());
                    }
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
