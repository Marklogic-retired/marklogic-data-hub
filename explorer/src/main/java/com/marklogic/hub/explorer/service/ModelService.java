package com.marklogic.hub.explorer.service;

import java.util.ArrayList;
import java.util.List;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentRecord;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ModelService {

  @Autowired DatabaseClientHolder dbClientHolder;

  public static final String ENTITY_MODEL_COLLECTION_NAME =
      "http://marklogic.com/entity-services/models";

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

    JsonNode jsonRes = JsonNodeFactory.instance.arrayNode();

    GenericDocumentManager docMgr = dbClient.newDocumentManager();
    StringHandle handle = new StringHandle();
    docMgr
        .search(sb.collection(ENTITY_MODEL_COLLECTION_NAME), 0)
        .forEach(
            documentRecord -> {
              documentRecord.getContent(handle);
              ((ArrayNode) jsonRes).add(handle.get());
            });

    return jsonRes;
  }

  /**
   * Get an entity info by name
   *
   * @param modelName
   * @return a string representation for an entity
   */
  public String getModel(String modelName) {
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
    docMgr.search(sbd, 0, sh).forEach(documentRecords::add);

    StringHandle handle = new StringHandle();
    if (!documentRecords.isEmpty()) {
      documentRecords.get(0).getContent(handle);
    }

    return handle.get();
  }
}
