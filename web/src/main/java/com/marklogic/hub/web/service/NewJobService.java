package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.job.JobDocManager;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.model.JobModel;
import com.marklogic.hub.web.model.JobModel.JobStep;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class NewJobService {

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private HubConfigImpl hubConfig;

    private DatabaseClient client;
    private JobDocManager jobDocManager;

    public void setupClient() {
        this.client = hubConfig.newJobDbClient();
        this.jobDocManager = new JobDocManager(client);
    }

    public List<JobModel> getJobs(String flowId) {
        if (StringUtils.isNotEmpty(flowId)) {
            return getJobs(flowId, null);
        }
        List<String> flowNames = flowManager.getFlowNames();
        List<JobModel> jobModels = new ArrayList<>();
        flowNames.forEach(f -> jobModels.addAll(getJobs(f, null)));
        return jobModels;
    }

    public List<JobModel> getJobs(String flowName, String jobId) {
        List<JobModel> jobModels = new ArrayList<>();

        JsonNode jsonNode = jobDocManager.getJobDocument(jobId, flowName);
        if (jsonNode == null) {
            throw new RuntimeException("Unable to get job document");
        }

        if (jsonNode.size() == 0) {
            return jobModels;
        }

        if (jsonNode.isArray()) {
            jsonNode.forEach(e -> {
                JSONObject jobJson = new JSONObject(e.get("job"));
                this.createJobs(jobModels, jobJson);
            });
        } else if (jsonNode.has("job")) {
            JSONObject jobJson = new JSONObject(jsonNode.get("job"));
            this.createJobs(jobModels, jobJson);

        }
        return jobModels;
    }

    private void createJobs(List<JobModel> jobModels, JSONObject jobJson) {
        JobModel jm = new JobModel();
        String flowName = jobJson.getString("flow");
        if (StringUtils.isEmpty(flowName)) {
            return;
        }
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null) {
            return;
        }

        jobModels.add(jm);
        jm.id = jobJson.getString("jobId");
        jm.flowId = jobJson.getString("flow");
        jm.flowName = flowName;
        jm.user = jobJson.getString("user", "");
        jm.status = jobJson.getString("jobStatus", "");

        Map<String, Step> steps = flow.getSteps();
        jm.startTime = jobJson.getString("timeStarted", "");
        jm.endTime = jobJson.getString("timeEnded", "");

        Optional.ofNullable(steps.get(jobJson.getString("lastAttemptedStep", null))).ifPresent(s -> jm.lastAttemptedStep = s.getName());
        Optional.ofNullable(steps.get(jobJson.getString("lastCompletedStep", null))).ifPresent(s -> jm.lastCompletedStep = s.getName());

        jm.stepModels = new ArrayList<>();
        JsonNode stepRes = jobJson.getNode("stepResponses");
        int[] counters = new int[2];
        Iterator<String> iterator = stepRes.fieldNames();

        while (iterator.hasNext()) {
            String key = iterator.next();
            Step step = steps.get(key);
            if (step == null) {
                continue;
            }
            JobStep js = new JobStep();
            js.stepNumber = Integer.valueOf(key);
            js.name = step.getName();
            js.stepDefinitionName = step.getStepDefinitionName();
            js.stepDefinitionType = step.getStepDefinitionType().toString();
            js.id = step.getName() + "-" + js.stepDefinitionType;
            Optional.ofNullable(step.getOptions()).ifPresent(o -> js.targetEntity = ((TextNode) o.getOrDefault("targetEntity", new TextNode(""))).asText());
            Optional.ofNullable(step.getOptions()).ifPresent(o -> js.targetDatabase = ((TextNode) o.getOrDefault("targetDatabase", new TextNode(""))).asText());

            JsonNode res = stepRes.get(key);
            js.totalEvents = getLong(res,"totalEvents");
            js.successfulEvents = getLong(res, "successfulEvents");
            js.failedEvents = getLong(res,"failedEvents");

            counters[0] += js.successfulEvents;
            counters[1] += js.failedEvents;

            js.successfulBatches = getLong(res, "successfulBatches");
            js.failedBatches = getLong(res, "failedBatches");
            js.success = res.has("success") ? res.get("success").asBoolean() : false;

            if (res.get("stepStartTime") != null) {
                js.startTime = res.get("stepStartTime").asText();
            }
            if (res.get("stepEndTime") != null) {
                js.endTime = res.get("stepEndTime").asText();
            }

            js.status = res.get("status") != null ? res.get("status").asText() : null;
            js.stepOutput = res.get("stepOutput");
            js.fullOutput = res.get("fullOutput") != null ? res.get("fullOutput").asText() : null;
            jm.stepModels.add(js);
        }

        jm.successfulEvents = counters[0];
        jm.failedEvents = counters[1];
    }

    private long getLong(JsonNode node, String propertyName) {
        if (node.has(propertyName)) {
            return node.get(propertyName).asLong();
        }
        return 0;
    }

    public void release() {
        this.client.release();
    }
}
