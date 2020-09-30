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
package com.marklogic.hub.central.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ForbiddenUserException;
import com.marklogic.client.MarkLogicServerException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.central.exceptions.DataHubException;
import com.marklogic.hub.dataservices.ModelsService;
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

    public ModelManager(HubClient hubClient) {
        this.finalDatabaseClient = hubClient.getFinalClient();
        this.finalDataServiceClient = hubClient.getFinalClient();
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
        } catch (MarkLogicServerException e) {
            if (e instanceof ResourceNotFoundException || e instanceof ForbiddenUserException) {
                logger.warn(e.getLocalizedMessage());
            } else { //FailedRequestException || ResourceNotResendableException || other runtime exceptions
                logger.error(e.getLocalizedMessage());
            }
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(e.getLocalizedMessage(), e);
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
     * Get latest job info for all models
     *
     * @return - a list of JsonNode containing job info
     */
    public List<JsonNode> getLatestJobInfoForAllModels() {
        ModelsService service = ModelsService.on(finalDataServiceClient);
        return getModelNames()
            .stream()
            .map(modelName -> service.getLatestJobData(modelName))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
}
