package com.marklogic.hub.flow;


import com.marklogic.hub.step.impl.Step;

public interface FlowStatusListener {

    /**
     *
     * @param jobId - the id of the running job
     * @param step -  the current running step
     * @param jobStatus - status of the running job
     * @param percentComplete - the percentage of completeness expressed as an int
     * @param successfulEvents - counter for success
     * @param failedEvents - counter for failure
     * @param message - the message you'd like to send along with it
     */
    void onStatusChanged(String jobId, Step step, String jobStatus, int percentComplete, long successfulEvents, long failedEvents, String message) ;

}
