package com.marklogic.hub.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.exception.DataHubException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class FlowStepModel {
    private String name;
    private String id;
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

    public static Flow createFlowFromJSON(String json) {
        Flow fsm = new FlowImpl();

        JSONObject jsonObject = null;
        try {
            jsonObject = new JSONObject(json);
        } catch (IOException e) {
            throw new DataHubException("Unable to parse flow json string : "+ e.getMessage());
        }
        fsm.setName(jsonObject.getString("name"));
        fsm.setDescription(jsonObject.getString("description"));
        fsm.setId(jsonObject.getString("id", fsm.getName()));
        fsm.setBatchSize(jsonObject.getInt("batchSize", FlowImpl.DEFAULT_BATCH_SIZE));
        fsm.setThreadCount(jsonObject.getInt("threadCount", FlowImpl.DEFAULT_THREAD_COUNT));
        fsm.setOptions(jsonObject.getNode("options"));
        fsm.setStopOnError(jsonObject.getBoolean("stopOnError", FlowImpl.DEFAULT_STOP_ONERROR));
        
        List<Object> steps = jsonObject.getArray("steps");
        Map<String, Step> stepMaps = new LinkedHashMap<>();
        final String[] count = {"1"};
        steps.forEach(s -> {
            JSONObject stepJson = new JSONObject((JsonNode) s);
            String stepName = stepJson.getString("name");
            Step.StepType stepType = Step.StepType.getStepType(stepJson.getString("type"));
            Step step = Step.create(stepName, stepType);
            step.setName(stepName);
            step.setType(stepType);
            step.setVersion(stepJson.getInt("version"));
            Map<String, Object> options = stepJson.getMap("options");
            if (!options.isEmpty()) {
                step.setOptions(stepJson.getMap("options"));
            }
            step.setCustomHook(stepJson.getNode("customHook"));
            step.setModulePath(stepJson.getString("modulePath"));
            step.setIdentifier(stepJson.getString("identifier"));
            step.setRetryLimit(stepJson.getInt("retryLimit"));
            step.setBatchSize(stepJson.getInt("batchSize"));
            step.setThreadCount(stepJson.getInt("threadCount"));
            step.setSourceDatabase(stepJson.getString("sourceDatabase"));
            step.setDestinationDatabase(stepJson.getString("destinationDatabase"));
            stepMaps.put(count[0], step);
            count[0] = String.valueOf(Integer.valueOf(count[0]) + 1);
        });
        fsm.setSteps(stepMaps);
        return fsm;
    }

    public static FlowStepModel transformFromFlow(Flow flow) {
        FlowStepModel fsm = new FlowStepModel();
        fsm.id = flow.getId();
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
            sm.id = step.getName() + "-" + step.getType();
            sm.name = step.getName();
            sm.type = step.getType().toString();
            if (step.getOptions() != null && step.getOptions().get("targetEntity") != null) {
                sm.targetEntity = (String) step.getOptions().get("targetEntity").toString();
            }
            stepModels.add(sm);
        });
        return fsm;
    }
}
