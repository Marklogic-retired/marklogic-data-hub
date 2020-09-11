/*
 * Copyright (c) 2020 MarkLogic Corporation
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

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.util.ResourceUtil;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
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
    private File databaseFile;
    private boolean mergeEntityConfigFiles = true;
    private boolean mergeExistingArrayProperties = false;

    /**
     * In order for sorting to work correctly via DeployDatabaseCommandComparator, must call setDatabaseFile so that
     * the parent getPayload method is able to find the correct File to read from.
     * <p>
     * Otherwise, if this class only has a filename, the parent getPayload method will check every ConfigDir to find a
     * match, with the last one winning. In the case of DHF, that means the user config directory. This can be a problem,
     * as a user is not likely to define schema-database/triggers-database in e.g. a staging-database.json file in the
     * user config directory. That will then cause the ordering of database commands to be incorrect, which will
     * likely cause an error when databases are deployed and they don't yet exist.
     *
     * @param hubConfig        a hubConfig object
     * @param databaseFile     database file object
     * @param databaseFilename name of the database file
     */
    public DeployHubDatabaseCommand(HubConfig hubConfig, File databaseFile, String databaseFilename) {
        super(databaseFilename);
        if (databaseFile != null) {
            super.setDatabaseFile(databaseFile);
        }
        this.databaseFile = databaseFile;
        this.hubConfig = hubConfig;
        this.databaseFilename = databaseFilename;
        if (databaseFilename != null) {
            this.setForestFilename(databaseFilename.replace("-database", "-forest"));
        }
    }

    @Override
    public void execute(CommandContext context) {
        if (this.databaseFile != null && logger.isInfoEnabled()) {
            logger.info("Processing file: " + databaseFile);
        }
        super.execute(context);
    }

    @Override
    protected String getPayload(CommandContext context) {
        String payload = super.getPayload(context);
        return payload != null ? preparePayloadBeforeSubmitting(context, payload) : null;
    }

    protected String preparePayloadBeforeSubmitting(CommandContext context, String payload) {
        try {
            ObjectNode payloadNode = (ObjectNode) ObjectMapperFactory.getObjectMapper().readTree(payload);

            // The boolean exists to control whether this is done because when deploying to DHS, the entity-config
            // directory is added to the list of config dirs, and thus this merging is not needed
            if (mergeEntityConfigFiles) {
                payloadNode = mergePayloadWithEntityConfigFileIfItExists(context, payloadNode);
            }

            if (mergeExistingArrayProperties) {
                payloadNode = mergeExistingArrayProperties(context, payloadNode);
            }

            removeSchemaAndTriggersDatabaseSettingsInAProvisionedEnvironment(payloadNode);

            if (payloadNode.has("language") && "zxx".equalsIgnoreCase(payloadNode.get("language").asText())) {
                logger.warn("Removing 'language' property because it has a value of 'zxx'; complete payload: " + payload);
                payloadNode.remove("language");
            }

            return payloadNode.toString();
        } catch (IOException e) {
            throw new DataHubConfigurationException(e);
        }
    }

    private ObjectNode mergeExistingArrayProperties(CommandContext context, ObjectNode propertiesToSave) {
        if (!propertiesToSave.has("database-name")) {
            logger.warn("Database payload unexpectedly does not have 'database-name' property; will not merge existing array properties: " + propertiesToSave);
            return propertiesToSave;
        }
        final String dbName = propertiesToSave.get("database-name").asText();
        try {
            String json = new DatabaseManager(context.getManageClient()).getPropertiesAsJson(dbName);
            ObjectNode existingProperties = (ObjectNode) ObjectMapperFactory.getObjectMapper().readTree(json);
            return ResourceUtil.mergeExistingArrayProperties(propertiesToSave, existingProperties);
        } catch (Exception ex) {
            throw new RuntimeException(
                format("Unexpected error when trying to merge existing array properties for database '%s'; cause: " + ex.getMessage(), dbName), ex
            );
        }
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
    protected ObjectNode mergePayloadWithEntityConfigFileIfItExists(CommandContext context, ObjectNode payloadNode) throws IOException {
        if (hubConfig.getEntityDatabaseDir() != null && this.databaseFilename != null) {
            File entityDatabaseDir = hubConfig.getEntityDatabaseDir().toFile();
            if (entityDatabaseDir != null) {
                File entityDatabaseFile = new File(entityDatabaseDir, this.databaseFilename);
                if (entityDatabaseFile != null && entityDatabaseFile.exists()) {
                    if (logger.isDebugEnabled()) {
                        logger.debug("Merging in file: " + entityDatabaseFile.getAbsolutePath());
                    }
                    // Ensure that tokens are replaced in the entity-config file
                    String entityConfigPayload = readResourceFromFile(context, entityDatabaseFile);
                    ObjectNode entityConfigNode = (ObjectNode) ObjectMapperFactory.getObjectMapper().readTree(entityConfigPayload);
                    return JsonNodeUtil.mergeObjectNodes(payloadNode, entityConfigNode);
                }
            }
        }
        return payloadNode;
    }

    private void removeSchemaAndTriggersDatabaseSettingsInAProvisionedEnvironment(ObjectNode payload) {
        if (hubConfig.getIsProvisionedEnvironment()) {
            payload.remove("schema-database");
            payload.remove("triggers-database");
        }
    }

    public void setMergeEntityConfigFiles(boolean mergeEntityConfigFiles) {
        this.mergeEntityConfigFiles = mergeEntityConfigFiles;
    }

    public void setMergeExistingArrayProperties(boolean mergeExistingArrayProperties) {
        this.mergeExistingArrayProperties = mergeExistingArrayProperties;
    }
}
