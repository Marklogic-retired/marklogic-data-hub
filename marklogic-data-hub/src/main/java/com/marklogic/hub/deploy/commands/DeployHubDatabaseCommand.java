/*
 * Copyright 2012-2019 MarkLogic Corporation
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
    private File databaseFile;

    /**
     * In order for sorting to work correctly via DeployDatabaseCommandComparator, must call setDatabaseFile so that
     * the parent getPayload method is able to find the correct File to read from.
     *
     * Otherwise, if this class only has a filename, the parent getPayload method will check every ConfigDir to find a
     * match, with the last one winning. In the case of DHF, that means the user config directory. This can be a problem,
     * as a user is not likely to define schema-database/triggers-database in e.g. a staging-database.json file in the
     * user config directory. That will then cause the ordering of database commands to be incorrect, which will
     * likely cause an error when databases are deployed and they don't yet exist.
     *
     * @param hubConfig
     * @param databaseFile
     * @param databaseFilename
     */
    public DeployHubDatabaseCommand(HubConfig hubConfig, File databaseFile, String databaseFilename) {
        super(databaseFilename);
        if (databaseFile != null) {
            super.setDatabaseFile(databaseFile);
        }
        this.databaseFile = databaseFile;
        this.hubConfig = hubConfig;
        this.databaseFilename = databaseFilename;
        this.setForestFilename(databaseFilename.replace("-database", "-forest"));
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
                    if (logger.isDebugEnabled()) {
                        logger.debug("Merging in file: " + entityDatabaseFile.getAbsolutePath());
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
