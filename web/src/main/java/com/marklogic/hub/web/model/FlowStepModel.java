package com.marklogic.hub.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;
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
        public String id;
        public String name;
        public String type;
        public String targetEntity;
    }

    @JsonProperty("steps")
    private List<StepSummary> stepModels = new ArrayList<>();

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
            String type = existingSteps.get(key).getType().toString();
            keyById.put(name + "-" + type, key);
        }
        final String[] count = {"1"};
        steps.forEach(s -> {
            JSONObject stepJson = new JSONObject((JsonNode) s);
            //String id = stepJson.getString("id");
            String stepName = stepJson.getString("name");
            String stepType = stepJson.getString("type");
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
            String stepType = step.getType() == null ? "" : step.getType().toString();
            sm.id = step.getName() + "-" + stepType;
            sm.name = step.getName();
            sm.type = stepType;
            if (step.getOptions() != null && step.getOptions().get("targetEntity") != null) {
                sm.targetEntity = ((TextNode) step.getOptions().get("targetEntity")).asText();
            }
            stepModels.add(sm);
        });
        return fsm;
    }
}
