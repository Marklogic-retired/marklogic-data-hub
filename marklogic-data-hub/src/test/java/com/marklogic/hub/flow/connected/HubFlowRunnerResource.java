package com.marklogic.hub.flow.connected;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.flow.RunFlowResponse;

import java.io.IOException;
import java.util.Map;

public class HubFlowRunnerResource extends ResourceManager {

    protected HubFlowRunnerResource(DatabaseClient client) {
        super();
        client.init("hubFlowRunner", this);
    }

    public RunFlowResponse runFlow(Input input) {
        JsonNode json = getServices().post(new RequestParameters(), new JacksonHandle(input.getRootNode()), new JacksonHandle()).get();
        try {
            return new ObjectMapper().readerFor(RunFlowResponse.class).readValue(json);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static class Input {
        private ArrayNode contentArray;
        private ObjectMapper objectMapper;
        private ObjectNode rootNode;

        public Input(String flowName) {
            objectMapper = new ObjectMapper();
            rootNode = objectMapper.createObjectNode();
            rootNode.put("flowName", flowName);
        }

        /**
         * @param uri
         * @return the "value" object for easy customization
         */
        public ObjectNode addContent(String uri) {
            if (contentArray == null) {
                contentArray = rootNode.putArray("content");
            }
            ObjectNode content = contentArray.addObject();
            content.put("uri", uri);
            return content.putObject("value");
        }

        public ObjectNode getContentObject(int index) {
            return (ObjectNode) contentArray.get(index);
        }

        public ObjectNode getRootNode() {
            return rootNode;
        }
    }
}
