package com.marklogic.hub.job;

import java.util.List;
import java.util.Map;
/**
 * Monitor job / batch status
 */
public interface JobMonitor {

    /**
     * Gets the current running jobs
     * @return A map of the current running job ids and their status
     */
    Map<String, String> getCurrentJobs();

    /**
     * Sets the flow to be used with the flow runner
     * @param jobId the flow object to be used
     * @return string denoting the status of the running job, ex: "running step 1"
     */

    String getJobStatus(String jobId);

    /**
     * Sets the flow to be used with the flow runner
     * @param batchId the id of the batch
     * @return string denoting status of the batch
     *
     */

    String getBatchStatus(String jobId, String batchId);

    /**
     * Sets the flow to be used with the flow runner
     * @param jobId the id of the batch
     * @param step the step of the job
     * @return Map containing batch id and status of the batch
     *
     */

    Map<String,String> getStepBatchStatus(String jobId, String step);


    /**
     * Returns the response (uris or error msgs) of the batch
     * @param jobId the id of the job
     * @param batchId the id of the batch
     * @return the flow runner object
     */

    List<String> getBatchResponse(String jobId, String batchId);

    /**
     * The next step to be executed
     * @param jobId the id of the job
     * @return string denoting the next step of the job
     */

    String getNextStep(String jobId);
}
