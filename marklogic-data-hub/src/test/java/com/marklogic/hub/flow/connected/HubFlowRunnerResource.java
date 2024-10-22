package com.marklogic.hub.flow.connected;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.io.marker.AbstractWriteHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.flow.RunFlowResponse;

import java.io.IOException;

public class HubFlowRunnerResource extends ResourceManager {

    public HubFlowRunnerResource(DatabaseClient client) {
        super();
        client.init("hubFlowRunner", this);
    }

    public RunFlowResponse runFlow(Input input) {
        return runFlow(input.getRootNode());
    }

    public RunFlowResponse runFlow(ObjectNode input) {
        return runFlowWithHandle(new JacksonHandle(input));
    }

    public RunFlowResponse runFlowWithXmlInput(String xml) {
        return runFlowWithHandle(new StringHandle(xml).withFormat(Format.XML));
    }

    private RunFlowResponse runFlowWithHandle(AbstractWriteHandle handle) {
        JsonNode json = getServices().post(new RequestParameters(), handle, new JacksonHandle()).get();
        try {
            return new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false).readerFor(RunFlowResponse.class).readValue(json);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static class Input {
        private ArrayNode contentArray;
        private final ObjectNode rootNode;

        public Input(String flowName) {
            ObjectMapper objectMapper = new ObjectMapper();
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

        public ObjectNode getRootNode() {
            return rootNode;
        }

        public Input withJobId(String jobId) {
            rootNode.put("jobId", jobId);
            return this;
        }

        public Input withSteps(String... stepNumbers) {
            ArrayNode array = rootNode.putArray("steps");
            for (String s : stepNumbers) {
                array.add(s);
            }
            return this;
        }
    }
}
