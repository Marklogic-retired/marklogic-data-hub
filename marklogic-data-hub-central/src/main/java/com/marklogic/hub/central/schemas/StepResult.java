
package com.marklogic.hub.central.schemas;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


/**
 * Can contain any of: step, stepId, stepNumber, uris, processedItemHashes, error, fileName, lineNumber, errorStack, error, completeError; as defined above
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "stepStartDateTime",
    "stepEndDateTime"
})
public class StepResult {

    /**
     * The dateTime at which this step started processing the batch
     * 
     */
    @JsonProperty("stepStartDateTime")
    @JsonPropertyDescription("The dateTime at which this step started processing the batch")
    private String stepStartDateTime;
    /**
     * The dateTime at which this step finished processing the batch
     * 
     */
    @JsonProperty("stepEndDateTime")
    @JsonPropertyDescription("The dateTime at which this step finished processing the batch")
    private String stepEndDateTime;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * The dateTime at which this step started processing the batch
     * 
     */
    @JsonProperty("stepStartDateTime")
    public String getStepStartDateTime() {
        return stepStartDateTime;
    }

    /**
     * The dateTime at which this step started processing the batch
     * 
     */
    @JsonProperty("stepStartDateTime")
    public void setStepStartDateTime(String stepStartDateTime) {
        this.stepStartDateTime = stepStartDateTime;
    }

    /**
     * The dateTime at which this step finished processing the batch
     * 
     */
    @JsonProperty("stepEndDateTime")
    public String getStepEndDateTime() {
        return stepEndDateTime;
    }

    /**
     * The dateTime at which this step finished processing the batch
     * 
     */
    @JsonProperty("stepEndDateTime")
    public void setStepEndDateTime(String stepEndDateTime) {
        this.stepEndDateTime = stepEndDateTime;
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
        sb.append(StepResult.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("stepStartDateTime");
        sb.append('=');
        sb.append(((this.stepStartDateTime == null)?"<null>":this.stepStartDateTime));
        sb.append(',');
        sb.append("stepEndDateTime");
        sb.append('=');
        sb.append(((this.stepEndDateTime == null)?"<null>":this.stepEndDateTime));
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
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.stepStartDateTime == null)? 0 :this.stepStartDateTime.hashCode()));
        result = ((result* 31)+((this.stepEndDateTime == null)? 0 :this.stepEndDateTime.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof StepResult) == false) {
            return false;
        }
        StepResult rhs = ((StepResult) other);
        return ((((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties)))&&((this.stepStartDateTime == rhs.stepStartDateTime)||((this.stepStartDateTime!= null)&&this.stepStartDateTime.equals(rhs.stepStartDateTime))))&&((this.stepEndDateTime == rhs.stepEndDateTime)||((this.stepEndDateTime!= null)&&this.stepEndDateTime.equals(rhs.stepEndDateTime))));
    }

}
