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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;
import com.marklogic.appdeployer.command.forests.DeployForestsCommand;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.mgmt.PayloadParser;
import com.marklogic.mgmt.SaveReceipt;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.rest.util.JsonNodeUtil;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Can be used for creating any kind of database with any sorts of forests. Specifying a config file for the database or
 * for the forests is optional. In order to create forests with different parameters, use DeployForestsCommand.
 */
public class DeployHubDatabaseCommand extends DeployDatabaseCommand {

    private HubConfig hubConfig;

    private String databaseFilename;

    private boolean createDatabaseWithoutFile = false;

    private String databaseName;

    private String forestFilename;

    private int forestsPerHost = 1;

    private boolean createForestsOnEachHost = true;

    private String forestDelete = "data";

    private int undoSortOrder;

    private ObjectMapper mapper;

    public DeployHubDatabaseCommand(HubConfig config, String databaseFilename) {
        mapper = new ObjectMapper();
        setExecuteSortOrder(SortOrderConstants.DEPLOY_OTHER_DATABASES);
        setUndoSortOrder(SortOrderConstants.DELETE_OTHER_DATABASES);
        this.hubConfig = config;
        this.databaseFilename = databaseFilename;
        this.setForestFilename(databaseFilename.replace("-database", "-forest"));
    }

    @Override
    public String toString() {
        return databaseFilename;
    }

    @Override
    public Integer getUndoSortOrder() {
        return undoSortOrder;
    }

    @Override
    public void execute(CommandContext context) {
        String payload = buildPayload(context);
        if (payload != null) {
            DatabaseManager dbMgr = new DatabaseManager(context.getManageClient());

            if (hubConfig.getIsProvisionedEnvironment()){
                ObjectNode payloadJson;
                try {
                    payloadJson = (ObjectNode) mapper.readTree(payload);
                } catch (IOException e) {
                    throw new DataHubConfigurationException(e);
                }
                // for DHS we have to remove some keys
                logger.warn("Deploying indexes only to a provisioned environment");
                payloadJson.remove("schema-database");
                payloadJson.remove("triggers-database");
                try {
                    SaveReceipt receipt = dbMgr.save(mapper.writeValueAsString(payloadJson));
                } catch (JsonProcessingException e) {
                    throw new DataHubConfigurationException(e);
                }
            }
            else {
                SaveReceipt receipt = dbMgr.save(payload);
                int forestCount = determineForestCountPerHost(payload, context);
                if (forestCount > 0) {
                    buildDeployForestsCommand(payload, receipt, context).execute(context);
                }
            }
        }
    }

    @Override
    public void undo(CommandContext context) {
        String payload = buildPayload(context);
        if (payload != null) {
            DatabaseManager dbMgr = new DatabaseManager(context.getManageClient());
            dbMgr.setForestDelete(forestDelete);
            dbMgr.delete(payload);
        }
    }

    public String buildPayload(CommandContext context) {
        String payload = getPayload(context);
        return payload != null ? payloadTokenReplacer.replaceTokens(payload, context.getAppConfig(), false) : null;
    }

    protected String getPayload(CommandContext context) {
        JsonNode node = mergeDatabaseFiles(context.getAppConfig());
        if (node == null) {
            logger.info("No content database files found, so not processing");
            return null;
        }
        String str = node.toString();
        return str != null ? payloadTokenReplacer.replaceTokens(str, context.getAppConfig(), false) : str;
    }

    protected JsonNode mergeDatabaseFiles(AppConfig appConfig) {
        List<File> files = new ArrayList<>();
        File databaseDir = hubConfig.getHubDatabaseDir().toFile();
        File userDatabaseDir = hubConfig.getUserDatabaseDir().toFile();
        File entityDatabaseDir = hubConfig.getEntityDatabaseDir().toFile();
        files.add(new File(databaseDir, this.databaseFilename));

        File userDatabaseFile = new File(userDatabaseDir, this.databaseFilename);
        if (userDatabaseFile != null && userDatabaseFile.exists()) {
            files.add(userDatabaseFile);
        }

        File entityDatabaseFile = new File(entityDatabaseDir, this.databaseFilename);
        if (entityDatabaseFile != null && entityDatabaseFile.exists()) {
            files.add(entityDatabaseFile);
        }

        if (logger.isInfoEnabled()) {
            logger.info("Merging JSON files at locations: " + files);
        }
        return JsonNodeUtil.mergeJsonFiles(files);
    }

    protected DeployForestsCommand buildDeployForestsCommand(String dbPayload, SaveReceipt receipt,
                                                             CommandContext context) {
        DeployForestsCommand c = new DeployForestsCommand(receipt.getResourceId());
        c.setCreateForestsOnEachHost(createForestsOnEachHost);
        c.setForestsPerHost(determineForestCountPerHost(dbPayload, context));
        c.setForestFilename(forestFilename);
        return c;
    }

    protected int determineForestCountPerHost(String dbPayload, CommandContext context) {
        int forestCount = forestsPerHost;
        if (dbPayload != null) {
            try {
                String dbName = new PayloadParser().getPayloadFieldValue(dbPayload, "database-name");
                Map<String, Integer> forestCounts = context.getAppConfig().getForestCounts();
                if (forestCounts != null && forestCounts.containsKey(dbName)) {
                    Integer i = forestCounts.get(dbName);
                    if (i != null) {
                        forestCount = i;
                    }
                }
            } catch (Exception ex) {
                logger.warn("Unable to determine forest counts, cause: " + ex.getMessage(), ex);
            }
        }
        return forestCount;
    }

    protected String buildDefaultDatabasePayload(CommandContext context) {
        return format("{\"database-name\": \"%s\"}", databaseName);
    }

    public String getForestDelete() {
        return forestDelete;
    }

    public void setForestDelete(String forestDelete) {
        this.forestDelete = forestDelete;
    }

    public int getForestsPerHost() {
        return forestsPerHost;
    }

    public void setForestsPerHost(int forestsPerHost) {
        this.forestsPerHost = forestsPerHost;
    }

    public String getForestFilename() {
        return forestFilename;
    }

    public void setForestFilename(String forestFilename) {
        this.forestFilename = forestFilename;
    }

    public void setUndoSortOrder(int undoSortOrder) {
        this.undoSortOrder = undoSortOrder;
    }

    public String getDatabaseFilename() {
        return databaseFilename;
    }

    public void setDatabaseFilename(String databaseFilename) {
        this.databaseFilename = databaseFilename;
    }

    public boolean isCreateDatabaseWithoutFile() {
        return createDatabaseWithoutFile;
    }

    public void setCreateDatabaseWithoutFile(boolean createDatabaseWithoutFile) {
        this.createDatabaseWithoutFile = createDatabaseWithoutFile;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(String databaseName) {
        this.databaseName = databaseName;
    }

    public boolean isCreateForestsOnEachHost() {
        return createForestsOnEachHost;
    }

    public void setCreateForestsOnEachHost(boolean createForestsOnEachHost) {
        this.createForestsOnEachHost = createForestsOnEachHost;
    }
}
