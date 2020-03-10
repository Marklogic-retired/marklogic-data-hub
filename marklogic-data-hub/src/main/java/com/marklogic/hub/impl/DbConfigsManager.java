package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;

import java.io.IOException;
import java.util.List;

class DbConfigsManager extends ResourceManager {

    private static final String NAME = "mlDbConfigs";

    private RequestParameters params = new RequestParameters();

    public DbConfigsManager(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    public ObjectNode generateIndexes(List<JsonNode> entities) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode node = objectMapper.valueToTree(entities);
            ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, new JacksonHandle(node));
            if (resultItr == null || !resultItr.hasNext()) {
                throw new IOException("Unable to generate database indexes");
            }
            ResourceServices.ServiceResult res = resultItr.next();
            return (ObjectNode) res.getContent(new JacksonHandle()).get();
        } catch (Exception e) {
            // TODO Rethrow this??
            e.printStackTrace();
        }
        return objectMapper.createObjectNode();
    }
}
