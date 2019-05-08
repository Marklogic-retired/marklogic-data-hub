package com.marklogic.hub.web.service;

import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.model.FlowJobModel.LatestJob;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

public class FlowRunnerChecker {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    static class StepCounters {
        long successfulEvents;
        long failedEvents;

        public StepCounters(long successfulEvents, long failedEvents) {
            this.successfulEvents = successfulEvents;
            this.failedEvents = failedEvents;
        }
    }

    private static FlowRunnerChecker instance;
    private FlowRunnerImpl flowRunner;
    private LatestJob latestJob;
    private Map<String, StepCounters> completedSteps;

    private FlowRunnerChecker(FlowRunnerImpl flowRunner) {
        latestJob = new LatestJob();
        completedSteps = new HashMap<>();
        this.flowRunner = flowRunner;
        flowRunner.onStatusChanged((jobId, step, jobStatus, percentComplete, successfulEvents, failedEvents, message) -> {
            latestJob.id = jobId;
            latestJob.stepId = step.getName() + "-" + step.getStepDefinitionType();
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
                    latestJob.status = StringUtils.isNotEmpty(stepJob.getStatus()) && !JobStatus.isJobDone(latestJob.status) ? stepJob.getStatus() : latestJob.status;
                    if (stepJob.getStepOutput() != null) {
                        JSONObject jsonObject = new JSONObject();
                        jsonObject.putArray("output", stepJob.getStepOutput());
                        latestJob.output = jsonObject.jsonNode();
                    }
                    logger.debug("step job info:" + stepJob.toString());
                }
            }

            if (StringUtils.isNotEmpty(latestJob.status)) {
                if (latestJob.status.startsWith(JobStatus.RUNNING_PREFIX)) {
                    latestJob.successfulEvents = successfulEvents;
                    latestJob.failedEvents = failedEvents;
                }
                else if (JobStatus.isStepDone(latestJob.status) || JobStatus.isJobDone(latestJob.status)) {
                    completedSteps.putIfAbsent(latestJob.stepId, new StepCounters(successfulEvents, failedEvents));
                    latestJob.successfulEvents = 0;
                    latestJob.failedEvents = 0;
                    completedSteps.values().forEach(c -> {
                        latestJob.successfulEvents += c.successfulEvents;
                        latestJob.failedEvents += c.failedEvents;
                    });
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
            completedSteps = new HashMap<>();
            return retJob;
        }
        return latestJob;
    }
}
