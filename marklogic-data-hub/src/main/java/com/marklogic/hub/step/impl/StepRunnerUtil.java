package com.marklogic.hub.step.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.job.JobDocManager;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.RunStepResponse;

import java.util.UUID;

public class StepRunnerUtil {

    protected static RunStepResponse getResponse(JsonNode jobNode, String step){
        RunStepResponse stepDoc;
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            stepDoc = objectMapper.treeToValue(jobNode.get("job").get("stepResponses").get(step), RunStepResponse.class);
        }
        catch (Exception e) {
            throw new RuntimeException(e);
        }
        return stepDoc;
    }

    protected static RunStepResponse createStepResponse(Flow flow, String step, String jobId) {
        RunStepResponse runStepResponse = RunStepResponse.withFlow(flow).withStep(step);
        if (jobId == null) {
            jobId = UUID.randomUUID().toString();
        }
        runStepResponse.withJobId(jobId);
        return runStepResponse;
    }

    protected static String jsonToString(JsonNode node) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(node);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    protected static void initializeStepRun(JobDocManager jobDocManager, RunStepResponse runStepResponse, Flow flow, String step, String jobId) {
        try{
            jobDocManager.getJobs(jobId);
        }
        catch(ResourceNotFoundException e) {
            jobDocManager.createJob(jobId,flow.getName());
        }
        try {
            jobDocManager.postJobs(jobId, JobStatus.RUNNING_PREFIX + step, step, null, runStepResponse);
        }
        catch (Exception ex) {
            throw ex;
        }
    }

}
