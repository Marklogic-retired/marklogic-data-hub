package com.marklogic.hub.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;

public class JobModel {
    @JsonProperty("id")
    public String jobId;
    @JsonProperty("flowId")
    public String name; //flowName
    public String targetEntity;
    public String user;
    public String lastAttemptedStep;
    public String lastCompletedStep;
    public String status;
    public String startTime;
    public String endTime;
    public long successfulEvents;
    public long failedEvents;

    public static class JobStep {
        public int stepNumber;
        public String type;
        public String name;
        public String id;
        public String identifier;
        public int retryLimit;
        public JsonNode options;
        public String status;
        public String startTime;
        public String endTime;
        public long successfulEvents;
        public long failedEvents;
    }

    @JsonProperty("steps")
    public List<JobStep> stepModels;
}
