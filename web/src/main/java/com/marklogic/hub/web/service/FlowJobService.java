package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.model.FlowJobModel.FlowJobs;
import com.marklogic.hub.web.model.FlowJobModel.LatestJob;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import javax.xml.bind.DatatypeConverter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FlowJobService extends ResourceManager {
    private static final String ML_JOBS_NAME = "ml:jobs";

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private HubConfigImpl hubConfig;

    private DatabaseClient client;

    //use a cache with ttl 30 minutes or longer to reduce frequency for fetching data from DB
    public final Cache<String, FlowJobs> cachedJobsByFlowName = CacheBuilder.newBuilder().expireAfterWrite(
        30, TimeUnit.MINUTES).build();

    public FlowJobService() {
        super();
    }

    public void setupClient() {
        this.client = hubConfig.newJobDbClient();
    }

    public FlowJobs getJobs(String flowName) {
        try {
            return cachedJobsByFlowName.get(flowName, () -> {
                client.init(ML_JOBS_NAME, this);
                RequestParameters params = new RequestParameters();
                if (StringUtils.isNotEmpty(flowName)) {
                    params.add("flow-name", flowName);
                }

                ServiceResultIterator resultItr = this.getServices().get(params);
                if (resultItr == null || !resultItr.hasNext()) {
                    throw new RuntimeException("Unable to get job document");
                }
                ServiceResult res = resultItr.next();
                JsonNode jsonNode = res.getContent(new JacksonHandle()).get();

                Flow flow = flowManager.getFlow(flowName);
                Map<String, Step> steps = flow.getSteps();

                List<String> jobs = new ArrayList<>();
                LatestJob latestJob = new LatestJob();
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
                                //ignore, maybe log
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
                latestJob.status = jobJson.getString("jobStatus");

                String completedKey = jobJson.getString("lastCompletedStep", "0");
                String attemptedKey = jobJson.getString("lastAttemptedStep", "0");
                String stepKey = Integer.compare(Integer.valueOf(completedKey), Integer.valueOf(attemptedKey)) < 0 ? attemptedKey : completedKey;
                Optional.ofNullable(steps.get(stepKey)).ifPresent(s -> {
                    latestJob.stepName = s.getName();
                    latestJob.stepId = s.getName().startsWith("default-") ? s.getName() : s.getName() + "-" + s.getStepDefinitionType();
                });

                JsonNode stepRes = jobJson.getNode("stepResponses");

                if (stepRes != null) {
                    stepRes.forEach(s -> {
                        latestJob.successfulEvents += s.get("successfulEvents").asLong();
                        latestJob.failedEvents += s.get("failedEvents").asLong();
                        latestJob.output = s.get("stepOutput"); //last step output ?
                    });
                }

                return flowJobs;
            });
        } catch (Exception e) {

        } finally {
            if (cachedJobsByFlowName.getIfPresent(flowName) == null) {
                cachedJobsByFlowName.invalidate(flowName);
            }
        }
        return cachedJobsByFlowName.getIfPresent(flowName);
    }

    public void release() {
        this.client.release();
    }
}
