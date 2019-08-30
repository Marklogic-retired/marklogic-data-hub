package com.marklogic.hub.explorer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;
import com.marklogic.hub.util.json.JSONObject;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ModelService {

    @Autowired
    DatabaseClientHolder dbClientHolder;

    public static final String ENTITY_MODEL_COLLECTION_NAME = "http://marklogic.com/entity-services/models";

    /**
     * Get all the models
     * @return
     * @throws IOException
     */
    public JsonNode getModels() throws IOException {
        DatabaseClient dbClient = dbClientHolder.getDatabaseClient();
        QueryManager queryMgr = dbClient.newQueryManager();

        queryMgr.setPageLength(Integer.MAX_VALUE);
        StructuredQueryBuilder sb = queryMgr.newStructuredQueryBuilder("default");

        StringHandle sh = new StringHandle();
        sh.setFormat(Format.JSON);
        String res = queryMgr.search(sb.collection(ENTITY_MODEL_COLLECTION_NAME), sh, 0).get();

        JsonNode jsonRes = JsonNodeFactory.instance.arrayNode();
        if (StringUtils.isEmpty(res)) {
            return jsonRes;
        }

        JSONObject json = new JSONObject(res);
        JsonNode results = json.getNode("results");
        if (results == null) {
            return jsonRes;
        }

        List<String> uris = new ArrayList<>();
        if (results.isArray()) {
            results.forEach(e -> {
                String uri = e.get("uri").asText(null);
                if (StringUtils.isNotEmpty(uri)) {
                    uris.add(uri);
                }
            });
        } else {
            return jsonRes;
        }
        if (uris.isEmpty()) {
            return jsonRes;
        }

        GenericDocumentManager docMgr = dbClient.newDocumentManager();
        for (String uri : uris) {
            String content = docMgr.readAs(uri, String.class);
            ((ArrayNode) jsonRes).add(content);
        }
        return jsonRes;
    }

    /**
     * Get a model info by name
     * @param modelName
     * @return
     * @throws IOException
     */
    public String getModel(String modelName) throws IOException {
        DatabaseClient dbClient = dbClientHolder.getDatabaseClient();
        QueryManager queryMgr = dbClient.newQueryManager();

        StructuredQueryBuilder sb = queryMgr.newStructuredQueryBuilder("default");
        StructuredQueryDefinition sbd = sb.and(sb.collection(ENTITY_MODEL_COLLECTION_NAME),
            sb.value(sb.jsonProperty("title"), modelName));

        StringHandle sh = new StringHandle();
        sh.setFormat(Format.JSON);
        String res = queryMgr.search(sbd, sh, 0).get();
        if (StringUtils.isEmpty(res)) {
            throw new RuntimeException("No entity " + modelName);
        }
        JSONObject json = new JSONObject(res);
        JsonNode results = json.getNode("results");
        if (results == null) {
            throw new RuntimeException("No entity " + modelName);
        }
        final String[] uri = new String[1];
        if (results.isArray()) {
            results.forEach(e -> {
                JSONObject jobJson = new JSONObject(e);
                uri[0] = e.get("uri") != null ? e.get("uri").asText() : null;
                return;
            });
        }
        
        GenericDocumentManager docMgr = dbClient.newDocumentManager();
        return docMgr.readAs(uri[0], String.class);
    }
}

