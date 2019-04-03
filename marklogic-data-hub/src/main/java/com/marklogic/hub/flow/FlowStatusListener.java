package com.marklogic.hub.flow;

import com.marklogic.hub.step.Step;

public interface FlowStatusListener {

    /**
     *
     * @param jobId - the id of the running job
     * @param step -  the current running step
     * @param percentComplete - the percentage of completeness expressed as an int
     * @param message - the message you'd like to send along with it
     */

    void onStatusChanged(String jobId, Step step, int percentComplete, String message) ;

}
