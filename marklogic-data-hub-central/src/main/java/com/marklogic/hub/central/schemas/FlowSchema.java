
package com.marklogic.hub.central.schemas;

import java.util.HashMap;
import java.util.Map;
import javax.annotation.Generated;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


/**
 * Flow
 * <p>
 * A Data Hub flow containing zero or many steps
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "name",
    "description",
    "batchSize",
    "threadCount",
    "stopOnError",
    "options",
    "version",
    "steps"
})
@Generated("jsonschema2pojo")
public class FlowSchema {

    /**
     * Unique name for the flow
     * (Required)
     * 
     */
    @JsonProperty("name")
    @JsonPropertyDescription("Unique name for the flow")
    private String name;
    /**
     * Optional description of the flow
     * 
     */
    @JsonProperty("description")
    @JsonPropertyDescription("Optional description of the flow")
    private String description;
    /**
     * Default batch size for every step
     * 
     */
    @JsonProperty("batchSize")
    @JsonPropertyDescription("Default batch size for every step")
    private Double batchSize;
    /**
     * Default thread count for every step
     * 
     */
    @JsonProperty("threadCount")
    @JsonPropertyDescription("Default thread count for every step")
    private Double threadCount;
    /**
     * If true and an error is encountered, the flow run ends, the rest of the source data is ignored, and the remaining steps are not performed. Information about the failure is logged in the job document. Default is false.
     * 
     */
    @JsonProperty("stopOnError")
    @JsonPropertyDescription("If true and an error is encountered, the flow run ends, the rest of the source data is ignored, and the remaining steps are not performed. Information about the failure is logged in the job document. Default is false.")
    private Boolean stopOnError;
    /**
     * Default options for every step. Not yet known what is typically defined here; may be rarely used
     * 
     */
    @JsonProperty("options")
    @JsonPropertyDescription("Default options for every step. Not yet known what is typically defined here; may be rarely used")
    private Options options;
    /**
     * Does not appear to be used for anything
     * 
     */
    @JsonProperty("version")
    @JsonPropertyDescription("Does not appear to be used for anything")
    private Double version;
    @JsonProperty("steps")
    private Steps steps;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * Unique name for the flow
     * (Required)
     * 
     */
    @JsonProperty("name")
    public String getName() {
        return name;
    }

    /**
     * Unique name for the flow
     * (Required)
     * 
     */
    @JsonProperty("name")
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Optional description of the flow
     * 
     */
    @JsonProperty("description")
    public String getDescription() {
        return description;
    }

    /**
     * Optional description of the flow
     * 
     */
    @JsonProperty("description")
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Default batch size for every step
     * 
     */
    @JsonProperty("batchSize")
    public Double getBatchSize() {
        return batchSize;
    }

    /**
     * Default batch size for every step
     * 
     */
    @JsonProperty("batchSize")
    public void setBatchSize(Double batchSize) {
        this.batchSize = batchSize;
    }

    /**
     * Default thread count for every step
     * 
     */
    @JsonProperty("threadCount")
    public Double getThreadCount() {
        return threadCount;
    }

    /**
     * Default thread count for every step
     * 
     */
    @JsonProperty("threadCount")
    public void setThreadCount(Double threadCount) {
        this.threadCount = threadCount;
    }

    /**
     * If true and an error is encountered, the flow run ends, the rest of the source data is ignored, and the remaining steps are not performed. Information about the failure is logged in the job document. Default is false.
     * 
     */
    @JsonProperty("stopOnError")
    public Boolean getStopOnError() {
        return stopOnError;
    }

    /**
     * If true and an error is encountered, the flow run ends, the rest of the source data is ignored, and the remaining steps are not performed. Information about the failure is logged in the job document. Default is false.
     * 
     */
    @JsonProperty("stopOnError")
    public void setStopOnError(Boolean stopOnError) {
        this.stopOnError = stopOnError;
    }

    /**
     * Default options for every step. Not yet known what is typically defined here; may be rarely used
     * 
     */
    @JsonProperty("options")
    public Options getOptions() {
        return options;
    }

    /**
     * Default options for every step. Not yet known what is typically defined here; may be rarely used
     * 
     */
    @JsonProperty("options")
    public void setOptions(Options options) {
        this.options = options;
    }

    /**
     * Does not appear to be used for anything
     * 
     */
    @JsonProperty("version")
    public Double getVersion() {
        return version;
    }

    /**
     * Does not appear to be used for anything
     * 
     */
    @JsonProperty("version")
    public void setVersion(Double version) {
        this.version = version;
    }

    @JsonProperty("steps")
    public Steps getSteps() {
        return steps;
    }

    @JsonProperty("steps")
    public void setSteps(Steps steps) {
        this.steps = steps;
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
        sb.append(FlowSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("name");
        sb.append('=');
        sb.append(((this.name == null)?"<null>":this.name));
        sb.append(',');
        sb.append("description");
        sb.append('=');
        sb.append(((this.description == null)?"<null>":this.description));
        sb.append(',');
        sb.append("batchSize");
        sb.append('=');
        sb.append(((this.batchSize == null)?"<null>":this.batchSize));
        sb.append(',');
        sb.append("threadCount");
        sb.append('=');
        sb.append(((this.threadCount == null)?"<null>":this.threadCount));
        sb.append(',');
        sb.append("stopOnError");
        sb.append('=');
        sb.append(((this.stopOnError == null)?"<null>":this.stopOnError));
        sb.append(',');
        sb.append("options");
        sb.append('=');
        sb.append(((this.options == null)?"<null>":this.options));
        sb.append(',');
        sb.append("version");
        sb.append('=');
        sb.append(((this.version == null)?"<null>":this.version));
        sb.append(',');
        sb.append("steps");
        sb.append('=');
        sb.append(((this.steps == null)?"<null>":this.steps));
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
        result = ((result* 31)+((this.stopOnError == null)? 0 :this.stopOnError.hashCode()));
        result = ((result* 31)+((this.name == null)? 0 :this.name.hashCode()));
        result = ((result* 31)+((this.options == null)? 0 :this.options.hashCode()));
        result = ((result* 31)+((this.description == null)? 0 :this.description.hashCode()));
        result = ((result* 31)+((this.threadCount == null)? 0 :this.threadCount.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.batchSize == null)? 0 :this.batchSize.hashCode()));
        result = ((result* 31)+((this.version == null)? 0 :this.version.hashCode()));
        result = ((result* 31)+((this.steps == null)? 0 :this.steps.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof FlowSchema) == false) {
            return false;
        }
        FlowSchema rhs = ((FlowSchema) other);
        return ((((((((((this.stopOnError == rhs.stopOnError)||((this.stopOnError!= null)&&this.stopOnError.equals(rhs.stopOnError)))&&((this.name == rhs.name)||((this.name!= null)&&this.name.equals(rhs.name))))&&((this.options == rhs.options)||((this.options!= null)&&this.options.equals(rhs.options))))&&((this.description == rhs.description)||((this.description!= null)&&this.description.equals(rhs.description))))&&((this.threadCount == rhs.threadCount)||((this.threadCount!= null)&&this.threadCount.equals(rhs.threadCount))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.batchSize == rhs.batchSize)||((this.batchSize!= null)&&this.batchSize.equals(rhs.batchSize))))&&((this.version == rhs.version)||((this.version!= null)&&this.version.equals(rhs.version))))&&((this.steps == rhs.steps)||((this.steps!= null)&&this.steps.equals(rhs.steps))));
    }

}
