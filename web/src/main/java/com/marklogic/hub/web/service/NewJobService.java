package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.model.JobModel;
import com.marklogic.hub.web.model.JobModel.JobStep;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Service
public class NewJobService extends ResourceManager {

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private HubConfigImpl hubConfig;

    private static final String ML_JOBS_NAME = "ml:jobs";

    private DatabaseClient client;

    public static final String JOB_RESPONSE = "[{\n" +
        "  \"id\": \"cc99ba66-6a24-44cc-919d-b0ed59fe6f1b\",\n" +
        "  \"flowId\": \"default-ingest\",\n" +
        "  \"flowName\": \"default-ingest\",\n" +
        "  \"user\": \"admin\",\n" +
        "  \"status\": \"finished\",\n" +
        "  \"successfulEvents\": 1000,\n" +
        "  \"failedEvents\": 0,\n" +
        "  \"timeStarted\": \"2019-04-10T14:02:38.229156-07:00\",\n" +
        "  \"timeEnded\": \"2019-04-10T14:02:43.71327-07:00\",\n" +
        "  \"lastAttemptedStep\": \"default-mapping\",\n" +
        "  \"lastCompletedStep\": \"default-mapping\",\n" +
        "  \"steps\": [\n" +
        "    {\n" +
        "      \"stepNumber\": 1,\n" +
        "      \"id\": \"default-ingest\",\n" +
        "      \"name\": \"default-ingest\",\n" +
        "      \"stepDefinitionType\": \"INGESTION\",\n" +
        "      \"targetEntity\": null,\n" +
        "      \"status\": \"completed step 1\",\n" +
        "      \"totalEvents\": 500,\n" +
        "      \"successfulEvents\": 500,\n" +
        "      \"failedEvents\": 0,\n" +
        "      \"successfulBatches\": 4,\n" +
        "      \"failedBatches\": 0,\n" +
        "      \"success\": true,\n" +
        "      \"startTime\": \"2019-04-10T23:18:11.534917-07:00\",\n" +
        "      \"endTime\": \"2019-04-10T23:18:55.006918-07:00\",\n" +
        "      \"stepOutput\": \"test step output 1\",\n" +
        "      \"fullOutput\": \"test full output 1\"\n" +
        "    },\n" +
        "    {\n" +
        "      \"stepNumber\": 2,\n" +
        "      \"id\": \"default-mapping\",\n" +
        "      \"name\": \"default-mapping\",\n" +
        "      \"stepDefinitionType\": \"MAPPING\",\n" +
        "      \"targetEntity\": \"order\",\n" +
        "      \"status\": \"completed step 2\",\n" +
        "      \"totalEvents\": 500,\n" +
        "      \"successfulEvents\": 500,\n" +
        "      \"failedEvents\": 0,\n" +
        "      \"successfulBatches\": 4,\n" +
        "      \"failedBatches\": 0,\n" +
        "      \"success\": true,\n" +
        "      \"startTime\": \"2019-04-10T23:18:11.534917-07:00\",\n" +
        "      \"endTime\": \"2019-04-10T23:18:55.006918-07:00\",\n" +
        "      \"stepOutput\": \"test step output 2\",\n" +
        "      \"fullOutput\": \"test full output 2\"\n" +
        "    }\n" +
        "  ]\n" +
        "}]";

    public static final String JOB_DOC = "{\n" +
        "  \"job\": {\n" +
        "    \"jobId\": \"cc99ba66-6a24-44cc-919d-b0ed59fe6f1b\",\n" +
        "    \"flow\": \"default-ingest\",\n" +
        "    \"user\": \"admin\",\n" +
        "    \"lastAttemptedStep\": \"1\",\n" +
        "    \"lastCompletedStep\": \"2\",\n" +
        "    \"jobStatus\": \"finished\",\n" +
        "    \"timeStarted\": \"2019-04-10T14:02:38.229156-07:00\",\n" +
        "    \"timeEnded\": \"2019-04-10T14:02:43.71327-07:00\",\n" +
        "    \"stepResponses\": {\n" +
        "      \"1\": {\n" +
        "        \"stepOutput\": [\"test step 1 output row 1.\", \"test step 1 output row 2.\"],\n" +
        "        \"fullOutput\": \"test full output 1\",\n" +
        "        \"status\": \"completed step 1 with errors\",\n" +
        "        \"totalEvents\": 490,\n" +
        "        \"successfulEvents\": 490,\n" +
        "        \"failedEvents\": 10,\n" +
        "        \"successfulBatches\": 4,\n" +
        "        \"failedBatches\": 0,\n" +
        "        \"success\": false\n" +
        "      },\n" +
        "      \"2\": {\n" +
        "        \"stepOutput\": [\"test step 2 output row 1.\", \"test step 2 output row 2.\"],\n" +
        "        \"fullOutput\": \"test full output 2\",\n" +
        "        \"status\": \"completed step 2\",\n" +
        "        \"totalEvents\": 500,\n" +
        "        \"successfulEvents\": 500,\n" +
        "        \"failedEvents\": 0,\n" +
        "        \"successfulBatches\": 3,\n" +
        "        \"failedBatches\": 0,\n" +
        "        \"success\": true\n" +
        "      }\n" +
        "    }\n" +
        "  }\n" +
        "}";

    public NewJobService() {
        super();
    }

    public void setupClient() {
        this.client = hubConfig.newJobDbClient();
    }

    public List<JobModel> getJobs(String flowId) throws IOException {
        // temporarily send static job payload to client
        /*ObjectMapper mapper = new ObjectMapper();
        List<JobModel> jobModels = mapper.readValue(JOB_RESPONSE, List.class);*/

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

        client.init(ML_JOBS_NAME, this);

        RequestParameters params = new RequestParameters();
        if (StringUtils.isNotEmpty(flowName)) {
            params.add("flow-name", flowName);
        }
        if (StringUtils.isNotEmpty(jobId)) {
            params.add("jobid", jobId);
        }

        ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || !resultItr.hasNext()) {
            throw new RuntimeException("Unable to get job document");
        }
        ResourceServices.ServiceResult res = resultItr.next();
        JsonNode jsonNode = res.getContent(new JacksonHandle()).get();

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
            if (js.name.startsWith("default-")) {
                js.id = js.name;
            } else {
                js.id = step.getName() + "-" + js.stepDefinitionType;
            }
            Optional.ofNullable(step.getOptions()).ifPresent(o -> js.targetEntity = ((TextNode) o.getOrDefault("targetEntity", new TextNode(""))).asText());
            Optional.ofNullable(step.getOptions()).ifPresent(o -> js.targetDatabase = ((TextNode) o.getOrDefault("targetDatabase", new TextNode(""))).asText());

            JsonNode res = stepRes.get(key);
            js.totalEvents = res.get("totalEvents").asLong();
            js.successfulEvents = res.get("successfulEvents").asLong();
            js.failedEvents = res.get("failedEvents").asLong();

            counters[0] += js.successfulEvents;
            counters[1] += js.failedEvents;

            js.successfulBatches = res.get("successfulBatches").asLong();
            js.failedBatches = res.get("failedBatches").asLong();
            js.success = res.get("success").asBoolean();

            if (res.get("stepStartTime") != null) {
                js.startTime = res.get("stepStartTime").asText();
            }
            if (res.get("stepEndTime") != null) {
                js.endTime = res.get("stepEndTime").asText();
            }

            js.status = res.get("status").asText();
            js.stepOutput = res.get("stepOutput");
            js.fullOutput = res.get("fullOutput").asText();
            jm.stepModels.add(js);
        }

        jm.successfulEvents = counters[0];
        jm.failedEvents = counters[1];
    }

    public void release() {
        this.client.release();
    }

    public static void main(String[] args) throws Exception {
        //for test purpose
        JsonNode jsonNode = null;
        try {
            jsonNode = JSONObject.readInput(JOB_DOC);
        } catch (IOException e) {
        }
        List<JobModel> jobModels = new ArrayList<>();
        new NewJobService().createJobs(jobModels, new JSONObject(jsonNode.get("job")));

/*      FileOutputStream fileOutputStream = new FileOutputStream("/Users/hliu/tmp/test.json");
        JSONStreamWriter writer = new JSONStreamWriter(fileOutputStream);
        writer.write(jobModels);*/
    }
}
