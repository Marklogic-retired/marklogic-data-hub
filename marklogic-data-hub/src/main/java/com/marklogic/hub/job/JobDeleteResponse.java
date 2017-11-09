package com.marklogic.hub.job;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

public class JobDeleteResponse {
    public long totalCount = 0;
    public long errorCount = 0;
    public List<String> deletedJobs;
    public List<String> deletedTraces;
    public List<String> failedJobs;
    public List<String> failedTraces;
    public List<JsonNode> errors;
}
