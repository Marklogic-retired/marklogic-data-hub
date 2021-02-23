
package com.marklogic.hub.central.schemas;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.annotation.JsonValue;


/**
 * RunFlowResponse
 * <p>
 * Defines the output produced by FlowRunner after running a flow; JSON schema representation of the RunFlowResponse.java class
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "jobId",
    "flowName",
    "user",
    "lastAttemptedStep",
    "lastCompletedStep",
    "jobStatus",
    "startTime",
    "endTime",
    "stepResponses"
})
public class RunFlowResponseSchema {

    /**
     * Unique identifier for this job. If not user-specified, should be a UUID
     * 
     */
    @JsonProperty("jobId")
    @JsonPropertyDescription("Unique identifier for this job. If not user-specified, should be a UUID")
    private String jobId;
    /**
     * The name of the flow, now the flow object
     * 
     */
    @JsonProperty("flowName")
    @JsonPropertyDescription("The name of the flow, now the flow object")
    private String flowName;
    /**
     * Name of the MarkLogic user that ran this job
     * 
     */
    @JsonProperty("user")
    @JsonPropertyDescription("Name of the MarkLogic user that ran this job")
    private String user;
    @JsonProperty("lastAttemptedStep")
    private Integer lastAttemptedStep;
    @JsonProperty("lastCompletedStep")
    private Integer lastCompletedStep;
    /**
     * The status is 'started' when the Job document is first created, and it is then modified to one of the other values as steps are completed
     * 
     */
    @JsonProperty("jobStatus")
    @JsonPropertyDescription("The status is 'started' when the Job document is first created, and it is then modified to one of the other values as steps are completed")
    private RunFlowResponseSchema.JobStatus jobStatus;
    /**
     * dateTime at which the job started
     * 
     */
    @JsonProperty("startTime")
    @JsonPropertyDescription("dateTime at which the job started")
    private String startTime;
    /**
     * dateTime at which the job ended
     * 
     */
    @JsonProperty("endTime")
    @JsonPropertyDescription("dateTime at which the job ended")
    private String endTime;
    /**
     * For each step that was executed, a key with a name equaling the step number of the step will be present
     * 
     */
    @JsonProperty("stepResponses")
    @JsonPropertyDescription("For each step that was executed, a key with a name equaling the step number of the step will be present")
    private StepResponses__1 stepResponses;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * Unique identifier for this job. If not user-specified, should be a UUID
     * 
     */
    @JsonProperty("jobId")
    public String getJobId() {
        return jobId;
    }

    /**
     * Unique identifier for this job. If not user-specified, should be a UUID
     * 
     */
    @JsonProperty("jobId")
    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    /**
     * The name of the flow, now the flow object
     * 
     */
    @JsonProperty("flowName")
    public String getFlowName() {
        return flowName;
    }

    /**
     * The name of the flow, now the flow object
     * 
     */
    @JsonProperty("flowName")
    public void setFlowName(String flowName) {
        this.flowName = flowName;
    }

    /**
     * Name of the MarkLogic user that ran this job
     * 
     */
    @JsonProperty("user")
    public String getUser() {
        return user;
    }

    /**
     * Name of the MarkLogic user that ran this job
     * 
     */
    @JsonProperty("user")
    public void setUser(String user) {
        this.user = user;
    }

    @JsonProperty("lastAttemptedStep")
    public Integer getLastAttemptedStep() {
        return lastAttemptedStep;
    }

    @JsonProperty("lastAttemptedStep")
    public void setLastAttemptedStep(Integer lastAttemptedStep) {
        this.lastAttemptedStep = lastAttemptedStep;
    }

    @JsonProperty("lastCompletedStep")
    public Integer getLastCompletedStep() {
        return lastCompletedStep;
    }

    @JsonProperty("lastCompletedStep")
    public void setLastCompletedStep(Integer lastCompletedStep) {
        this.lastCompletedStep = lastCompletedStep;
    }

    /**
     * The status is 'started' when the Job document is first created, and it is then modified to one of the other values as steps are completed
     * 
     */
    @JsonProperty("jobStatus")
    public RunFlowResponseSchema.JobStatus getJobStatus() {
        return jobStatus;
    }

    /**
     * The status is 'started' when the Job document is first created, and it is then modified to one of the other values as steps are completed
     * 
     */
    @JsonProperty("jobStatus")
    public void setJobStatus(RunFlowResponseSchema.JobStatus jobStatus) {
        this.jobStatus = jobStatus;
    }

    /**
     * dateTime at which the job started
     * 
     */
    @JsonProperty("startTime")
    public String getStartTime() {
        return startTime;
    }

    /**
     * dateTime at which the job started
     * 
     */
    @JsonProperty("startTime")
    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    /**
     * dateTime at which the job ended
     * 
     */
    @JsonProperty("endTime")
    public String getEndTime() {
        return endTime;
    }

    /**
     * dateTime at which the job ended
     * 
     */
    @JsonProperty("endTime")
    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    /**
     * For each step that was executed, a key with a name equaling the step number of the step will be present
     * 
     */
    @JsonProperty("stepResponses")
    public StepResponses__1 getStepResponses() {
        return stepResponses;
    }

    /**
     * For each step that was executed, a key with a name equaling the step number of the step will be present
     * 
     */
    @JsonProperty("stepResponses")
    public void setStepResponses(StepResponses__1 stepResponses) {
        this.stepResponses = stepResponses;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(RunFlowResponseSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("jobId");
        sb.append('=');
        sb.append(((this.jobId == null)?"<null>":this.jobId));
        sb.append(',');
        sb.append("flowName");
        sb.append('=');
        sb.append(((this.flowName == null)?"<null>":this.flowName));
        sb.append(',');
        sb.append("user");
        sb.append('=');
        sb.append(((this.user == null)?"<null>":this.user));
        sb.append(',');
        sb.append("lastAttemptedStep");
        sb.append('=');
        sb.append(((this.lastAttemptedStep == null)?"<null>":this.lastAttemptedStep));
        sb.append(',');
        sb.append("lastCompletedStep");
        sb.append('=');
        sb.append(((this.lastCompletedStep == null)?"<null>":this.lastCompletedStep));
        sb.append(',');
        sb.append("jobStatus");
        sb.append('=');
        sb.append(((this.jobStatus == null)?"<null>":this.jobStatus));
        sb.append(',');
        sb.append("startTime");
        sb.append('=');
        sb.append(((this.startTime == null)?"<null>":this.startTime));
        sb.append(',');
        sb.append("endTime");
        sb.append('=');
        sb.append(((this.endTime == null)?"<null>":this.endTime));
        sb.append(',');
        sb.append("stepResponses");
        sb.append('=');
        sb.append(((this.stepResponses == null)?"<null>":this.stepResponses));
        sb.append(',');
        sb.append("additionalProperties");
        sb.append('=');
        sb.append(((this.additionalProperties == null)?"<null>":this.additionalProperties));
        sb.append(',');
        if (sb.charAt((sb.length()- 1)) == ',') {
            sb.setCharAt((sb.length()- 1), ']');
        } else {
            sb.append(']');
        }
        return sb.toString();
    }

    @Override
    public int hashCode() {
        int result = 1;
        result = ((result* 31)+((this.jobId == null)? 0 :this.jobId.hashCode()));
        result = ((result* 31)+((this.jobStatus == null)? 0 :this.jobStatus.hashCode()));
        result = ((result* 31)+((this.stepResponses == null)? 0 :this.stepResponses.hashCode()));
        result = ((result* 31)+((this.lastAttemptedStep == null)? 0 :this.lastAttemptedStep.hashCode()));
        result = ((result* 31)+((this.startTime == null)? 0 :this.startTime.hashCode()));
        result = ((result* 31)+((this.endTime == null)? 0 :this.endTime.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.flowName == null)? 0 :this.flowName.hashCode()));
        result = ((result* 31)+((this.user == null)? 0 :this.user.hashCode()));
        result = ((result* 31)+((this.lastCompletedStep == null)? 0 :this.lastCompletedStep.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof RunFlowResponseSchema) == false) {
            return false;
        }
        RunFlowResponseSchema rhs = ((RunFlowResponseSchema) other);
        return (((((((((((this.jobId == rhs.jobId)||((this.jobId!= null)&&this.jobId.equals(rhs.jobId)))&&((this.jobStatus == rhs.jobStatus)||((this.jobStatus!= null)&&this.jobStatus.equals(rhs.jobStatus))))&&((this.stepResponses == rhs.stepResponses)||((this.stepResponses!= null)&&this.stepResponses.equals(rhs.stepResponses))))&&((this.lastAttemptedStep == rhs.lastAttemptedStep)||((this.lastAttemptedStep!= null)&&this.lastAttemptedStep.equals(rhs.lastAttemptedStep))))&&((this.startTime == rhs.startTime)||((this.startTime!= null)&&this.startTime.equals(rhs.startTime))))&&((this.endTime == rhs.endTime)||((this.endTime!= null)&&this.endTime.equals(rhs.endTime))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.flowName == rhs.flowName)||((this.flowName!= null)&&this.flowName.equals(rhs.flowName))))&&((this.user == rhs.user)||((this.user!= null)&&this.user.equals(rhs.user))))&&((this.lastCompletedStep == rhs.lastCompletedStep)||((this.lastCompletedStep!= null)&&this.lastCompletedStep.equals(rhs.lastCompletedStep))));
    }


    /**
     * The status is 'started' when the Job document is first created, and it is then modified to one of the other values as steps are completed
     * 
     */
    public enum JobStatus {

        CANCELED("canceled"),
        FAILED("failed"),
        FINISHED("finished"),
        FINISHED_WITH_ERRORS("finished_with_errors"),
        RUNNING("running"),
        STARTED("started"),
        STOP_ON_ERROR("stop-on-error");
        private final String value;
        private final static Map<String, RunFlowResponseSchema.JobStatus> CONSTANTS = new HashMap<String, RunFlowResponseSchema.JobStatus>();

        static {
            for (RunFlowResponseSchema.JobStatus c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        private JobStatus(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        @JsonValue
        public String value() {
            return this.value;
        }

        @JsonCreator
        public static RunFlowResponseSchema.JobStatus fromValue(String value) {
            RunFlowResponseSchema.JobStatus constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
