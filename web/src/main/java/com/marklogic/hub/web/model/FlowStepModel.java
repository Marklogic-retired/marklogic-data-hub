package com.marklogic.hub.web.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.service.FlowJobsService;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import javax.xml.bind.DatatypeConverter;

public class FlowStepModel {
    private String id;
    private String name;
    private String description;
    private int batchSize;
    private int threadCount;
    private boolean stopOnError;
    private JsonNode options;

    static final SimpleDateFormat DATE_TIME_FORMAT = new SimpleDateFormat("yyyy-mm-dd hh:mm:ss");

    static class StepSummary {
        @JsonIgnore
        public String stepKey;
        public String id;
        public String name;
        public String type;
        public String targetEntity;
    }

    static class LatestJob {
        public String id;
        public String startTime;
        public String endTime;
        public List<String> output;
        public String stepId;
        public String stepName;
        public long stepRunningPercent;
        public String status;
        public long successfulEvents;
        public long failedEvents;
    }

    static class JobWithTime {
        public String id;
        @JsonIgnore
        public String startTime;

        public JobWithTime(String id, String startTime) {
            this.id = id;
            this.startTime = startTime;
        }
    }

    @JsonProperty("steps")
    private List<StepSummary> stepModels = new ArrayList<>();
    @JsonProperty("jobs")
    public List<JobWithTime> jobs;
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
            sm.stepKey = name;
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

    public void setJobs(FlowJobsService.JobInfo jobInfo, FlowRunnerImpl flowRunner) {
        /*
            "jobId": "76ad5660-d775-42ef-ad8d-94de1e7e4144",
            "flow": "flow1",
            "user": "admin",
            "lastAttemptedStep": "Step1",
            "lastCompletedStep": 0,
            "jobStatus": "finished_with_errors",
            "timeStarted": "2019-04-02T22:27:33.825475-07:00",
            "timeEnded": "2019-04-02T22:28:17.417468-07:00"
         */

        //TODO get latest running job from listener callback?
/*        final String[] curjobId = new String[1];
        if (flowRunner != null) {
            flowRunner.onStatusChanged((jobId, step, percentComplete, message) -> {
                curjobId[0] = jobId;
            });
        }*/

        if (jobInfo == null) {
            return;
        }
        List<Object> jobs = jobInfo.jobs;
        if (jobs.isEmpty()) {
            return;
        }
        this.jobs = new ArrayList<>();
        jobs.forEach(job -> {
            JSONObject jobJson = new JSONObject((JsonNode) job);
            String jobId = jobJson.getString("jobId");
            String flowName = jobJson.getString("flow");
            String startTime = jobJson.getString("timeStarted", "");
            this.jobs.add(new JobWithTime(jobId, startTime));
        });

        Collections.sort(this.jobs, (o1, o2) ->
            DatatypeConverter.parseDateTime(o1.startTime).getTime().compareTo(DatatypeConverter.parseDateTime(o2.startTime).getTime()));

        String latestJobId = this.jobs.get(this.jobs.size() - 1).id;

        jobs.forEach(job -> {
            JSONObject jobJson = new JSONObject((JsonNode) job);
            String jobId = jobJson.getString("jobId");
            if (!latestJobId.equals(jobId)) {
                return;
            }
            latestJob = new LatestJob();
            latestJob.id = jobId;
            String stepKey = jobJson.getString("lastCompletedStep", jobJson.getString("lastAttemptedStep", ""));
            List<StepSummary> summary = this.stepModels.stream().filter(s -> s.stepKey.equals(stepKey)).collect(Collectors.toList());
            latestJob.stepName = "";
            latestJob.stepId = "";
            if (summary != null && summary.size() > 0) {
                latestJob.stepName = summary.get(0).name;
                latestJob.stepId = summary.get(0).id;
            }
            latestJob.startTime = jobJson.getString("timeStarted", "");;
            latestJob.endTime = jobJson.getString("timeEnded", "");
            latestJob.status = jobJson.getString("jobStatus", "");

            FlowJobsService.EventCounters counters = jobInfo.counterByJobId.get(jobId);

            latestJob.successfulEvents = counters.successfulEvents;
            latestJob.failedEvents = counters.failedEvents;

            latestJob.stepRunningPercent = 100;
            latestJob.output = new ArrayList<>();
        });
    }
}
