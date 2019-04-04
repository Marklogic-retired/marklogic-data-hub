package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.model.JobModel;
import com.marklogic.hub.web.model.JobModel.JobStep;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NewJobService extends ResourceManager {

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private HubConfigImpl hubConfig;

    private static final String ML_JOBS_NAME = "ml:jobs";
    private static final String ML_BATCH_JOBS_NAME = "ml:batches";

    private DatabaseClient client;

    public static final String JOB_RESPONSE = "[{\"jobId\":\"mlcp-9470895870962932699\",\"name\":\"default-ingest\",\"targetEntity\":null,\"user\":\"admin\",\"lastAttemptedStep\":\"1\",\"lastCompletedStep\":\"1\",\"status\":\"started\",\"startTime\":\"2019-04-04T09:46:52.251894-07:00\",\"endTime\":\"N/A\",\"successfulEvents\":1500,\"failedEvents\":0,\"steps\":[{\"stepNumber\":1,\"type\":\"ingest\",\"name\":\"default-ingest\",\"id\":\"default-ingest-ingest\",\"identifier\":\"\",\"retryLimit\":0,\"options\":{\"outputFormat\":\"json\",\"collections\":\"defaultIngest\"},\"status\":\"finished\",\"startTime\":\"2019-04-04T09:46:53.533499-07:00\",\"endTime\":\"N/A\",\"successfulEvents\":500,\"failedEvents\":0}]},{\"jobId\":\"mlcp-1279385296604171265\",\"name\":\"default-ingest\",\"targetEntity\":null,\"user\":\"admin\",\"lastAttemptedStep\":\"1\",\"lastCompletedStep\":\"1\",\"status\":\"started\",\"startTime\":\"2019-04-04T09:46:52.25187-07:00\",\"endTime\":\"N/A\",\"successfulEvents\":1500,\"failedEvents\":0,\"steps\":[{\"stepNumber\":1,\"type\":\"ingest\",\"name\":\"default-ingest\",\"id\":\"default-ingest-ingest\",\"identifier\":\"\",\"retryLimit\":0,\"options\":{\"outputFormat\":\"json\",\"collections\":\"defaultIngest\"},\"status\":\"finished\",\"startTime\":\"2019-04-04T09:46:54.642311-07:00\",\"endTime\":\"N/A\",\"successfulEvents\":500,\"failedEvents\":0}]},{\"jobId\":\"mlcp-5324458065738606353\",\"name\":\"default-ingest\",\"targetEntity\":null,\"user\":\"admin\",\"lastAttemptedStep\":\"1\",\"lastCompletedStep\":\"1\",\"status\":\"started\",\"startTime\":\"2019-04-04T09:46:52.251887-07:00\",\"endTime\":\"N/A\",\"successfulEvents\":1436,\"failedEvents\":0,\"steps\":[{\"stepNumber\":1,\"type\":\"ingest\",\"name\":\"default-ingest\",\"id\":\"default-ingest-ingest\",\"identifier\":\"\",\"retryLimit\":0,\"options\":{\"outputFormat\":\"json\",\"collections\":\"defaultIngest\"},\"status\":\"finished\",\"startTime\":\"2019-04-04T09:46:53.572159-07:00\",\"endTime\":\"N/A\",\"successfulEvents\":484,\"failedEvents\":0}]},{\"jobId\":\"mlcp-69009966989703419\",\"name\":\"default-ingest\",\"targetEntity\":null,\"user\":\"admin\",\"lastAttemptedStep\":\"1\",\"lastCompletedStep\":\"1\",\"status\":\"started\",\"startTime\":\"2019-04-04T09:46:52.251868-07:00\",\"endTime\":\"N/A\",\"successfulEvents\":1000,\"failedEvents\":0,\"steps\":[{\"stepNumber\":1,\"type\":\"ingest\",\"name\":\"default-ingest\",\"id\":\"default-ingest-ingest\",\"identifier\":\"\",\"retryLimit\":0,\"options\":{\"outputFormat\":\"json\",\"collections\":\"defaultIngest\"},\"status\":\"finished\",\"startTime\":\"2019-04-04T09:46:54.121363-07:00\",\"endTime\":\"N/A\",\"successfulEvents\":400,\"failedEvents\":0}]}]";

    public NewJobService() {
        super();
    }

    public void setupClient() {
        this.client = hubConfig.newJobDbClient();
    }

    public List<JobModel> getJobs() throws IOException {
        // temporarily send static job payload to client
        ObjectMapper mapper = new ObjectMapper();
        List<JobModel> jobModels = mapper.readValue(JOB_RESPONSE, List.class);

        /*List<String> flowNames = flowManager.getFlowNames();
        List<JobModel> jobModels = new ArrayList<>();
        flowNames.forEach(f -> jobModels.addAll(getJobs(f, null))); */
        return jobModels;
    }

    public List<JobModel> getJobs(String jobId) {
        return getJobs(null, jobId);
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

        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            throw new RuntimeException("Unable to get job document");
        }
        ServiceResult res = resultItr.next();
        JsonNode jsonNode = res.getContent(new JacksonHandle()).get();

        if (jsonNode.size() == 0) {
            return jobModels;
        }

        client.init(ML_BATCH_JOBS_NAME, this);
        RequestParameters batchParams = new RequestParameters();

        if (jsonNode.isArray()) {
            jsonNode.forEach(e -> {
                JSONObject jobJson = new JSONObject(e.get("job"));
                this.createJobs(jobModels, jobJson, batchParams);
            });
        } else if (jsonNode.has("job")) {
            JSONObject jobJson = new JSONObject(jsonNode.get("job"));
            this.createJobs(jobModels, jobJson, batchParams);

        }
        return jobModels;
    }

    private void createJobs(List<JobModel> jobModels, JSONObject jobJson, RequestParameters batchParams) {
        JobModel jm = new JobModel();
        jobModels.add(jm);
        jm.jobId = jobJson.getString("jobId");
        jm.name = jobJson.getString("flow");
        Flow flow = flowManager.getFlow(jm.name);
        Map<String, Step> steps = flow.getSteps();
        jm.startTime = jobJson.getString("timeStarted", "");
        jm.endTime = jobJson.getString("timeEnded", "");
        jm.status = jobJson.getString("jobStatus", "");
        jm.user = jobJson.getString("user", "");
        jm.lastAttemptedStep = jobJson.getString("lastCompletedStep", "");
        jm.lastCompletedStep = jobJson.getString("lastCompletedStep", "");
        String stepKey = StringUtils.isNotEmpty(jm.lastCompletedStep) ? jm.lastCompletedStep : jm.lastAttemptedStep;
        Step step = steps.get(stepKey);
        if (step.getOptions() != null && step.getOptions().get("targetEntity") != null) {
            jm.targetEntity = ((TextNode) step.getOptions().get("targetEntity")).asText();
        }

        jm.stepModels = new ArrayList<>();
        batchParams.put("jobid", jm.jobId);

        ServiceResultIterator resultItr = this.getServices().get(batchParams);
        if (resultItr == null || ! resultItr.hasNext()) {
            throw new RuntimeException("Unable to get batch document");
        }
        ServiceResult res = resultItr.next();
        JsonNode jsonNode = res.getContent(new JacksonHandle()).get();
        if (jsonNode.size() == 0) {
            return;
        }

        if (jsonNode.isArray()) {
            final boolean[] first = {true};
            JobStep js = new JobStep();
            jsonNode.forEach(c -> {
                JSONObject batchJson = new JSONObject(c.get("batch"));
                if (first[0]) {
                    js.stepNumber = batchJson.getInt("stepNumber", 1);
                    js.status = batchJson.getString("batchStatus", "");
                    js.startTime = batchJson.getString("timeStarted", "");
                    js.endTime = jobJson.getString("timeEnded", "");
                    JsonNode stepNode = batchJson.getNode("step");
                    js.type = stepNode.get("type").asText();
                    js.name = stepNode.get("name").asText();
                    js.id = js.name + "-" + js.type;
                    js.identifier = stepNode.get("identifier") != null ? stepNode.get("identifier").asText() : "";
                    js.retryLimit = stepNode.get("retryLimit") != null ? stepNode.get("retryLimit").asInt(0) : 0;
                    js.options = stepNode.get("options");

                    first[0] =!first[0];
                }
                js.successfulEvents += batchJson.getLong("successfulEvents", 0);
                js.failedEvents += batchJson.getLong("failedEvents", 0);

                jm.successfulEvents += js.successfulEvents;
                jm.failedEvents += js.failedEvents;
            });
            jm.stepModels.add(js);
        }
    }

    public void release() {
        this.client.release();
    }
}
