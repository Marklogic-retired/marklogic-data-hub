
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
 * Batch
 * <p>
 * Captures the results of processing a batch of items (often URIs, but not always) by a step
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "jobId",
    "batchId",
    "flowName",
    "stepId",
    "step",
    "stepNumber",
    "batchStatus",
    "timeStarted",
    "timeEnded",
    "hostName",
    "reqTimeStamp",
    "reqTrnxID",
    "writeTimeStamp",
    "writeTrnxID",
    "writeTransactions",
    "uris",
    "processedItemHashes",
    "fileName",
    "lineNumber",
    "errorStack",
    "error",
    "completeError",
    "stepResults"
})
@Generated("jsonschema2pojo")
public class BatchSchema {

    @JsonProperty("jobId")
    private String jobId;
    /**
     * UUID generated by MarkLogic
     * 
     */
    @JsonProperty("batchId")
    @JsonPropertyDescription("UUID generated by MarkLogic")
    private String batchId;
    /**
     * Added in 5.4.0; the name of the flow associated with the step executed for this batch
     * 
     */
    @JsonProperty("flowName")
    @JsonPropertyDescription("Added in 5.4.0; the name of the flow associated with the step executed for this batch")
    private String flowName;
    /**
     * Added in 5.4.0; the ID of the step, where ID = (stepName)-(stepDefinitionType)
     * 
     */
    @JsonProperty("stepId")
    @JsonPropertyDescription("Added in 5.4.0; the ID of the step, where ID = (stepName)-(stepDefinitionType)")
    private String stepId;
    /**
     * A copy of the step from its flow, plus runtime options
     * 
     */
    @JsonProperty("step")
    @JsonPropertyDescription("A copy of the step from its flow, plus runtime options")
    private Step step;
    @JsonProperty("stepNumber")
    private String stepNumber;
    /**
     * The status is 'started' when processing begins on a batch and then is updated to be one of the other values when processing finishes
     * 
     */
    @JsonProperty("batchStatus")
    @JsonPropertyDescription("The status is 'started' when processing begins on a batch and then is updated to be one of the other values when processing finishes")
    private BatchSchema.BatchStatus batchStatus;
    /**
     * dateTime at which processing of the batch started
     * 
     */
    @JsonProperty("timeStarted")
    @JsonPropertyDescription("dateTime at which processing of the batch started")
    private String timeStarted;
    /**
     * dateTime at which processing of the batch ended
     * 
     */
    @JsonProperty("timeEnded")
    @JsonPropertyDescription("dateTime at which processing of the batch ended")
    private String timeEnded;
    @JsonProperty("hostName")
    private String hostName;
    @JsonProperty("reqTimeStamp")
    private String reqTimeStamp;
    @JsonProperty("reqTrnxID")
    private String reqTrnxID;
    @JsonProperty("writeTimeStamp")
    private String writeTimeStamp;
    @JsonProperty("writeTrnxID")
    private String writeTrnxID;
    /**
     * Added in 5.5 to capture the results of multiple write transactions that can occur when running multiple steps on a batch
     * 
     */
    @JsonProperty("writeTransactions")
    @JsonPropertyDescription("Added in 5.5 to capture the results of multiple write transactions that can occur when running multiple steps on a batch")
    private List<WriteTransaction> writeTransactions = new ArrayList<WriteTransaction>();
    /**
     * Starting in 5.3.0, this is not necessarily 'uris' and should be thought of as 'items', as other values besides URIs are possible
     * 
     */
    @JsonProperty("uris")
    @JsonPropertyDescription("Starting in 5.3.0, this is not necessarily 'uris' and should be thought of as 'items', as other values besides URIs are possible")
    private List<String> uris = new ArrayList<String>();
    /**
     * Added in 5.4.0; an array of 64-bit hashes for each item in the 'uris' array, combined with the flow name, step ID, and batch status; 'items' is used as these values are not always URIs
     * 
     */
    @JsonProperty("processedItemHashes")
    @JsonPropertyDescription("Added in 5.4.0; an array of 64-bit hashes for each item in the 'uris' array, combined with the flow name, step ID, and batch status; 'items' is used as these values are not always URIs")
    private List<Double> processedItemHashes = new ArrayList<Double>();
    /**
     * The URI of the module that an error occurred in
     * 
     */
    @JsonProperty("fileName")
    @JsonPropertyDescription("The URI of the module that an error occurred in")
    private String fileName;
    /**
     * The line number that an error occurred at
     * 
     */
    @JsonProperty("lineNumber")
    @JsonPropertyDescription("The line number that an error occurred at")
    private String lineNumber;
    /**
     * Error stacktrace serialized as a string
     * 
     */
    @JsonProperty("errorStack")
    @JsonPropertyDescription("Error stacktrace serialized as a string")
    private String errorStack;
    /**
     * Concatenation of an error's name, code, and message
     * 
     */
    @JsonProperty("error")
    @JsonPropertyDescription("Concatenation of an error's name, code, and message")
    private String error;
    /**
     * Contains several properties from the original error created by MarkLogic, along with 'uri' if available
     * 
     */
    @JsonProperty("completeError")
    @JsonPropertyDescription("Contains several properties from the original error created by MarkLogic, along with 'uri' if available")
    private CompleteError completeError;
    /**
     * Added in 5.5 to support capturing the execution of multiple steps on a single batch of items
     * 
     */
    @JsonProperty("stepResults")
    @JsonPropertyDescription("Added in 5.5 to support capturing the execution of multiple steps on a single batch of items")
    private List<StepResult> stepResults = new ArrayList<StepResult>();
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("jobId")
    public String getJobId() {
        return jobId;
    }

    @JsonProperty("jobId")
    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    /**
     * UUID generated by MarkLogic
     * 
     */
    @JsonProperty("batchId")
    public String getBatchId() {
        return batchId;
    }

    /**
     * UUID generated by MarkLogic
     * 
     */
    @JsonProperty("batchId")
    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    /**
     * Added in 5.4.0; the name of the flow associated with the step executed for this batch
     * 
     */
    @JsonProperty("flowName")
    public String getFlowName() {
        return flowName;
    }

    /**
     * Added in 5.4.0; the name of the flow associated with the step executed for this batch
     * 
     */
    @JsonProperty("flowName")
    public void setFlowName(String flowName) {
        this.flowName = flowName;
    }

    /**
     * Added in 5.4.0; the ID of the step, where ID = (stepName)-(stepDefinitionType)
     * 
     */
    @JsonProperty("stepId")
    public String getStepId() {
        return stepId;
    }

    /**
     * Added in 5.4.0; the ID of the step, where ID = (stepName)-(stepDefinitionType)
     * 
     */
    @JsonProperty("stepId")
    public void setStepId(String stepId) {
        this.stepId = stepId;
    }

    /**
     * A copy of the step from its flow, plus runtime options
     * 
     */
    @JsonProperty("step")
    public Step getStep() {
        return step;
    }

    /**
     * A copy of the step from its flow, plus runtime options
     * 
     */
    @JsonProperty("step")
    public void setStep(Step step) {
        this.step = step;
    }

    @JsonProperty("stepNumber")
    public String getStepNumber() {
        return stepNumber;
    }

    @JsonProperty("stepNumber")
    public void setStepNumber(String stepNumber) {
        this.stepNumber = stepNumber;
    }

    /**
     * The status is 'started' when processing begins on a batch and then is updated to be one of the other values when processing finishes
     * 
     */
    @JsonProperty("batchStatus")
    public BatchSchema.BatchStatus getBatchStatus() {
        return batchStatus;
    }

    /**
     * The status is 'started' when processing begins on a batch and then is updated to be one of the other values when processing finishes
     * 
     */
    @JsonProperty("batchStatus")
    public void setBatchStatus(BatchSchema.BatchStatus batchStatus) {
        this.batchStatus = batchStatus;
    }

    /**
     * dateTime at which processing of the batch started
     * 
     */
    @JsonProperty("timeStarted")
    public String getTimeStarted() {
        return timeStarted;
    }

    /**
     * dateTime at which processing of the batch started
     * 
     */
    @JsonProperty("timeStarted")
    public void setTimeStarted(String timeStarted) {
        this.timeStarted = timeStarted;
    }

    /**
     * dateTime at which processing of the batch ended
     * 
     */
    @JsonProperty("timeEnded")
    public String getTimeEnded() {
        return timeEnded;
    }

    /**
     * dateTime at which processing of the batch ended
     * 
     */
    @JsonProperty("timeEnded")
    public void setTimeEnded(String timeEnded) {
        this.timeEnded = timeEnded;
    }

    @JsonProperty("hostName")
    public String getHostName() {
        return hostName;
    }

    @JsonProperty("hostName")
    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    @JsonProperty("reqTimeStamp")
    public String getReqTimeStamp() {
        return reqTimeStamp;
    }

    @JsonProperty("reqTimeStamp")
    public void setReqTimeStamp(String reqTimeStamp) {
        this.reqTimeStamp = reqTimeStamp;
    }

    @JsonProperty("reqTrnxID")
    public String getReqTrnxID() {
        return reqTrnxID;
    }

    @JsonProperty("reqTrnxID")
    public void setReqTrnxID(String reqTrnxID) {
        this.reqTrnxID = reqTrnxID;
    }

    @JsonProperty("writeTimeStamp")
    public String getWriteTimeStamp() {
        return writeTimeStamp;
    }

    @JsonProperty("writeTimeStamp")
    public void setWriteTimeStamp(String writeTimeStamp) {
        this.writeTimeStamp = writeTimeStamp;
    }

    @JsonProperty("writeTrnxID")
    public String getWriteTrnxID() {
        return writeTrnxID;
    }

    @JsonProperty("writeTrnxID")
    public void setWriteTrnxID(String writeTrnxID) {
        this.writeTrnxID = writeTrnxID;
    }

    /**
     * Added in 5.5 to capture the results of multiple write transactions that can occur when running multiple steps on a batch
     * 
     */
    @JsonProperty("writeTransactions")
    public List<WriteTransaction> getWriteTransactions() {
        return writeTransactions;
    }

    /**
     * Added in 5.5 to capture the results of multiple write transactions that can occur when running multiple steps on a batch
     * 
     */
    @JsonProperty("writeTransactions")
    public void setWriteTransactions(List<WriteTransaction> writeTransactions) {
        this.writeTransactions = writeTransactions;
    }

    /**
     * Starting in 5.3.0, this is not necessarily 'uris' and should be thought of as 'items', as other values besides URIs are possible
     * 
     */
    @JsonProperty("uris")
    public List<String> getUris() {
        return uris;
    }

    /**
     * Starting in 5.3.0, this is not necessarily 'uris' and should be thought of as 'items', as other values besides URIs are possible
     * 
     */
    @JsonProperty("uris")
    public void setUris(List<String> uris) {
        this.uris = uris;
    }

    /**
     * Added in 5.4.0; an array of 64-bit hashes for each item in the 'uris' array, combined with the flow name, step ID, and batch status; 'items' is used as these values are not always URIs
     * 
     */
    @JsonProperty("processedItemHashes")
    public List<Double> getProcessedItemHashes() {
        return processedItemHashes;
    }

    /**
     * Added in 5.4.0; an array of 64-bit hashes for each item in the 'uris' array, combined with the flow name, step ID, and batch status; 'items' is used as these values are not always URIs
     * 
     */
    @JsonProperty("processedItemHashes")
    public void setProcessedItemHashes(List<Double> processedItemHashes) {
        this.processedItemHashes = processedItemHashes;
    }

    /**
     * The URI of the module that an error occurred in
     * 
     */
    @JsonProperty("fileName")
    public String getFileName() {
        return fileName;
    }

    /**
     * The URI of the module that an error occurred in
     * 
     */
    @JsonProperty("fileName")
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    /**
     * The line number that an error occurred at
     * 
     */
    @JsonProperty("lineNumber")
    public String getLineNumber() {
        return lineNumber;
    }

    /**
     * The line number that an error occurred at
     * 
     */
    @JsonProperty("lineNumber")
    public void setLineNumber(String lineNumber) {
        this.lineNumber = lineNumber;
    }

    /**
     * Error stacktrace serialized as a string
     * 
     */
    @JsonProperty("errorStack")
    public String getErrorStack() {
        return errorStack;
    }

    /**
     * Error stacktrace serialized as a string
     * 
     */
    @JsonProperty("errorStack")
    public void setErrorStack(String errorStack) {
        this.errorStack = errorStack;
    }

    /**
     * Concatenation of an error's name, code, and message
     * 
     */
    @JsonProperty("error")
    public String getError() {
        return error;
    }

    /**
     * Concatenation of an error's name, code, and message
     * 
     */
    @JsonProperty("error")
    public void setError(String error) {
        this.error = error;
    }

    /**
     * Contains several properties from the original error created by MarkLogic, along with 'uri' if available
     * 
     */
    @JsonProperty("completeError")
    public CompleteError getCompleteError() {
        return completeError;
    }

    /**
     * Contains several properties from the original error created by MarkLogic, along with 'uri' if available
     * 
     */
    @JsonProperty("completeError")
    public void setCompleteError(CompleteError completeError) {
        this.completeError = completeError;
    }

    /**
     * Added in 5.5 to support capturing the execution of multiple steps on a single batch of items
     * 
     */
    @JsonProperty("stepResults")
    public List<StepResult> getStepResults() {
        return stepResults;
    }

    /**
     * Added in 5.5 to support capturing the execution of multiple steps on a single batch of items
     * 
     */
    @JsonProperty("stepResults")
    public void setStepResults(List<StepResult> stepResults) {
        this.stepResults = stepResults;
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
        sb.append(BatchSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("jobId");
        sb.append('=');
        sb.append(((this.jobId == null)?"<null>":this.jobId));
        sb.append(',');
        sb.append("batchId");
        sb.append('=');
        sb.append(((this.batchId == null)?"<null>":this.batchId));
        sb.append(',');
        sb.append("flowName");
        sb.append('=');
        sb.append(((this.flowName == null)?"<null>":this.flowName));
        sb.append(',');
        sb.append("stepId");
        sb.append('=');
        sb.append(((this.stepId == null)?"<null>":this.stepId));
        sb.append(',');
        sb.append("step");
        sb.append('=');
        sb.append(((this.step == null)?"<null>":this.step));
        sb.append(',');
        sb.append("stepNumber");
        sb.append('=');
        sb.append(((this.stepNumber == null)?"<null>":this.stepNumber));
        sb.append(',');
        sb.append("batchStatus");
        sb.append('=');
        sb.append(((this.batchStatus == null)?"<null>":this.batchStatus));
        sb.append(',');
        sb.append("timeStarted");
        sb.append('=');
        sb.append(((this.timeStarted == null)?"<null>":this.timeStarted));
        sb.append(',');
        sb.append("timeEnded");
        sb.append('=');
        sb.append(((this.timeEnded == null)?"<null>":this.timeEnded));
        sb.append(',');
        sb.append("hostName");
        sb.append('=');
        sb.append(((this.hostName == null)?"<null>":this.hostName));
        sb.append(',');
        sb.append("reqTimeStamp");
        sb.append('=');
        sb.append(((this.reqTimeStamp == null)?"<null>":this.reqTimeStamp));
        sb.append(',');
        sb.append("reqTrnxID");
        sb.append('=');
        sb.append(((this.reqTrnxID == null)?"<null>":this.reqTrnxID));
        sb.append(',');
        sb.append("writeTimeStamp");
        sb.append('=');
        sb.append(((this.writeTimeStamp == null)?"<null>":this.writeTimeStamp));
        sb.append(',');
        sb.append("writeTrnxID");
        sb.append('=');
        sb.append(((this.writeTrnxID == null)?"<null>":this.writeTrnxID));
        sb.append(',');
        sb.append("writeTransactions");
        sb.append('=');
        sb.append(((this.writeTransactions == null)?"<null>":this.writeTransactions));
        sb.append(',');
        sb.append("uris");
        sb.append('=');
        sb.append(((this.uris == null)?"<null>":this.uris));
        sb.append(',');
        sb.append("processedItemHashes");
        sb.append('=');
        sb.append(((this.processedItemHashes == null)?"<null>":this.processedItemHashes));
        sb.append(',');
        sb.append("fileName");
        sb.append('=');
        sb.append(((this.fileName == null)?"<null>":this.fileName));
        sb.append(',');
        sb.append("lineNumber");
        sb.append('=');
        sb.append(((this.lineNumber == null)?"<null>":this.lineNumber));
        sb.append(',');
        sb.append("errorStack");
        sb.append('=');
        sb.append(((this.errorStack == null)?"<null>":this.errorStack));
        sb.append(',');
        sb.append("error");
        sb.append('=');
        sb.append(((this.error == null)?"<null>":this.error));
        sb.append(',');
        sb.append("completeError");
        sb.append('=');
        sb.append(((this.completeError == null)?"<null>":this.completeError));
        sb.append(',');
        sb.append("stepResults");
        sb.append('=');
        sb.append(((this.stepResults == null)?"<null>":this.stepResults));
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
        result = ((result* 31)+((this.hostName == null)? 0 :this.hostName.hashCode()));
        result = ((result* 31)+((this.reqTimeStamp == null)? 0 :this.reqTimeStamp.hashCode()));
        result = ((result* 31)+((this.fileName == null)? 0 :this.fileName.hashCode()));
        result = ((result* 31)+((this.stepId == null)? 0 :this.stepId.hashCode()));
        result = ((result* 31)+((this.writeTransactions == null)? 0 :this.writeTransactions.hashCode()));
        result = ((result* 31)+((this.batchId == null)? 0 :this.batchId.hashCode()));
        result = ((result* 31)+((this.error == null)? 0 :this.error.hashCode()));
        result = ((result* 31)+((this.timeEnded == null)? 0 :this.timeEnded.hashCode()));
        result = ((result* 31)+((this.completeError == null)? 0 :this.completeError.hashCode()));
        result = ((result* 31)+((this.processedItemHashes == null)? 0 :this.processedItemHashes.hashCode()));
        result = ((result* 31)+((this.reqTrnxID == null)? 0 :this.reqTrnxID.hashCode()));
        result = ((result* 31)+((this.stepResults == null)? 0 :this.stepResults.hashCode()));
        result = ((result* 31)+((this.writeTrnxID == null)? 0 :this.writeTrnxID.hashCode()));
        result = ((result* 31)+((this.timeStarted == null)? 0 :this.timeStarted.hashCode()));
        result = ((result* 31)+((this.flowName == null)? 0 :this.flowName.hashCode()));
        result = ((result* 31)+((this.jobId == null)? 0 :this.jobId.hashCode()));
        result = ((result* 31)+((this.uris == null)? 0 :this.uris.hashCode()));
        result = ((result* 31)+((this.writeTimeStamp == null)? 0 :this.writeTimeStamp.hashCode()));
        result = ((result* 31)+((this.step == null)? 0 :this.step.hashCode()));
        result = ((result* 31)+((this.stepNumber == null)? 0 :this.stepNumber.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.lineNumber == null)? 0 :this.lineNumber.hashCode()));
        result = ((result* 31)+((this.batchStatus == null)? 0 :this.batchStatus.hashCode()));
        result = ((result* 31)+((this.errorStack == null)? 0 :this.errorStack.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof BatchSchema) == false) {
            return false;
        }
        BatchSchema rhs = ((BatchSchema) other);
        return (((((((((((((((((((((((((this.hostName == rhs.hostName)||((this.hostName!= null)&&this.hostName.equals(rhs.hostName)))&&((this.reqTimeStamp == rhs.reqTimeStamp)||((this.reqTimeStamp!= null)&&this.reqTimeStamp.equals(rhs.reqTimeStamp))))&&((this.fileName == rhs.fileName)||((this.fileName!= null)&&this.fileName.equals(rhs.fileName))))&&((this.stepId == rhs.stepId)||((this.stepId!= null)&&this.stepId.equals(rhs.stepId))))&&((this.writeTransactions == rhs.writeTransactions)||((this.writeTransactions!= null)&&this.writeTransactions.equals(rhs.writeTransactions))))&&((this.batchId == rhs.batchId)||((this.batchId!= null)&&this.batchId.equals(rhs.batchId))))&&((this.error == rhs.error)||((this.error!= null)&&this.error.equals(rhs.error))))&&((this.timeEnded == rhs.timeEnded)||((this.timeEnded!= null)&&this.timeEnded.equals(rhs.timeEnded))))&&((this.completeError == rhs.completeError)||((this.completeError!= null)&&this.completeError.equals(rhs.completeError))))&&((this.processedItemHashes == rhs.processedItemHashes)||((this.processedItemHashes!= null)&&this.processedItemHashes.equals(rhs.processedItemHashes))))&&((this.reqTrnxID == rhs.reqTrnxID)||((this.reqTrnxID!= null)&&this.reqTrnxID.equals(rhs.reqTrnxID))))&&((this.stepResults == rhs.stepResults)||((this.stepResults!= null)&&this.stepResults.equals(rhs.stepResults))))&&((this.writeTrnxID == rhs.writeTrnxID)||((this.writeTrnxID!= null)&&this.writeTrnxID.equals(rhs.writeTrnxID))))&&((this.timeStarted == rhs.timeStarted)||((this.timeStarted!= null)&&this.timeStarted.equals(rhs.timeStarted))))&&((this.flowName == rhs.flowName)||((this.flowName!= null)&&this.flowName.equals(rhs.flowName))))&&((this.jobId == rhs.jobId)||((this.jobId!= null)&&this.jobId.equals(rhs.jobId))))&&((this.uris == rhs.uris)||((this.uris!= null)&&this.uris.equals(rhs.uris))))&&((this.writeTimeStamp == rhs.writeTimeStamp)||((this.writeTimeStamp!= null)&&this.writeTimeStamp.equals(rhs.writeTimeStamp))))&&((this.step == rhs.step)||((this.step!= null)&&this.step.equals(rhs.step))))&&((this.stepNumber == rhs.stepNumber)||((this.stepNumber!= null)&&this.stepNumber.equals(rhs.stepNumber))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.lineNumber == rhs.lineNumber)||((this.lineNumber!= null)&&this.lineNumber.equals(rhs.lineNumber))))&&((this.batchStatus == rhs.batchStatus)||((this.batchStatus!= null)&&this.batchStatus.equals(rhs.batchStatus))))&&((this.errorStack == rhs.errorStack)||((this.errorStack!= null)&&this.errorStack.equals(rhs.errorStack))));
    }


    /**
     * The status is 'started' when processing begins on a batch and then is updated to be one of the other values when processing finishes
     * 
     */
    @Generated("jsonschema2pojo")
    public enum BatchStatus {

        STARTED("started"),
        FAILED("failed"),
        FINISHED("finished"),
        FINISHED_WITH_ERRORS("finished_with_errors");
        private final String value;
        private final static Map<String, BatchSchema.BatchStatus> CONSTANTS = new HashMap<String, BatchSchema.BatchStatus>();

        static {
            for (BatchSchema.BatchStatus c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        BatchStatus(String value) {
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
        public static BatchSchema.BatchStatus fromValue(String value) {
            BatchSchema.BatchStatus constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}