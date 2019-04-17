package com.marklogic.hub.web.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static java.util.Optional.ofNullable;

public class FlowJobModel {
    public static class LatestJob {
        public String id;
        public String startTime;
        public String endTime;
        public JsonNode output;
        public String stepId;
        public String stepName;
        public long stepRunningPercent;
        public String status;
        public long successfulEvents;
        public long failedEvents;

        public String toString() {
            List<String> lstOutput = new ArrayList<>();
            if (output != null && !output.get("output").isNull() && output.get("output").isArray()) {
                output.get("output").forEach(e -> lstOutput.add(e.asText()));
            }
            return String.format("{jobId: %s, stepId: %s, status: %s, startTime: %s, endTime: %s, " +
                    "stepRunningPercent: %d, successfulEvents: %d, failedEvents: %d, output: %s}",
                id, stepId, ofNullable(status).orElse(""),
                ofNullable(startTime).orElse(""),
                ofNullable(endTime).orElse(""), stepRunningPercent, successfulEvents, failedEvents, Arrays.toString(lstOutput.toArray()));
        }
    }

    public static class FlowJobs {
        public List<String> jobIds;
        public LatestJob latestJob;

        public FlowJobs(List<String> jobIds, LatestJob latestJob) {
            this.jobIds = jobIds;
            this.latestJob = latestJob;
        }
    }
}
