/*
 * Copyright 2012-2020 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.oneui.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ForbiddenUserException;
import com.marklogic.client.MarkLogicServerException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.DocumentRecord;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.JobInfo;
import com.marklogic.hub.oneui.exceptions.DataHubException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

public class ModelManager {
    public static final String ENTITY_MODEL_COLLECTION_NAME =
        "http://marklogic.com/entity-services/models";
    private static final Logger logger = LoggerFactory.getLogger(ModelManager.class);

    private DatabaseClient finalDatabaseClient;
    private DatabaseClient finalDataServiceClient;

    public ModelManager(HubConfig hubConfig) {
        this.finalDatabaseClient = hubConfig.newFinalClient(hubConfig.getDbName(DatabaseKind.FINAL));
        this.finalDataServiceClient = hubConfig.newFinalClient();
    }

    /**
     * Get all the entities
     *
     * @return a json node including all the entities
     */
    public JsonNode getModels() {
        QueryManager queryMgr = finalDatabaseClient.newQueryManager();
        queryMgr.setPageLength(Integer.MAX_VALUE);
        StructuredQueryBuilder sb = queryMgr.newStructuredQueryBuilder("");

        ArrayNode jsonRes = JsonNodeFactory.instance.arrayNode();

        GenericDocumentManager docMgr = finalDatabaseClient.newDocumentManager();
        JacksonHandle handle = new JacksonHandle();
        try {
            docMgr
                .search(sb.collection(ENTITY_MODEL_COLLECTION_NAME), 0)
                .forEach(
                    documentRecord -> {
                        documentRecord.getContent(handle);
                        jsonRes.add(handle.get());
                    });
        }
        catch (MarkLogicServerException e) {
            if (e instanceof ResourceNotFoundException || e instanceof ForbiddenUserException) {
                logger.warn(e.getLocalizedMessage());
            }
            else { //FailedRequestException || ResourceNotResendableException || other runtime exceptions
                logger.error(e.getLocalizedMessage());
            }
            throw new DataHubException(e.getServerMessage(), e);
        }
        catch (Exception e) {
            throw new DataHubException(e.getLocalizedMessage(), e);
        }

        return jsonRes;
    }

    /**
     * Get all entity model names
     *
     * @return a list of all entity model names
     */
    public List<String> getModelNames() {
        List<String> modelNamesList = new ArrayList<>();
        ArrayNode arrayNode = (ArrayNode) getModels();
        arrayNode
            .forEach(jsonNode -> Optional.ofNullable(jsonNode)
                .map(node -> node.get("info"))
                .map(node -> node.get("title"))
                .map(JsonNode::textValue)
                .ifPresent(modelNamesList::add));

        return modelNamesList;
    }

    /**
     * Get an entity info by name
     *
     * @param modelName A model name
     * @return Json representation for an entity
     */
    public JsonNode getModel(String modelName) {
        QueryManager queryMgr = finalDatabaseClient.newQueryManager();

        StructuredQueryBuilder sb = queryMgr.newStructuredQueryBuilder("default");
        StructuredQueryDefinition sbd =
            sb.and(
                sb.collection(ENTITY_MODEL_COLLECTION_NAME),
                sb.value(sb.jsonProperty("title"), modelName));

        StringHandle sh = new StringHandle();
        sh.setFormat(Format.JSON);

        GenericDocumentManager docMgr = finalDatabaseClient.newDocumentManager();
        List<DocumentRecord> documentRecords = new ArrayList<>();
        try {
            docMgr.search(sbd, 0, sh).forEach(documentRecords::add);
        }
        catch (MarkLogicServerException e) {
            if (e instanceof ResourceNotFoundException || e instanceof ForbiddenUserException) {
                logger.warn(e.getLocalizedMessage());
            }
            else { //FailedRequestException || ResourceNotResendableException || other runtime exceptions
                logger.error(e.getLocalizedMessage());
            }
            throw new DataHubException(e.getServerMessage(), e);
        }
        catch (Exception e) {
            throw new DataHubException(e.getLocalizedMessage(), e);
        }

        JacksonHandle handle = new JacksonHandle();
        if (!documentRecords.isEmpty()) {
            documentRecords.get(0).getContent(handle);
        }

        return handle.get();
    }

    /**
     * Get latest job info for specified model
     *
     * @param modelName Name of the entity model
     * @return - a JsonNode containing job info
     */
    public JsonNode getLatestJobInfo(String modelName) {
        return getLatestJobData(finalDataServiceClient, modelName);
    }

    /**
     * Get latest job info for all models
     *
     * @return - a list of JsonNode containing job info
     */
    public List<JsonNode> getLatestJobInfoForAllModels() {
        return getModelNames()
            .stream()
            .map(s -> getLatestJobData(finalDataServiceClient, s))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    JsonNode getLatestJobData(DatabaseClient dbClient, String modelName) {
        return JobInfo.on(dbClient).getLatestJobData(modelName);
    }
}
