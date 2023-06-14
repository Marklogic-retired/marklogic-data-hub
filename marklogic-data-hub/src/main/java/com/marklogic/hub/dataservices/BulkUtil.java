package com.marklogic.hub.dataservices;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.Forest;
import com.marklogic.client.datamovement.ForestConfiguration;
import com.marklogic.client.datamovement.impl.DataMovementManagerImpl;
import com.marklogic.client.dataservices.ExecCaller;
import com.marklogic.client.dataservices.IOEndpoint;
import com.marklogic.client.dataservices.InputCaller;
import com.marklogic.client.dataservices.InputOutputCaller;
import com.marklogic.client.dataservices.OutputCaller;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.JacksonHandle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class BulkUtil {
    protected static final Logger logger = LoggerFactory.getLogger(BulkUtil.class);
    static final ObjectMapper objectMapper = new ObjectMapper();
    private static final Pattern dateTimePattern = Pattern.compile("^(-?)P(?=.)((\\d*)Y)?((\\d+)M)?((\\d*)D)?(T(?=\\d)(\\d+H)?(([\\d]+)M)?(([\\d]+(?:\\.\\d+)?)S)?)?$");

    public static void deleteData(DatabaseClient databaseClient, String apiPath, String retainDuration) {
        // See https://stackoverflow.com/a/52645128/535924 for more information about
        // the duration regex
        if (retainDuration == null || !dateTimePattern.matcher(retainDuration).matches()) {
            throw new IllegalArgumentException(
                "retainDuration must be a duration in the format of PnYnM or PnDTnHnMnS");
        }

        ObjectNode endpointConstants = objectMapper.createObjectNode().put("batchSize", 250).put("retainDuration",
                retainDuration);
        CapturingErrorListener errorListener = new CapturingErrorListener();
        ExecCaller.BulkExecCaller bulkCaller = createExecCaller(databaseClient, apiPath, endpointConstants, objectMapper.createObjectNode(), 4);
        if (bulkCaller == null) {
            throw new RuntimeException("Unable to delete data, cause: Couldn't create bulk caller.");
        }
        bulkCaller.setErrorListener(errorListener);
        bulkCaller.awaitCompletion();
        Throwable throwable = errorListener.throwable;
        if (throwable != null) {
            throw new RuntimeException("Unable to delete data, cause: " + throwable.getMessage(), throwable);
        }
    }

    public static ExecCaller.BulkExecCaller createExecCaller(DatabaseClient databaseClient, String apiPath, ObjectNode endpointConstants, ObjectNode endpointState, int threadCount) {
        try (InputStreamReader apiReader = new InputStreamReader(BulkUtil.class.getClassLoader().getResourceAsStream(apiPath), StandardCharsets.UTF_8)) {
            ObjectNode apiNode = objectMapper.readValue(apiReader, ObjectNode.class);
            return createExecBulkCaller(apiNode, databaseClient, threadCount, endpointConstants, endpointState, true);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to find API module " + apiPath + " on classpath; cause: " + e.getMessage(), e);
        }
    }

    public static OutputCaller.BulkOutputCaller<JsonNode> createOutputCaller(DatabaseClient databaseClient, String apiPath, ObjectNode endpointConstants, ObjectNode endpointState, int threadCount) {
        try (InputStreamReader apiReader = new InputStreamReader(BulkUtil.class.getClassLoader().getResourceAsStream(apiPath), StandardCharsets.UTF_8)) {
            ObjectNode apiNode = objectMapper.readValue(apiReader, ObjectNode.class);
            return createBulkOutputCaller(apiNode, databaseClient, threadCount, endpointConstants, endpointState, true);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to find API module " + apiPath + " on classpath; cause: " + e.getMessage(), e);
        }
    }


    public static OutputCaller.BulkOutputCaller<JsonNode> createOutputCaller(Map<String, DatabaseClient> clients, ForestConfiguration forestConfiguration, String apiPath, ObjectNode endpointConstants, ObjectNode endpointState, int threadCount) {
        try (InputStreamReader apiReader = new InputStreamReader(BulkUtil.class.getClassLoader().getResourceAsStream(apiPath), StandardCharsets.UTF_8)) {
            ObjectNode apiNode = objectMapper.readValue(apiReader, ObjectNode.class);
            return createBulkOutputCaller(apiNode, clients, forestConfiguration, threadCount, endpointConstants, endpointState, true);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to find API module " + apiPath + " on classpath; cause: " + e.getMessage(), e);
        }
    }

    public static InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode> createInputOutputCaller(DatabaseClient databaseClient, String apiPath, ObjectNode endpointConstants, ObjectNode endpointState, int threadCount, boolean passForrestIds) {
        try (InputStreamReader apiReader = new InputStreamReader(BulkUtil.class.getClassLoader().getResourceAsStream(apiPath), StandardCharsets.UTF_8)) {
            ObjectNode apiNode = objectMapper.readValue(apiReader, ObjectNode.class);
            return createBulkInputOutputCaller(apiNode, databaseClient, threadCount, endpointConstants, endpointState, passForrestIds);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to find API module " + apiPath + " on classpath; cause: " + e.getMessage(), e);
        }
    }

    public static InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode> createInputOutputCaller(Map<String, DatabaseClient> clients, ForestConfiguration forestConfiguration, String apiPath, ObjectNode endpointConstants, ObjectNode endpointState, int threadCount, int batchSize, boolean passForrestIds) {
        try (InputStreamReader apiReader = new InputStreamReader(BulkUtil.class.getClassLoader().getResourceAsStream(apiPath), StandardCharsets.UTF_8)) {
            ObjectNode apiNode = objectMapper.readValue(apiReader, ObjectNode.class);
            apiNode.putObject("$bulk").put("inputBatchSize", batchSize);
            return createBulkInputOutputCaller(apiNode, clients, forestConfiguration, threadCount, endpointConstants, endpointState, passForrestIds);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to find API module " + apiPath + " on classpath; cause: " + e.getMessage(), e);
        }
    }

    public static InputCaller.BulkInputCaller<InputStreamHandle> runInputCaller(DatabaseClient databaseClient, String apiPath, ObjectNode endpointConstants, ObjectNode endpointState, int threadCount, int batchSize, InputCaller.BulkInputCaller.ErrorListener errorListener) {
        try (InputStreamReader apiReader = new InputStreamReader(BulkUtil.class.getClassLoader().getResourceAsStream(apiPath), StandardCharsets.UTF_8)) {
            ObjectNode apiNode = objectMapper.readValue(apiReader, ObjectNode.class);
            apiNode.putObject("$bulk").put("inputBatchSize", batchSize);
            DataMovementManagerImpl movementManager = (DataMovementManagerImpl) databaseClient.newDataMovementManager();
            ForestConfiguration forestConfiguration = movementManager.readForestConfig();
            Map<String, DatabaseClient> clients = preferredClients(forestConfiguration, databaseClient, movementManager);
            int clientsSize = clients.size();
            threadCount = Math.max(threadCount, clientsSize);
            int callContextPerHost = (threadCount / clientsSize);
            threadCount = clientsSize * callContextPerHost;
            IOEndpoint.CallContext[] callerContexts =  new IOEndpoint.CallContext[threadCount];
            InputCaller<InputStreamHandle> caller = null;
            JacksonHandle endpointStateHandle = new JacksonHandle(endpointState);
            JacksonHandle apiNodeHandle = new JacksonHandle(apiNode);
            InputStreamHandle inputStreamHandle = new InputStreamHandle();
            int i = 0;
            for (DatabaseClient preferredClient: clients.values()) {
                caller = InputCaller.onHandles(preferredClient, apiNodeHandle, inputStreamHandle);
                for (int j = 0; j < callContextPerHost; j++) {
                    callerContexts[i++] = caller.newCallContext()
                            .withEndpointConstantsAs(endpointConstants)
                            .withEndpointState(endpointStateHandle);
                }
            }
            if (caller == null) {
                throw new RuntimeException("Unable to build caller for Bulk Data Service. For " + apiPath);
            }
            InputCaller.BulkInputCaller<InputStreamHandle> bulkCaller = caller.bulkCaller(callerContexts);
            bulkCaller.setErrorListener(errorListener);
            return bulkCaller;
        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to find API module " + apiPath + " on classpath; cause: " + e.getMessage(), e);
        }
    }

    public static Map<String, DatabaseClient> preferredClients(ForestConfiguration forestConfiguration, DatabaseClient databaseClient, DataMovementManagerImpl movementManager) {
        String[] preferredHosts = forestConfiguration.getPreferredHosts();
        Map<String, DatabaseClient> hostToClient = new HashMap<>(preferredHosts.length);
        for (String preferredHost: preferredHosts) {
            if (databaseClient.getHost().equals(preferredHost)) {
                hostToClient.put(preferredHost, databaseClient);
            } else {
                DatabaseClient preferredClient = movementManager.getHostClient(preferredHost);
                if (preferredClient != null && preferredClient.checkConnection().isConnected()) {
                    hostToClient.put(preferredHost, preferredClient);
                } else {
                    hostToClient.put(preferredHost, databaseClient);
                }
            }
        }
        return hostToClient;
    }

    private static ExecCaller.BulkExecCaller createExecBulkCaller(JsonNode apiNode, DatabaseClient databaseClient, int threadCount, ObjectNode endpointConstants, ObjectNode endpointState, boolean passForestIDs) {
        BulkCallerBuilder<ExecCaller, ExecCaller.BulkExecCaller> bulkCallerBuilder = new BulkCallerBuilder<>(
                ExecCaller::on,
                ExecCaller::bulkCaller
        );
        return bulkCallerBuilder.setupBulkCaller(apiNode, databaseClient, threadCount, endpointConstants, endpointState, passForestIDs);
    }

    private static OutputCaller.BulkOutputCaller<JsonNode> createBulkOutputCaller(JsonNode apiNode, DatabaseClient databaseClient, int threadCount, ObjectNode endpointConstants, ObjectNode endpointState, boolean passForestIDs) {
        JacksonHandle outputHandle = new JacksonHandle();
        BulkCallerBuilder<OutputCaller<JsonNode>, OutputCaller.BulkOutputCaller<JsonNode>> bulkCallerBuilder = new BulkCallerBuilder<>(
                (client, apiHandle) -> OutputCaller.on(client, apiHandle, outputHandle),
                OutputCaller::bulkCaller
        );
        return bulkCallerBuilder.setupBulkCaller(apiNode, databaseClient, threadCount, endpointConstants, endpointState, passForestIDs);
    }

    private static OutputCaller.BulkOutputCaller<JsonNode> createBulkOutputCaller(JsonNode apiNode, Map<String, DatabaseClient> clients, ForestConfiguration forestConfiguration, int threadCount, ObjectNode endpointConstants, ObjectNode endpointState, boolean passForestIDs) {
        JacksonHandle outputHandle = new JacksonHandle();
        BulkCallerBuilder<OutputCaller<JsonNode>, OutputCaller.BulkOutputCaller<JsonNode>> bulkCallerBuilder = new BulkCallerBuilder<>(
                (client, apiHandle) -> OutputCaller.on(client, apiHandle, outputHandle),
                OutputCaller::bulkCaller
        );
        return bulkCallerBuilder.setupBulkCaller(apiNode, clients, forestConfiguration, threadCount, endpointConstants, endpointState, passForestIDs);
    }

    private static InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode> createBulkInputOutputCaller(JsonNode apiNode, DatabaseClient databaseClient, int threadCount, ObjectNode endpointConstants, ObjectNode endpointState, boolean passForestIDs) {
        JacksonHandle inputHandle = new JacksonHandle();
        JacksonHandle outputHandle = new JacksonHandle();
        BulkCallerBuilder<InputOutputCaller<JsonNode, JsonNode>, InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode>> bulkCallerBuilder = new BulkCallerBuilder<>(
                (client, apiHandle) -> InputOutputCaller.on(client, apiHandle, inputHandle, outputHandle),
                InputOutputCaller::bulkCaller
        );
        return bulkCallerBuilder.setupBulkCaller(apiNode, databaseClient, threadCount, endpointConstants, endpointState, passForestIDs);
    }

    private static InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode> createBulkInputOutputCaller(JsonNode apiNode, Map<String, DatabaseClient> clients, ForestConfiguration forestConfiguration, int threadCount, ObjectNode endpointConstants, ObjectNode endpointState, boolean passForestIDs) {
        JacksonHandle inputHandle = new JacksonHandle();
        JacksonHandle outputHandle = new JacksonHandle();
        BulkCallerBuilder<InputOutputCaller<JsonNode, JsonNode>, InputOutputCaller.BulkInputOutputCaller<JsonNode, JsonNode>> bulkCallerBuilder = new BulkCallerBuilder<>(
                (client, apiHandle) -> InputOutputCaller.on(client, apiHandle, inputHandle, outputHandle),
                InputOutputCaller::bulkCaller
        );
        return bulkCallerBuilder.setupBulkCaller(apiNode, clients, forestConfiguration, threadCount, endpointConstants, endpointState, passForestIDs);
    }

    static Map<String, List<ObjectNode>> constructEndpointConstantsByForest(Forest[] forests, int threads, ObjectNode endpointConstants) {
        Map<String, List<ObjectNode>> endpointConstantsList = new HashMap<>(threads);
        Map<String, List<Forest>> forestMap = Arrays.stream(forests)
                .collect(Collectors.groupingBy(Forest::getPreferredHost));
        int forestsPerThread = (int) Math.ceil(forests.length / (double) threads);
        int forestBuckets = forests.length / forestsPerThread;
        for (Map.Entry<String, List<Forest>> entry: forestMap.entrySet()) {
            String preferredHost = entry.getKey();
            List<ObjectNode> objectNodes;
            if (endpointConstantsList.containsKey(preferredHost)) {
                objectNodes = endpointConstantsList.get(preferredHost);
            } else {
                objectNodes = new ArrayList<>(forestBuckets);
                for (int i = 0; i < forestBuckets; i++) {
                    ObjectNode forestEndpointConstants = objectMapper.createObjectNode();
                    forestEndpointConstants.put("preferredHost", preferredHost);
                    objectNodes.add(forestEndpointConstants.setAll(endpointConstants));
                }
                endpointConstantsList.put(preferredHost, objectNodes);
            }
            int i = 0;
            for (Forest forest: entry.getValue()) {
                int roundRobinPosition = i++ % forestBuckets;
                objectNodes.get(roundRobinPosition).withArray("forestIDs").add(forest.getForestId());
            }
        }
        return endpointConstantsList;
    }

    static Map<String, List<ObjectNode>> constructEndpointConstantsByHost(Map<String, DatabaseClient> clients, ObjectNode endpointConstants, int threadCount) {
        int clientSize = clients.size();
        Map<String, List<ObjectNode>> endpointConstantsList = new HashMap<>(clientSize);
        int averageThreadsPerHost = (int) Math.ceil(threadCount/(double) clients.size());
        for (String preferredHost: clients.keySet()) {
            List<ObjectNode> hostConstants =  new ArrayList<>(averageThreadsPerHost);
            for (int i = 0; i < averageThreadsPerHost; i++) {
                ObjectNode hostEndpointConstants = objectMapper.createObjectNode();
                hostEndpointConstants.setAll(endpointConstants);
                hostEndpointConstants.put("preferredHost", preferredHost);
                hostConstants.add(hostEndpointConstants);
            }
            endpointConstantsList.put(preferredHost, hostConstants);
        }
        return endpointConstantsList;
    }

    static class BulkCallerBuilder<E extends IOEndpoint, B extends IOEndpoint.BulkIOEndpointCaller> {
        final BiFunction<DatabaseClient, JacksonHandle, E> endpointConstructor;
        final BiFunction<E, IOEndpoint.CallContext[], B> bulkEndpointConstructor;

        BulkCallerBuilder(BiFunction<DatabaseClient, JacksonHandle, E> endpointConstructor, BiFunction<E, IOEndpoint.CallContext[], B> bulkEndpointConstructor) {
            this.endpointConstructor = endpointConstructor;
            this.bulkEndpointConstructor = bulkEndpointConstructor;
        }

        public B setupBulkCaller(JsonNode apiNode, DatabaseClient databaseClient, int originalThreadCount, ObjectNode endpointConstants, ObjectNode endpointState, boolean passForestIDs) {
            DataMovementManagerImpl movementManager = (DataMovementManagerImpl) databaseClient.newDataMovementManager();
            ForestConfiguration forestConfiguration = movementManager.readForestConfig();
            Map<String, DatabaseClient> clients = preferredClients(forestConfiguration, databaseClient, movementManager);
            return setupBulkCaller(apiNode, clients, forestConfiguration, originalThreadCount, endpointConstants, endpointState, passForestIDs);
        }

        public B setupBulkCaller(JsonNode apiNode, Map<String, DatabaseClient> clients, ForestConfiguration forestConfiguration, int originalThreadCount, ObjectNode endpointConstants, ObjectNode endpointState, boolean passForestIDs) {
            if (endpointState == null) {
                endpointState = objectMapper.createObjectNode();
            }
            JacksonHandle apiNodeHandle = new JacksonHandle(apiNode);
            Forest[] forests = forestConfiguration.listForests();
            int threadCount = Math.max(originalThreadCount, clients.size());
            if (passForestIDs) {
                threadCount = Math.min(threadCount, forests.length);
            }
            List<IOEndpoint.CallContext> callerContexts =  new ArrayList<>(threadCount);
            Map<String, List<ObjectNode>> endpointConstantsList;
            if (passForestIDs) {
                endpointConstantsList = constructEndpointConstantsByForest(forests, threadCount, endpointConstants);
            } else {
                endpointConstantsList = constructEndpointConstantsByHost(clients, endpointConstants, threadCount);
            }
            JacksonHandle endpointStateHandle = new JacksonHandle(endpointState);
            int i = 0;
            E firstCaller = null;
            for (Map.Entry<String, DatabaseClient> clientEntry: clients.entrySet()) {
                String preferredHost = clientEntry.getKey();
                E caller = endpointConstructor.apply(clientEntry.getValue(), apiNodeHandle);
                if (firstCaller == null) {
                    firstCaller = caller;
                }
                for (ObjectNode constants: endpointConstantsList.get(preferredHost)) {
                    IOEndpoint.CallContext callerContext = caller.newCallContext()
                            .withEndpointConstantsAs(constants)
                            .withEndpointState(endpointStateHandle);
                    callerContexts.add(callerContext);
                }
            }
            if (originalThreadCount != callerContexts.size()) {
                logger.info("Adjusted requested threads from {} to {} for optimal cluster use. Forests: {}", Integer.valueOf(originalThreadCount), Integer.valueOf(callerContexts.size()), Integer.valueOf(forests.length));
            }
            return firstCaller != null ? bulkEndpointConstructor.apply(firstCaller, callerContexts.toArray(callerContexts.toArray(new IOEndpoint.CallContext[0]))): null;
        }
    }

    static class CapturingErrorListener implements ExecCaller.BulkExecCaller.ErrorListener {
        Throwable throwable;
        public IOEndpoint.BulkIOEndpointCaller.ErrorDisposition processError(int retryCount, Throwable throwable,
                                                                             IOEndpoint.CallContext callContext) {
            this.throwable = throwable;
            return IOEndpoint.BulkIOEndpointCaller.ErrorDisposition.STOP_ALL_CALLS;
        }
    }
}
