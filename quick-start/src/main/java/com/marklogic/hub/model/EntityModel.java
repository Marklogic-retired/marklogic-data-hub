package com.marklogic.hub.model;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EntityModel {

    private String entityName;
	private List<FlowModel> inputFlows;
	private List<FlowModel> conformFlows;
	private boolean isSynched;
	private RestModel inputRest;
	private RestModel conformRest;

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

	public List<FlowModel> getConformFlows() {
		return conformFlows;
	}
	
	public Map<String, FlowModel> getConformFlowsAsMap() {
	    Map<String, FlowModel> flowModels = new HashMap<>();
	    
	    if (conformFlows != null) {
	        for (FlowModel model : conformFlows) {
	            flowModels.put(model.getFlowName(), model);
	        }
	    }
	    
	    return flowModels;
	}

	public void setConformFlows(List<FlowModel> conformFlows) {
		this.conformFlows = conformFlows;
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
	
	public void setConformFlowsSynched(boolean synched) {
        if (conformFlows != null) {
            for (FlowModel model : conformFlows) {
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

    public RestModel getConformRest() {
        return conformRest;
    }

    public void setConformRest(RestModel conformRest) {
        this.conformRest = conformRest;
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
