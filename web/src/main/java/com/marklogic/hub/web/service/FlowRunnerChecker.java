package com.marklogic.hub.web.service;

import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.web.model.FlowJobModel.LatestJob;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class FlowRunnerChecker {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    private static FlowRunnerChecker instance;
    private FlowRunnerImpl flowRunner;
    private LatestJob latestJob;

    private FlowRunnerChecker(FlowRunnerImpl flowRunner) {
        latestJob = new LatestJob();
        this.flowRunner = flowRunner;
        flowRunner.onStatusChanged((jobId, step, jobStatus, percentComplete, successfulEvents, failedEvents, message) -> {
            latestJob.id = jobId;
            if (step.getName().startsWith("default-")) {
                latestJob.stepId = step.getName();
            } else {
                latestJob.stepId = step.getName() + "-" + step.getType();
            }
            latestJob.stepName = step.getName();
            latestJob.stepRunningPercent = percentComplete;

            logger.debug(String.format("pct: %s, msg: %s, jobid: %s", latestJob.stepRunningPercent, message, jobId));

            RunFlowResponse rfr = flowRunner.getJobResponseById(jobId);
            logger.debug(rfr.toString());

            latestJob.startTime = rfr.getStartTime();
            latestJob.endTime = rfr.getEndTime();
            latestJob.successfulEvents = successfulEvents;
            latestJob.failedEvents = failedEvents;
            latestJob.status = StringUtils.isNotEmpty(jobStatus.toString()) ? jobStatus.toString() : rfr.getJobStatus();

            if (StringUtils.isEmpty(latestJob.status)) {
                Map<String, Job> stepResponseByKey = rfr.getStepResponses();
                if (stepResponseByKey != null) {
                    Job stepJob = stepResponseByKey.get(flowRunner.getRunningStepKey());
                    if (stepJob != null) {
                        latestJob.status = stepJob.getStatus();
                        logger.debug("step job info:" + stepJob.toString());
                    }
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
        if (!flowRunner.jobIsRunning() && StringUtils.isNotEmpty(latestJob.endTime)) {
            LatestJob retJob = latestJob;
            latestJob = new LatestJob();
            return retJob;
        }
        return latestJob;
    }
}
