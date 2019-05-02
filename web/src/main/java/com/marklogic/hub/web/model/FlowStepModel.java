package com.marklogic.hub.web.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.model.FlowJobModel.FlowJobs;
import com.marklogic.hub.web.model.FlowJobModel.LatestJob;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Paths;
import java.util.*;

public class FlowStepModel {
    private String id;
    private String name;
    private String description;
    private int batchSize;
    private int threadCount;
    private boolean stopOnError;
    private JsonNode options;

    static class StepSummary {
        @JsonIgnore
        public String stepKey;
        public String id;
        public String name;
        public String stepDefinitionType;
        public String targetEntity;
    }

    @JsonProperty("steps")
    private List<StepSummary> stepModels = new ArrayList<>();
    @JsonProperty("jobs")
    public List<String> jobIds;
    @JsonProperty("latestJob")
    public LatestJob latestJob;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(int batchSize) {
        this.batchSize = batchSize;
    }

    public int getThreadCount() {
        return threadCount;
    }

    public void setThreadCount(int threadCount) {
        this.threadCount = threadCount;
    }

    public boolean isStopOnError() {
        return stopOnError;
    }

    public void setStopOnError(boolean stopOnError) {
        this.stopOnError = stopOnError;
    }

    public JsonNode getOptions() {
        return options;
    }

    public void setOptions(JsonNode options) {
        this.options = options;
    }

    public List<StepSummary> getStepModels() {
        return stepModels;
    }

    public void setStepModels(List<StepSummary> stepModels) {
        this.stepModels = stepModels;
    }

    public static void createFlowSteps(Flow flow, JSONObject jsonObject) {
        flow.setDescription(jsonObject.getString("description"));
        flow.setBatchSize(jsonObject.getInt("batchSize", FlowImpl.DEFAULT_BATCH_SIZE));
        flow.setThreadCount(jsonObject.getInt("threadCount", FlowImpl.DEFAULT_THREAD_COUNT));
        flow.setOptions(jsonObject.getNode("options"));
        flow.setStopOnError(jsonObject.getBoolean("stopOnError", FlowImpl.DEFAULT_STOP_ONERROR));
        flow.setVersion(jsonObject.getInt("version", 1));

        Map<String, Step> stepMaps = new LinkedHashMap<>();
        if (!jsonObject.isExist("steps")) {
            return;
        }
        List<Object> steps = jsonObject.getArray("steps");
        Map<String, Step> existingSteps = flow.getSteps();

        Map<String, String> keyById = new HashMap<>();
        for (String key : existingSteps.keySet()) {
            String name = existingSteps.get(key).getName();
            String type = existingSteps.get(key).getStepDefinitionType().toString();
            keyById.put(name + "-" + type, key);
        }
        final String[] count = {"1"};
        steps.forEach(s -> {
            JSONObject stepJson = new JSONObject((JsonNode) s);
            //String id = stepJson.getString("id");
            String stepName = stepJson.getString("name");
            String stepType = stepJson.getString("stepDefinitionType");
            String stepKey = stepName + "-" + stepType;
            Step step;
            if (keyById.containsKey(stepKey)) {
                step = existingSteps.get(keyById.get(stepKey));
                stepMaps.put(count[0], step);
                count[0] = String.valueOf(Integer.valueOf(count[0]) + 1);
            }
        });
        flow.setSteps(stepMaps);
    }

    public static FlowStepModel transformFromFlow(Flow flow) {
        FlowStepModel fsm = new FlowStepModel();
        fsm.id = flow.getName();
        fsm.name = flow.getName();
        fsm.description = flow.getDescription();
        fsm.batchSize = flow.getBatchSize();
        fsm.threadCount = flow.getThreadCount();
        fsm.stopOnError = flow.isStopOnError();
        fsm.options = flow.getOptions();
        Map<String, Step> steps = flow.getSteps();
        List<StepSummary> stepModels = new ArrayList<>();
        fsm.setStepModels(stepModels);

        steps.forEach((name, step) -> {
            StepSummary sm = new StepSummary();
            String stepName = step.getName() == null ? step.getStepDefinitionName() : step.getName();
            String stepType = step.getStepDefinitionType() == null ? "" : step.getStepDefinitionType().toString();
            sm.id = step.getName() + "-" + stepType;
            sm.stepKey = name;
            sm.name = stepName;
            if (sm.name.startsWith("default-")) {
                sm.id = sm.name;
            } else {
                sm.id = sm.name + "-" + stepType;
            }
            sm.stepDefinitionType = stepType;
            if (step.getOptions() != null && step.getOptions().get("targetEntity") != null &&
                                                step.getOptions().get("targetEntity") instanceof TextNode) {
                TextNode node = (TextNode) step.getOptions().get("targetEntity");
                sm.targetEntity = node.asText();
            }
            stepModels.add(sm);
        });
        return fsm;
    }

    public void setLatestJob(LatestJob latestJob) {
        this.latestJob = latestJob;
    }

    public void setJobs(FlowJobs flowJobs, boolean fromRunFlow) {
        this.jobIds = flowJobs.jobIds;
        if (latestJob != null && latestJob.id != null && !this.jobIds.contains(latestJob.id)) {
            this.jobIds.add(latestJob.id);
            flowJobs.jobIds = this.jobIds;
            flowJobs.latestJob = latestJob;
            return;
        }
        if (fromRunFlow) {
            //reset the latestJob info for until the running flow starts with a new jobId
            flowJobs.latestJob = null;
        }
        this.latestJob = flowJobs.latestJob;
    }

    //for testing purpose
    public static void main(String[] args) throws Exception {
        PrintWriter pw = null;
        String outputPath = "/Users/hliu/marklogic/hub5/input/orders/json/";
        File file = Paths.get(outputPath).toFile();
        if (file.exists()) {
            try {
                FileUtils.forceDelete(file);
            } catch (IOException e){
                throw new RuntimeException(e);
            }
        }
        file.mkdir();

        JSONObject json = new JSONObject();
        Random rnd = new Random();
        ObjectMapper mapper = new ObjectMapper();
        for (int i = 1001; i <= 2000; i++) {
            String fileName = outputPath + i + ".json";
            pw = new PrintWriter(new FileWriter(fileName));
            json.put("id", String.valueOf(i));
            json.put("customer", String.valueOf(rnd.nextInt(1000) + 1000));
            json.put("order_date", "04/12/2019");
            json.put("ship_date", "04/13/2019");
            json.put("product_id", rnd.nextInt(1000) + 1000);
            json.put("sku", rnd.nextInt(100000) + 100000);
            json.put("price", 10.25);
            json.put("quantity", 10);
            json.put("discounted_price", 8.50);
            json.put("title", i);
            json.put("description", i + " description");

            mapper.writerWithDefaultPrettyPrinter().writeValue(pw, json.jsonNode());
        }

        pw.close();
    }
}
