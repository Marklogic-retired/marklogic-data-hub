package com.marklogic.hub.dataservices;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.ForestConfiguration;
import com.marklogic.client.datamovement.impl.DataMovementManagerImpl;
import com.marklogic.client.dataservices.InputOutputCaller;
import com.marklogic.client.dataservices.OutputCaller;

import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Consumer;

public class DataServiceOrchestrator {
    private final static ObjectMapper objectMapper = new ObjectMapper();
    private DatabaseClient client;
    private final Map<String, DatabaseClient> clients;
    private final ForestConfiguration forestConfiguration;
    private final String defaultHost;
    private final String feedAPI;
    private OutputCaller.BulkOutputCaller<JsonNode> feedCaller;
    private final String processAPI;
    private final ConcurrentMap<String, InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode>> processCallers = new ConcurrentHashMap<>();

    private ObjectNode endpointConstants = objectMapper.createObjectNode();
    private final ObjectNode endpointState = objectMapper.createObjectNode();

    private Consumer<JsonNode> outputListener = null;
    private OutputCaller.BulkOutputCaller.ErrorListener feedErrorListener = null;
    private InputOutputCaller.BulkInputOutputCaller.ErrorListener processErrorListener = null;

    private int threadCount = 4;
    private int averageThreadsPerHost = 4;

    public DataServiceOrchestrator(DatabaseClient client, String feedAPI, String processAPI) {
        this.feedAPI = feedAPI;
        this.processAPI = processAPI;
        defaultHost = client.getHost();
        DataMovementManagerImpl movementManager = (DataMovementManagerImpl) client.newDataMovementManager();
        forestConfiguration = movementManager.readForestConfig();
        clients = BulkUtil.preferredClients(forestConfiguration, client, movementManager);
    }

    public DataServiceOrchestrator withThreadCount(int threadCount) {
        this.threadCount = threadCount;
        return this;
    }

    public DataServiceOrchestrator withEndpointConstants(ObjectNode endpointConstants) {
        this.endpointConstants = endpointConstants;
        return this;
    }

    public DataServiceOrchestrator withOutputListener(Consumer<JsonNode> outputListener) {
        this.outputListener = outputListener;
        return this;
    }

    public DataServiceOrchestrator withFeedErrorListener(OutputCaller.BulkOutputCaller.ErrorListener feedErrorListener) {
        this.feedErrorListener = feedErrorListener;
        return this;
    }

    public DataServiceOrchestrator withProcessErrorListener(InputOutputCaller.BulkInputOutputCaller.ErrorListener processErrorListener) {
        this.processErrorListener = processErrorListener;
        return this;
    }

    public void run() {
        averageThreadsPerHost = (int) Math.ceil(threadCount/(double) clients.size());
        OutputCaller.BulkOutputCaller<JsonNode> feedCaller = getFeedCaller();
        for (Map.Entry<String, DatabaseClient> entry: clients.entrySet()) {
            String host = entry.getKey();
            DatabaseClient client = entry.getValue();
            InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode> processCaller = BulkUtil.createInputOutputCaller(Collections.singletonMap(host, client), forestConfiguration, processAPI, endpointConstants, endpointState, averageThreadsPerHost, 1, false);
            processCaller.setErrorListener(processErrorListener);
            processCaller.setOutputListener(outputListener);
            processCallers.put(host, processCaller);
        }
        feedCaller.setOutputListener((feedOutput) -> {
            InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode> processController = getProcessCaller(feedOutput.path("preferredHost").asText(defaultHost));
            ObjectNode input = objectMapper.createObjectNode();
            input.setAll(endpointConstants);
            input.setAll((ObjectNode) feedOutput);
            processController.accept(input);
        });
        awaitCompletion();
    }

    public void interrupt() {
        feedCaller.interrupt();
        for (InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode> processCaller: processCallers.values()) {
            processCaller.interrupt();
        }
    }

    void awaitCompletion() {
        feedCaller.awaitCompletion();
        for (InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode> processCaller: processCallers.values()) {
            processCaller.awaitCompletion();
        }
    }

    private OutputCaller.BulkOutputCaller<JsonNode> getFeedCaller() {
        if (feedCaller == null) {
            feedCaller = BulkUtil.createOutputCaller(clients, forestConfiguration, feedAPI, endpointConstants, endpointState, threadCount);
            feedCaller.setErrorListener(feedErrorListener);
        }
        return feedCaller;
    }


    private InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode> getProcessCaller(String preferredHost) {
        return processCallers.get(preferredHost);
    }
}
