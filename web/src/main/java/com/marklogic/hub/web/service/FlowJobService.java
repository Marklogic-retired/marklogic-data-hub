/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.web.service;

import static com.marklogic.hub.job.JobStatus.RUNNING_PREFIX;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.util.metrics.tracer.JaegerConfig;
import com.marklogic.hub.web.model.FlowJobModel.FlowJobs;
import com.marklogic.hub.web.model.FlowJobModel.LatestJob;
import io.opentracing.Scope;
import io.opentracing.Span;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import javax.annotation.PreDestroy;
import javax.xml.bind.DatatypeConverter;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FlowJobService extends ResourceManager {
    private static final String ML_JOBS_NAME = "ml:jobs";

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private FlowRunnerImpl flowRunner;

    @Autowired
    private HubConfigImpl hubConfig;

    private DatabaseClient client;

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
        client.init(ML_JOBS_NAME, this);
    }

    @PreDestroy
    public void destroy() {
        logger.info("release the job database client.");
        this.release();
    }

    public FlowJobs getJobs(Flow flow, boolean forceRefresh, Span parentSpan) {
        String flowName = flow.getName();
        if (forceRefresh) {
            FlowJobs flowJobs = retrieveJobsByFlowName(flow, parentSpan);
            cachedJobsByFlowName.put(flowName, flowJobs);
            return flowJobs;
        }

        Span span = JaegerConfig.buildSpanFromMethod(new Object() {}, parentSpan)
            .withTag("flowName", flowName)
            .start();

        try (Scope ignored = JaegerConfig.activate(span)) {
            return cachedJobsByFlowName.get(flowName, () -> retrieveJobsByFlowName(flow, span));
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

    private FlowJobs retrieveJobsByFlowName(Flow flow, Span parentSpan) {
        String flowName = flow.getName();
        Span span = JaegerConfig.buildSpanFromMethod(new Object() {
        }, parentSpan)
            .withTag("flowName", flowName)
            .start();

        JsonNode jsonNode;
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
        Span span2 = JaegerConfig.buildSpanFromMethod(new Object() {
        }, parentSpan)
            .withTag("flowName", flowName)
            .start();

        ServiceResultIterator resultItr;
        try (Scope ignored = JaegerConfig.activate(span2)) {
            span2.setTag("getJobCall", true);
            RequestParameters params = new RequestParameters();
            if (StringUtils.isNotEmpty(flowName)) {
                params.add("flow-name", flowName);
            }

            resultItr = this.getServices().get(params);
            if (resultItr == null || !resultItr.hasNext()) {
                throw new RuntimeException("No jobs found for flow with name: " + flowName);
            }
        } finally {
            span2.finish();
        }

        Span span3 = JaegerConfig.buildSpanFromMethod(new Object() {
        }, parentSpan)
            .withTag("flowName", flowName)
            .start();

        try (Scope ignored = JaegerConfig.activate(span3)) {
            span3.setTag("getContent", true);
            ServiceResult res = resultItr.next();
            jsonNode = res.getContent(new JacksonHandle()).get();
        } finally {
            span3.finish();
        }

        return retrieveJobsByFlowName(flow, jsonNode);
    }

    private FlowJobs retrieveJobsByFlowName(Flow flow, JsonNode jsonNode) {
        Map<String, Step> steps = flow.getSteps();
        List<String> jobs = new ArrayList<>();
        LatestJob latestJob = new LatestJob();
        FlowJobs flowJobs = new FlowJobs(jobs, latestJob);

        final JsonNode[] lastJob = {null};
        final String[] lastTime = {null, null}; //store last start and end time
        List<String> staleStateJobIds = new ArrayList<>();
        if (jsonNode.isArray()) {
            jsonNode.forEach(job -> {
                JSONObject jobJson = new JSONObject(job.get("job"));
                String jobId = jobJson.getString("jobId");
                String jobStatus = jobJson.getString("jobStatus");
                jobs.add(jobId);
                String currStartTime = jobJson.getString("timeStarted", "");
                String currEndTime = jobJson.getString("timeEnded", "");

                if (cachedJobsByFlowName.size() == 0 && flowRunner.getRunningFlow() == null) {
                    if (StringUtils.isNotEmpty(jobStatus) && jobStatus.startsWith(RUNNING_PREFIX)) {
                        //invalid state on the job database that may be caused by unexpected server shutdown or crashed
                        staleStateJobIds.add(jobId);
                        latestJob.status = JobStatus.FAILED.toString();
                    }
                }

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

        latestJob.id = jobJson.getString("jobId");
        latestJob.startTime = jobJson.getString("timeStarted", "");
        latestJob.endTime = jobJson.getString("timeEnded", "");
        if ("N/A".equals(latestJob.endTime)) {
            latestJob.endTime = "";
        }

        if (!staleStateJobIds.contains(latestJob.id)) {
            latestJob.status = jobJson.getString("jobStatus");
        }

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

        if (!staleStateJobIds.isEmpty()) {
            updateJobStaleStates(staleStateJobIds);
        }

        return flowJobs;
    }

    /**
     * Set the jobStatus as Failed and timeEnded due to server failure during flow running
     * @param staleStateJobIds
     */
    private void updateJobStaleStates(List<String> staleStateJobIds) {
        RequestParameters params = new RequestParameters();
        for (String jobId : staleStateJobIds) {
            params.add("jobid", jobId);
            params.add("status", JobStatus.FAILED.toString());

            try {
                this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
            } catch (Exception e) {
                logger.error(jobId + ":" + e.getMessage());
            }
        }
    }

    private void release() {
        if (client != null) {
            try {
                client.release();
            }
            catch (Exception e) {
                logger.error(e.getMessage());
            }
            finally {
                client = null;
            }
        }
    }
}
