package com.marklogic.hub.model;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EntityModel {

    private String entityName;
    private List<FlowModel> inputFlows;
    private List<FlowModel> harmonizeFlows;
    private boolean isSynched;
    private RestModel inputRest;
    private RestModel harmonizeRest;

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public List<FlowModel> getInputFlows() {
        return inputFlows;
    }

    public Map<String, FlowModel> getInputFlowsAsMap() {
        Map<String, FlowModel> flowModels = new HashMap<>();

        if (inputFlows != null) {
            for (FlowModel model : inputFlows) {
                flowModels.put(model.getFlowName(), model);
            }
        }

        return flowModels;
    }

    public void setInputFlows(List<FlowModel> inputFlows) {
        this.inputFlows = inputFlows;
    }

    public List<FlowModel> getHarmonizeFlows() {
        return harmonizeFlows;
    }

    public Map<String, FlowModel> getHarmonizeFlowsAsMap() {
     Map<String, FlowModel> flowModels = new HashMap<>();

        if (harmonizeFlows != null) {
            for (FlowModel model : harmonizeFlows) {
                flowModels.put(model.getFlowName(), model);
            }
        }

        return flowModels;
    }

    public void setHarmonizeFlows(List<FlowModel> harmonizeFlows) {
        this.harmonizeFlows = harmonizeFlows;
    }

    public boolean isSynched() {
        return isSynched;
    }

    public void setSynched(boolean isSynched) {
        this.isSynched = isSynched;
    }

    public void setInputFlowsSynched(boolean synched) {
        if (inputFlows != null) {
            for (FlowModel model : inputFlows) {
                model.setSynched(synched);
            }
        }
    }

    public void setHarmonizeFlowsSynched(boolean synched) {
        if (harmonizeFlows != null) {
            for (FlowModel model : harmonizeFlows) {
                model.setSynched(synched);
            }
        }
    }

    public RestModel getInputRest() {
        return inputRest;
    }

    public void setInputRest(RestModel inputRest) {
        this.inputRest = inputRest;
    }

    public RestModel getHarmonizeRest() {
        return harmonizeRest;
    }

    public void setHarmonizeRest(RestModel harmonizeRest) {
        this.harmonizeRest = harmonizeRest;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("entityName=");
        sb.append(entityName);
        sb.append("isSynched=");
        sb.append(isSynched);
        sb.append("}");

        return sb.toString();
    }
}
