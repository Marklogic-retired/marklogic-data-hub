package com.marklogic.hub.web.service;

import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.model.FlowJobModel.LatestJob;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FlowRunnerChecker {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    private static FlowRunnerChecker instance;
    private FlowRunnerImpl flowRunner;
    private LatestJob latestJob;
    private Set<String> completedSteps;

    private FlowRunnerChecker(FlowRunnerImpl flowRunner) {
        latestJob = new LatestJob();
        completedSteps = new HashSet<>();
        this.flowRunner = flowRunner;
        flowRunner.onStatusChanged((jobId, step, jobStatus, percentComplete, successfulEvents, failedEvents, message) -> {
            latestJob.id = jobId;
            if (step.getName().startsWith("default-")) {
                latestJob.stepId = step.getName();
            } else {
                latestJob.stepId = step.getName() + "-" + step.getStepDefinitionType();
            }
            latestJob.stepName = step.getName();
            latestJob.stepRunningPercent = percentComplete;

            logger.debug(String.format("pct: %s, msg: %s, jobid: %s", latestJob.stepRunningPercent, message, jobId));
            RunFlowResponse rfr = flowRunner.getJobResponseById(jobId);
            logger.debug(rfr.toString());

            latestJob.startTime = rfr.getStartTime();
            latestJob.endTime = rfr.getEndTime();
            latestJob.status = StringUtils.isNotEmpty(jobStatus) ? jobStatus : rfr.getJobStatus();

            Map<String, RunStepResponse> stepResponseByKey = rfr.getStepResponses();
            if (stepResponseByKey != null) {
                RunStepResponse stepJob = stepResponseByKey.get(flowRunner.getRunningStepKey());
                if (stepJob != null) {
                    latestJob.status = StringUtils.isEmpty(latestJob.status) ? stepJob.getStatus() : latestJob.status;
                    if (stepJob.getStepOutput() != null) {
                        JSONObject jsonObject = new JSONObject();
                        jsonObject.putArray("output", stepJob.getStepOutput());
                        latestJob.output = jsonObject.jsonNode();
                    }
                    logger.debug("step job info:" + stepJob.toString());
                }
            }

            if (StringUtils.isNotEmpty(latestJob.status) && latestJob.status.startsWith(JobStatus.COMPLETED_PREFIX)) {
                if (!completedSteps.contains(latestJob.status)) {
                    latestJob.successfulEvents += successfulEvents;
                    latestJob.failedEvents += failedEvents;
                    completedSteps.add(latestJob.status);
                }
            }
            logger.debug(latestJob.toString());
        });
    }

    public static FlowRunnerChecker getInstance(FlowRunnerImpl flowRunner) {
        if (instance == null) {
            synchronized (FlowRunnerChecker.class) {
                instance = new FlowRunnerChecker(flowRunner);
            }
        }
        return instance;
    }

    public LatestJob getLatestJob() {
        if (!flowRunner.isJobRunning() && StringUtils.isNotEmpty(latestJob.endTime)) {
            LatestJob retJob = latestJob;
            latestJob = new LatestJob();
            completedSteps = new HashSet<>();
            return retJob;
        }
        return latestJob;
    }
}
