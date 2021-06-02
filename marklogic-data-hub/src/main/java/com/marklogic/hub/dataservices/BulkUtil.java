package com.marklogic.hub.dataservices;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.dataservices.ExecCaller;
import com.marklogic.client.dataservices.IOEndpoint;
import com.marklogic.client.io.JacksonHandle;

import java.io.IOException;
import java.io.InputStreamReader;

public class BulkUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static void deleteData(DatabaseClient databaseClient, String apiPath, String retainDuration) {
        // See https://stackoverflow.com/a/52645128/535924 for more information about
        // the duration regex
        if (retainDuration == null || !retainDuration.matches(
            "^(-?)P(?=.)((\\d*)Y)?((\\d+)M)?((\\d*)D)?(T(?=\\d)(\\d+H)?(([\\d]+)M)?(([\\d]+(?:\\.\\d+)?)S)?)?$")) {
            throw new IllegalArgumentException(
                "retainDuration must be a duration in the format of PnYnM or PnDTnHnMnS");
        }

        try (InputStreamReader apiReader = new InputStreamReader(BulkUtil.class.getClassLoader().getResourceAsStream(apiPath))) {
            ObjectNode apiNode = objectMapper.readValue(apiReader, ObjectNode.class);
            ExecCaller caller = ExecCaller.on(databaseClient, new JacksonHandle(apiNode));
            CapturingErrorListener errorListener = new CapturingErrorListener();
            ObjectNode endpointConstants = objectMapper.createObjectNode().put("batchSize", 250).put("retainDuration",
                retainDuration);

            ExecCaller.BulkExecCaller bulkCaller = caller.bulkCaller(caller.newCallContext()
                .withEndpointConstantsAs(endpointConstants));
            bulkCaller.setErrorListener(errorListener);
            bulkCaller.awaitCompletion();

            Throwable throwable = errorListener.throwable;
            if (throwable != null) {
                throw new RuntimeException("Unable to delete data, cause: " + throwable.getMessage(), throwable);
            }
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
