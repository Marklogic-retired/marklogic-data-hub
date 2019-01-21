package com.marklogic.hub.processes;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.error.DataHubProjectException;

public class ProcessImpl implements Process {

    private String processName;
    private ProcessType processType;

    public String getProcessName() {
        return processName;
    }

    public void setProcessName(String processName) {
        this.processName = processName;
    }

    public ProcessType getProcessType() {
        return processType;
    }

    public void setProcessType(ProcessType processType) {
        this.processType = processType;
    }

    @Override
    public String serialize() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsString(this);
        }
        catch (JsonProcessingException e) {
            throw new DataHubProjectException("Unable to serialize processes object.");
        }
    }

    @Override
    public Process deserialize(JsonNode json) {
        if (json.has("name")) {
            setProcessName(json.get("name").asText());
        }

        if (json.has("type")) {
            setProcessType(ProcessType.getProcessType(json.get("type").asText()));
        }

        return this;
    }
}
