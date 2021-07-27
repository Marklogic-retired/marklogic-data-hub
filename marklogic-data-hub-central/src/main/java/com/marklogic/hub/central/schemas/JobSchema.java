
package com.marklogic.hub.central.schemas;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Generated;
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
 * Job
 * <p>
 * Captures the results of executing one or more steps in a flow
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "jobId",
    "flow",
    "user",
    "lastAttemptedStep",
    "lastCompletedStep",
    "jobStatus",
    "timeStarted",
    "timeEnded",
    "externalMetadata",
    "stepResponses",
    "flowErrors"
})
@Generated("jsonschema2pojo")
public class JobSchema {

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
    @JsonProperty("flow")
    @JsonPropertyDescription("The name of the flow, now the flow object")
    private String flow;
    /**
     * Name of the MarkLogic user that ran this job
     * 
     */
    @JsonProperty("user")
    @JsonPropertyDescription("Name of the MarkLogic user that ran this job")
    private String user;
    /**
     * Corrected in 5.5 to always be a string; was sometimes a number in 5.4 and before
     * 
     */
    @JsonProperty("lastAttemptedStep")
    @JsonPropertyDescription("Corrected in 5.5 to always be a string; was sometimes a number in 5.4 and before")
    private String lastAttemptedStep;
    /**
     * Corrected in 5.5 to always be a string; was sometimes a number in 5.4 and before
     * 
     */
    @JsonProperty("lastCompletedStep")
    @JsonPropertyDescription("Corrected in 5.5 to always be a string; was sometimes a number in 5.4 and before")
    private String lastCompletedStep;
    /**
     * The status is 'started' when the Job document is first created, and it is then modified to one of the other values as steps are completed
     * 
     */
    @JsonProperty("jobStatus")
    @JsonPropertyDescription("The status is 'started' when the Job document is first created, and it is then modified to one of the other values as steps are completed")
    private JobSchema.JobStatus jobStatus;
    /**
     * dateTime at which the job started
     * 
     */
    @JsonProperty("timeStarted")
    @JsonPropertyDescription("dateTime at which the job started")
    private String timeStarted;
    /**
     * dateTime at which the job ended
     * 
     */
    @JsonProperty("timeEnded")
    @JsonPropertyDescription("dateTime at which the job ended")
    private String timeEnded;
    /**
     * Captures metadata related to Spark when a document is ingested via the Data Hub Spark connector
     * 
     */
    @JsonProperty("externalMetadata")
    @JsonPropertyDescription("Captures metadata related to Spark when a document is ingested via the Data Hub Spark connector")
    private ExternalMetadata externalMetadata;
    /**
     * For each step that was executed, a key with a name equaling the step number of the step will be present
     * 
     */
    @JsonProperty("stepResponses")
    @JsonPropertyDescription("For each step that was executed, a key with a name equaling the step number of the step will be present")
    private StepResponses stepResponses;
    /**
     * Added in 5.5.0 to capture flow-level errors
     * 
     */
    @JsonProperty("flowErrors")
    @JsonPropertyDescription("Added in 5.5.0 to capture flow-level errors")
    private List<FlowError> flowErrors = new ArrayList<FlowError>();
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
    @JsonProperty("flow")
    public String getFlow() {
        return flow;
    }

    /**
     * The name of the flow, now the flow object
     * 
     */
    @JsonProperty("flow")
    public void setFlow(String flow) {
        this.flow = flow;
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

    /**
     * Corrected in 5.5 to always be a string; was sometimes a number in 5.4 and before
     * 
     */
    @JsonProperty("lastAttemptedStep")
    public String getLastAttemptedStep() {
        return lastAttemptedStep;
    }

    /**
     * Corrected in 5.5 to always be a string; was sometimes a number in 5.4 and before
     * 
     */
    @JsonProperty("lastAttemptedStep")
    public void setLastAttemptedStep(String lastAttemptedStep) {
        this.lastAttemptedStep = lastAttemptedStep;
    }

    /**
     * Corrected in 5.5 to always be a string; was sometimes a number in 5.4 and before
     * 
     */
    @JsonProperty("lastCompletedStep")
    public String getLastCompletedStep() {
        return lastCompletedStep;
    }

    /**
     * Corrected in 5.5 to always be a string; was sometimes a number in 5.4 and before
     * 
     */
    @JsonProperty("lastCompletedStep")
    public void setLastCompletedStep(String lastCompletedStep) {
        this.lastCompletedStep = lastCompletedStep;
    }

    /**
     * The status is 'started' when the Job document is first created, and it is then modified to one of the other values as steps are completed
     * 
     */
    @JsonProperty("jobStatus")
    public JobSchema.JobStatus getJobStatus() {
        return jobStatus;
    }

    /**
     * The status is 'started' when the Job document is first created, and it is then modified to one of the other values as steps are completed
     * 
     */
    @JsonProperty("jobStatus")
    public void setJobStatus(JobSchema.JobStatus jobStatus) {
        this.jobStatus = jobStatus;
    }

    /**
     * dateTime at which the job started
     * 
     */
    @JsonProperty("timeStarted")
    public String getTimeStarted() {
        return timeStarted;
    }

    /**
     * dateTime at which the job started
     * 
     */
    @JsonProperty("timeStarted")
    public void setTimeStarted(String timeStarted) {
        this.timeStarted = timeStarted;
    }

    /**
     * dateTime at which the job ended
     * 
     */
    @JsonProperty("timeEnded")
    public String getTimeEnded() {
        return timeEnded;
    }

    /**
     * dateTime at which the job ended
     * 
     */
    @JsonProperty("timeEnded")
    public void setTimeEnded(String timeEnded) {
        this.timeEnded = timeEnded;
    }

    /**
     * Captures metadata related to Spark when a document is ingested via the Data Hub Spark connector
     * 
     */
    @JsonProperty("externalMetadata")
    public ExternalMetadata getExternalMetadata() {
        return externalMetadata;
    }

    /**
     * Captures metadata related to Spark when a document is ingested via the Data Hub Spark connector
     * 
     */
    @JsonProperty("externalMetadata")
    public void setExternalMetadata(ExternalMetadata externalMetadata) {
        this.externalMetadata = externalMetadata;
    }

    /**
     * For each step that was executed, a key with a name equaling the step number of the step will be present
     * 
     */
    @JsonProperty("stepResponses")
    public StepResponses getStepResponses() {
        return stepResponses;
    }

    /**
     * For each step that was executed, a key with a name equaling the step number of the step will be present
     * 
     */
    @JsonProperty("stepResponses")
    public void setStepResponses(StepResponses stepResponses) {
        this.stepResponses = stepResponses;
    }

    /**
     * Added in 5.5.0 to capture flow-level errors
     * 
     */
    @JsonProperty("flowErrors")
    public List<FlowError> getFlowErrors() {
        return flowErrors;
    }

    /**
     * Added in 5.5.0 to capture flow-level errors
     * 
     */
    @JsonProperty("flowErrors")
    public void setFlowErrors(List<FlowError> flowErrors) {
        this.flowErrors = flowErrors;
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
        sb.append(JobSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("jobId");
        sb.append('=');
        sb.append(((this.jobId == null)?"<null>":this.jobId));
        sb.append(',');
        sb.append("flow");
        sb.append('=');
        sb.append(((this.flow == null)?"<null>":this.flow));
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
        sb.append("timeStarted");
        sb.append('=');
        sb.append(((this.timeStarted == null)?"<null>":this.timeStarted));
        sb.append(',');
        sb.append("timeEnded");
        sb.append('=');
        sb.append(((this.timeEnded == null)?"<null>":this.timeEnded));
        sb.append(',');
        sb.append("externalMetadata");
        sb.append('=');
        sb.append(((this.externalMetadata == null)?"<null>":this.externalMetadata));
        sb.append(',');
        sb.append("stepResponses");
        sb.append('=');
        sb.append(((this.stepResponses == null)?"<null>":this.stepResponses));
        sb.append(',');
        sb.append("flowErrors");
        sb.append('=');
        sb.append(((this.flowErrors == null)?"<null>":this.flowErrors));
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
        result = ((result* 31)+((this.jobStatus == null)? 0 :this.jobStatus.hashCode()));
        result = ((result* 31)+((this.externalMetadata == null)? 0 :this.externalMetadata.hashCode()));
        result = ((result* 31)+((this.timeStarted == null)? 0 :this.timeStarted.hashCode()));
        result = ((result* 31)+((this.jobId == null)? 0 :this.jobId.hashCode()));
        result = ((result* 31)+((this.stepResponses == null)? 0 :this.stepResponses.hashCode()));
        result = ((result* 31)+((this.timeEnded == null)? 0 :this.timeEnded.hashCode()));
        result = ((result* 31)+((this.lastAttemptedStep == null)? 0 :this.lastAttemptedStep.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.user == null)? 0 :this.user.hashCode()));
        result = ((result* 31)+((this.lastCompletedStep == null)? 0 :this.lastCompletedStep.hashCode()));
        result = ((result* 31)+((this.flowErrors == null)? 0 :this.flowErrors.hashCode()));
        result = ((result* 31)+((this.flow == null)? 0 :this.flow.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof JobSchema) == false) {
            return false;
        }
        JobSchema rhs = ((JobSchema) other);
        return (((((((((((((this.jobStatus == rhs.jobStatus)||((this.jobStatus!= null)&&this.jobStatus.equals(rhs.jobStatus)))&&((this.externalMetadata == rhs.externalMetadata)||((this.externalMetadata!= null)&&this.externalMetadata.equals(rhs.externalMetadata))))&&((this.timeStarted == rhs.timeStarted)||((this.timeStarted!= null)&&this.timeStarted.equals(rhs.timeStarted))))&&((this.jobId == rhs.jobId)||((this.jobId!= null)&&this.jobId.equals(rhs.jobId))))&&((this.stepResponses == rhs.stepResponses)||((this.stepResponses!= null)&&this.stepResponses.equals(rhs.stepResponses))))&&((this.timeEnded == rhs.timeEnded)||((this.timeEnded!= null)&&this.timeEnded.equals(rhs.timeEnded))))&&((this.lastAttemptedStep == rhs.lastAttemptedStep)||((this.lastAttemptedStep!= null)&&this.lastAttemptedStep.equals(rhs.lastAttemptedStep))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.user == rhs.user)||((this.user!= null)&&this.user.equals(rhs.user))))&&((this.lastCompletedStep == rhs.lastCompletedStep)||((this.lastCompletedStep!= null)&&this.lastCompletedStep.equals(rhs.lastCompletedStep))))&&((this.flowErrors == rhs.flowErrors)||((this.flowErrors!= null)&&this.flowErrors.equals(rhs.flowErrors))))&&((this.flow == rhs.flow)||((this.flow!= null)&&this.flow.equals(rhs.flow))));
    }


    /**
     * The status is 'started' when the Job document is first created, and it is then modified to one of the other values as steps are completed
     * 
     */
    @Generated("jsonschema2pojo")
    public enum JobStatus {

        CANCELED("canceled"),
        FAILED("failed"),
        FINISHED("finished"),
        FINISHED_WITH_ERRORS("finished_with_errors"),
        RUNNING("running"),
        STARTED("started"),
        STOP_ON_ERROR("stop-on-error");
        private final String value;
        private final static Map<String, JobSchema.JobStatus> CONSTANTS = new HashMap<String, JobSchema.JobStatus>();

        static {
            for (JobSchema.JobStatus c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        JobStatus(String value) {
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
        public static JobSchema.JobStatus fromValue(String value) {
            JobSchema.JobStatus constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
