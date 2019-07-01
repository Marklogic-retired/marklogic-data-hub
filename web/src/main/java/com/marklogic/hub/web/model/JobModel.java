package com.marklogic.hub.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;

@JsonPropertyOrder({"id", "flowId", "flowName", "user", "status", "successfulEvents", "failedEvents", "startTime", "endTime", "lastAttemptedStep", "lastCompletedStep"})
public class JobModel {
    public String id;
    public String flowId;
    public String flowName;
    public String user;
    public String status;
    public long successfulEvents;
    public long failedEvents;
    public String startTime;
    public String endTime;
    public String lastAttemptedStep;
    public String lastCompletedStep;

    public static class JobStep {
        public int stepNumber;
        public String id;
        public String name;
        public String stepDefinitionName;
        public String stepDefinitionType;
        public String targetDatabase;
        public String targetEntity;
        public String status;
        public long totalEvents;
        public long successfulEvents;
        public long failedEvents;
        public long successfulBatches;
        public long failedBatches;
        public boolean success;
        public String startTime;
        public String endTime;
        public JsonNode stepOutput;
        public String fullOutput;
    }

    @JsonProperty("steps")
    public List<JobStep> stepModels;
}
