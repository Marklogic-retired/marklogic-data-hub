/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
import com.marklogic.hub.explorer.exception.ExplorerException;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ModelService {

  @Autowired
  DatabaseClientHolder dbClientHolder;

  public static final String ENTITY_MODEL_COLLECTION_NAME =
      "http://marklogic.com/entity-services/models";

  private static final Logger logger = LoggerFactory.getLogger("ModelService");

  /**
   * Get all the entities
   *
   * @return a json node including all the entities
   */
  public JsonNode getModels() {
    DatabaseClient dbClient = dbClientHolder.getDatabaseClient();
    QueryManager queryMgr = dbClient.newQueryManager();
    queryMgr.setPageLength(Integer.MAX_VALUE);
    StructuredQueryBuilder sb = queryMgr.newStructuredQueryBuilder("default");

    ArrayNode jsonRes = JsonNodeFactory.instance.arrayNode();

    GenericDocumentManager docMgr = dbClient.newDocumentManager();
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
      throw new ExplorerException(e.getServerStatusCode(), e.getServerMessageCode(), e.getServerMessage(), e);
    } catch (Exception e) {
      throw new ExplorerException(e.getLocalizedMessage(), e);
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
   * @param modelName A model name
   * @return Json representation for an entity
   */
  public JsonNode getModel(String modelName) {
    DatabaseClient dbClient = dbClientHolder.getDatabaseClient();
    QueryManager queryMgr = dbClient.newQueryManager();

    StructuredQueryBuilder sb = queryMgr.newStructuredQueryBuilder("default");
    StructuredQueryDefinition sbd =
        sb.and(
            sb.collection(ENTITY_MODEL_COLLECTION_NAME),
            sb.value(sb.jsonProperty("title"), modelName));

    StringHandle sh = new StringHandle();
    sh.setFormat(Format.JSON);

    GenericDocumentManager docMgr = dbClient.newDocumentManager();
    List<DocumentRecord> documentRecords = new ArrayList<>();
    try {
      docMgr.search(sbd, 0, sh).forEach(documentRecords::add);
    } catch (MarkLogicServerException e) {
      if (e instanceof ResourceNotFoundException || e instanceof ForbiddenUserException) {
        logger.warn(e.getLocalizedMessage());
      } else { //FailedRequestException || ResourceNotResendableException || other runtime exceptions
        logger.error(e.getLocalizedMessage());
      }
      throw new ExplorerException(e.getServerStatusCode(), e.getServerMessageCode(), e.getServerMessage(), e);
    } catch (Exception e) {
      throw new ExplorerException(e.getLocalizedMessage(), e);
    }

    JacksonHandle handle = new JacksonHandle();
    if (!documentRecords.isEmpty()) {
      documentRecords.get(0).getContent(handle);
    }

    return handle.get();
  }
}
