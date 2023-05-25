package com.marklogic.hub.dataservices;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.dataservices.ExecCaller;
import com.marklogic.client.dataservices.IOEndpoint;
import com.marklogic.client.dataservices.InputCaller;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.JacksonHandle;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

public class BulkUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();
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
        runExecCaller(databaseClient, apiPath, endpointConstants, "Unable to delete data, cause: ");
    }

    public static void runExecCaller(DatabaseClient databaseClient, String apiPath, ObjectNode endpointConstants, String errorPrefix) {
        try (InputStreamReader apiReader = new InputStreamReader(BulkUtil.class.getClassLoader().getResourceAsStream(apiPath), StandardCharsets.UTF_8)) {
            ObjectNode apiNode = objectMapper.readValue(apiReader, ObjectNode.class);
            ExecCaller caller = ExecCaller.on(databaseClient, new JacksonHandle(apiNode));
            CapturingErrorListener errorListener = new CapturingErrorListener();

            ExecCaller.BulkExecCaller bulkCaller = caller.bulkCaller(caller.newCallContext()
                    .withEndpointConstantsAs(endpointConstants));
            bulkCaller.setErrorListener(errorListener);
            bulkCaller.awaitCompletion();

            Throwable throwable = errorListener.throwable;
            if (throwable != null) {
                throw new RuntimeException(errorPrefix + throwable.getMessage(), throwable);
            }
        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to find API module " + apiPath + " on classpath; cause: " + e.getMessage(), e);
        }
    }

    public static InputCaller.BulkInputCaller<InputStreamHandle> runInputCaller(DatabaseClient databaseClient, String apiPath, ObjectNode endpointConstants, ObjectNode endpointState, int threadCount, int batchSize, InputCaller.BulkInputCaller.ErrorListener errorListener) {
        try (InputStreamReader apiReader = new InputStreamReader(BulkUtil.class.getClassLoader().getResourceAsStream(apiPath), StandardCharsets.UTF_8)) {
            ObjectNode apiNode = objectMapper.readValue(apiReader, ObjectNode.class);
            apiNode.putObject("$bulk").put("inputBatchSize", batchSize);
            InputCaller<InputStreamHandle> caller = InputCaller.onHandles(databaseClient, new JacksonHandle(apiNode), new InputStreamHandle());
            IOEndpoint.CallContext[] callerContexts =  new IOEndpoint.CallContext[threadCount];
            for (int i = 0; i < threadCount; i++) {
                callerContexts[i] = caller.newCallContext()
                        .withEndpointConstantsAs(endpointConstants)
                        .withEndpointState(new JacksonHandle(endpointState));
            }
            InputCaller.BulkInputCaller<InputStreamHandle> bulkCaller = caller.bulkCaller(callerContexts);
            bulkCaller.setErrorListener(errorListener);
            return bulkCaller;
        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to find API module " + apiPath + " on classpath; cause: " + e.getMessage(), e);
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
