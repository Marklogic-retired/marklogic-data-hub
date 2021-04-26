package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.dataservices.ExecCaller;
import com.marklogic.client.dataservices.IOEndpoint;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubClient;

import java.io.IOException;
import java.io.InputStreamReader;

public class JobManager {

    private ExecCaller deleteJobsCaller;
    private ObjectMapper objectMapper = new ObjectMapper();

    public JobManager(HubClient hubClient) {
        ObjectNode apiNode;
        final String apiPath = "/ml-modules/root/data-hub/5/data-services/bulk/deleteJobs.api";
        try (InputStreamReader apiReader = new InputStreamReader(this.getClass().getResourceAsStream(apiPath))) {
            apiNode = objectMapper.readValue(apiReader, ObjectNode.class);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Unable to find API module " + apiPath + " on classpath; cause: " + e.getMessage(), e);
        }
        deleteJobsCaller = ExecCaller.on(hubClient.getJobsClient(), new JacksonHandle(apiNode));
    }

    public void deleteJobs(String retainDuration) {
        // See https://stackoverflow.com/a/52645128/535924 for more information about
        // the duration regex
        if (retainDuration == null || !retainDuration.matches(
                "^(-?)P(?=.)((\\d*)Y)?((\\d+)M)?((\\d*)D)?(T(?=\\d)(\\d+H)?(([\\d]+)M)?(([\\d]+(?:\\.\\d+)?)S)?)?$")) {
            throw new IllegalArgumentException(
                    "retainDuration must be a duration in the format of PnYnM or PnDTnHnMnS");
        }
        ObjectNode endpointConstants = objectMapper.createObjectNode().put("batchSize", 250).put("retainDuration",
                retainDuration);
        CapturingErrorListener errorListener = new CapturingErrorListener();

        ExecCaller.BulkExecCaller bulkCaller = this.deleteJobsCaller
                .bulkCaller(this.deleteJobsCaller.newCallContext().withEndpointConstantsAs(endpointConstants));
        bulkCaller.setErrorListener(errorListener);
        bulkCaller.awaitCompletion();

        Throwable throwable = errorListener.throwable;
        if (throwable != null) {
            throw new RuntimeException("Unable to delete jobs, cause: " + throwable.getMessage(), throwable);
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
