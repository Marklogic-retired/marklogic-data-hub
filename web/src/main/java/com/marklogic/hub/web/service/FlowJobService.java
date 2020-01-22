package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.job.JobDocManager;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.util.metrics.tracer.JaegerConfig;
import com.marklogic.hub.web.model.FlowJobModel.FlowJobs;
import com.marklogic.hub.web.model.FlowJobModel.LatestJob;
import io.opentracing.Scope;
import io.opentracing.Span;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.xml.bind.DatatypeConverter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static com.marklogic.hub.job.JobStatus.RUNNING_PREFIX;

@Service
public class FlowJobService implements DisposableBean {

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private FlowRunnerImpl flowRunner;

    @Autowired
    private HubConfigImpl hubConfig;

    private DatabaseClient client;
    private JobDocManager jobDocManager;

    protected static boolean firstTimeRun = true;

    //use a cache with ttl 5 minutes to reduce frequency for fetching data from DB
    public final Cache<String, FlowJobs> cachedJobsByFlowName = CacheBuilder.newBuilder().expireAfterWrite(
        5, TimeUnit.SECONDS).build();

    public FlowJobService() {
        super();
        if (hubConfig != null) {
            this.setupClient();
        }
    }

    private void setupClient() {
        client = hubConfig.newJobDbClient();
        this.jobDocManager = new JobDocManager(client);
    }

    public void destroy() {
        logger.info("release the job database client.");
        this.release();
    }

    /**
     * Get all the jobs for a list of flows
     * @param flows a list of flows
     * @param parentSpan parent span
     * @return a map (k,v) as (flowname, flowjobs)
     */
    public Map<String, FlowJobs> getFlowJobs(List<Flow> flows, Span parentSpan) {
        Span span = JaegerConfig.buildSpanFromMethod(new Object() {}, parentSpan)
            .start();
        try (Scope ignored = JaegerConfig.activate(span)) {
            span.setTag("setupClient", true);
            span.setTag("beforeInitialClient",
                client == null ? "client is null" : "client is not null");
            if (client == null) {
                setupClient();
            }
            span.setTag("AfterInitialClient", client.getClientImplementation().toString());
        } catch (Exception e) {
            logger.error("Failed to init client!!!");
        } finally {
            span.finish();
        }

        Map<String, Flow> flowMap = new HashMap<>();
        flows.forEach(flow -> flowMap.put(flow.getName(), flow));

        JsonNode jsonNode;
        Span span2 = JaegerConfig.buildSpanFromMethod(new Object() {}, parentSpan)
            .withTag("getAllJobsCall", true)
            .start();
        try (Scope ignored = JaegerConfig.activate(span2)) {
            List<String> names = new ArrayList<>();
            for (Flow flow : flows) {
                names.add(flow.getName());
            }
            jsonNode = jobDocManager.getJobDocumentsForFlows(names);
            if (jsonNode == null) {
                throw new RuntimeException("Failed to get jobs for flows!");
            }
        } finally {
            span2.finish();
        }

        Map<String, FlowJobs> mapJobsByFlow = new HashMap<>();
        Iterator<String> fields = jsonNode.fieldNames();
        List<String> staleStateJobIds = new ArrayList<>();
        while (fields.hasNext()) {
            String flowName = fields.next();
            JsonNode flowData =jsonNode.get(flowName);
            List<String> jobIds = new ArrayList<>();
            if (flowData.get("jobIds") != null && flowData.get("jobIds").isArray()) {
                flowData.get("jobIds").forEach(id -> jobIds.add(id.asText()));
            }

            LatestJob latestJob = new LatestJob();
            if (flowData.get("latestJob") != null && flowData.get("latestJob").has("job")) {
                convertJsonToLatestJob(latestJob, flowData.get("latestJob").get("job"), flowMap.get(flowName), staleStateJobIds);
            }

            mapJobsByFlow.put(flowName, new FlowJobs(jobIds, latestJob));
        }
        if (!staleStateJobIds.isEmpty()) {
            updateJobStaleStates(staleStateJobIds);
        }
        return mapJobsByFlow;
    }

    /**
     * Get jobs for one flow
     * @param flow a flow
     * @param forceRefresh if refresh or not
     * @return FlowJobs for the flow
     */
    public FlowJobs getJobsByFlow(Flow flow, boolean forceRefresh) {
        String flowName = flow.getName();
        if (forceRefresh) {
            FlowJobs flowJobs = retrieveJobsByFlowName(flow);
            cachedJobsByFlowName.put(flowName, flowJobs);
            return flowJobs;
        }

        Span span = JaegerConfig.buildSpanFromMethod(new Object() {})
            .withTag("flowName", flowName)
            .start();

        try (Scope ignored = JaegerConfig.activate(span)) {
            return cachedJobsByFlowName.get(flowName, () -> retrieveJobsByFlowName(flow));
        } catch (Exception e) {
            logger.error(e.getMessage());
        } finally {
            if (cachedJobsByFlowName.getIfPresent(flowName) == null) {
                cachedJobsByFlowName.invalidate(flowName);
            }
            span.finish();
        }

        return cachedJobsByFlowName.getIfPresent(flowName);
    }

    private void convertJsonToLatestJob(LatestJob latestJob, JsonNode node, Flow flow, List<String> staleStateJobIds) {
        JSONObject jobJson = new JSONObject(node);

        String jobId = jobJson.getString("jobId");
        String jobStatus = jobJson.getString("jobStatus");
        latestJob.id = jobId;
        latestJob.startTime = jobJson.getString("timeStarted", "");
        latestJob.endTime = jobJson.getString("timeEnded", "");
        if ("N/A".equals(latestJob.endTime)) {
            latestJob.endTime = "";
        }

        boolean setJobStatus = true;
        if (firstTimeRun && flowRunner.getRunningFlow() == null) {
            if (StringUtils.isNotEmpty(jobStatus) && jobStatus.startsWith(RUNNING_PREFIX)) {
                //invalid state on the job database that may be caused by unexpected server shutdown or crashed
                staleStateJobIds.add(jobId);
                latestJob.status = JobStatus.FAILED.toString();
                setJobStatus = false;
            }
        }
        if (setJobStatus) {
            latestJob.status = jobJson.getString("jobStatus");
        }
        setLastestJob(latestJob, flow, jobJson);
    }

    private void setLastestJob(LatestJob latestJob, Flow flow, JSONObject jobJson) {
        Map<String, Step> steps = flow.getSteps();

        latestJob.id = jobJson.getString("jobId");
        latestJob.startTime = jobJson.getString("timeStarted", "");
        latestJob.endTime = jobJson.getString("timeEnded", "");
        if ("N/A".equals(latestJob.endTime)) {
            latestJob.endTime = "";
        }

        latestJob.status = jobJson.getString("jobStatus");
        String completedKey = jobJson.getString("lastCompletedStep", "0");
        String attemptedKey = jobJson.getString("lastAttemptedStep", "0");
        String stepKey = Integer.compare(Integer.valueOf(completedKey), Integer.valueOf(attemptedKey)) < 0 ? attemptedKey : completedKey;
        Optional.ofNullable(steps.get(stepKey)).ifPresent(s -> {
            latestJob.stepName = s.getName();
            latestJob.stepId = s.getName() + "-" + s.getStepDefinitionType();
        });

        JsonNode stepRes = jobJson.getNode("stepResponses");

        if (stepRes != null) {
            stepRes.forEach(s -> {
                latestJob.successfulEvents += s.get("successfulEvents") != null ? s.get("successfulEvents").asLong() : 0;
                latestJob.failedEvents += s.get("failedEvents") != null ? s.get("failedEvents").asLong() : 0;
                latestJob.output = s.get("stepOutput"); //last step output ?
            });
        }
    }

    /**
     * Set the jobStatus as Failed and timeEnded due to server failure during flow running
     * @param staleStateJobIds a list of staleJobIds
     */
    private void updateJobStaleStates(List<String> staleStateJobIds) {
        logger.warn("UPDATING JOB STALE STATES!!!");
        for (String jobId : staleStateJobIds) {
            try {
                jobDocManager.updateJobStatus(jobId, JobStatus.FAILED);
            } catch (Exception e) {
                logger.error(jobId + ":" + e.getMessage());
            }
        }
    }

    private FlowJobs retrieveJobsByFlowName(Flow flow) {
        String flowName = flow.getName();
        if (client == null) {
            setupClient();
        }

        JsonNode jsonNode = jobDocManager.getJobDocumentsForFlow(flowName);
        if (jsonNode == null) {
            throw new RuntimeException("Failed to get jobs for one flow: " + flowName);
        }

        return retrieveJobsByFlowName(flow, jsonNode);
    }

    private FlowJobs retrieveJobsByFlowName(Flow flow, JsonNode jsonNode) {
        LatestJob latestJob = new LatestJob();
        List<String> jobs = new ArrayList<>();
        FlowJobs flowJobs = new FlowJobs(jobs, latestJob);

        final JsonNode[] lastJob = {null};
        final String[] lastTime = {null, null}; //store last start and end time
        if (jsonNode.isArray()) {
            jsonNode.forEach(job -> {
                JSONObject jobJson = new JSONObject(job.get("job"));
                String jobId = jobJson.getString("jobId");
                jobs.add(jobId);
                String currStartTime = jobJson.getString("timeStarted", "");
                String currEndTime = jobJson.getString("timeEnded", "");

                if (StringUtils.isEmpty(lastTime[0])) {
                    lastTime[0] = currStartTime;
                    lastTime[1] = currEndTime;
                    lastJob[0] = jobJson.jsonNode();
                } else {
                    try {
                        int cmp = DatatypeConverter.parseDateTime(lastTime[0]).getTime().compareTo(DatatypeConverter.parseDateTime(currStartTime).getTime());
                        if (cmp < 0) {
                            lastTime[0] = currStartTime;
                            lastTime[1] = currEndTime;
                            //lastJobId[0] = jobId;
                            lastJob[0] = jobJson.jsonNode();
                        } else if (cmp == 0) { //compare end time just in case
                            if (DatatypeConverter.parseDateTime(lastTime[1]).getTime().compareTo(DatatypeConverter.parseDateTime(currEndTime).getTime()) < 0) {
                                lastTime[0] = currStartTime;
                                lastTime[1] = currEndTime;
                                lastJob[0] = jobJson.jsonNode();
                            }
                        }
                    } catch (Exception e) {
                        logger.error(e.getMessage());
                    }
                }
            });
        }

        if (jobs.isEmpty() || lastJob[0] == null) {
            return flowJobs;
        }

        JSONObject jobJson = new JSONObject(lastJob[0]);
        setLastestJob(latestJob, flow, jobJson);
        return flowJobs;
    }

    private void release() {
        if (client != null) {
            try {
                client.release();
            } catch (Exception e) {
                logger.error(e.getMessage());
            } finally {
                client = null;
            }
        }
    }
}
