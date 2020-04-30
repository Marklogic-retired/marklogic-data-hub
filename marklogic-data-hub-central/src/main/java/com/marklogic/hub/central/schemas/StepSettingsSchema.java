
package com.marklogic.hub.central.schemas;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.annotation.JsonValue;


/**
 * StepSettings.v1
 * <p>
 * Settings for a step. This is a logical structure to simplify front-end/middle-tier APIs
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "customHook",
    "provenanceGranularityLevel",
    "outputPermissions",
    "targetFormat",
    "targetDatabase",
    "sourceDatabase",
    "outputCollections",
    "defaultOutputCollections",
    "targetCollections"
})
public class StepSettingsSchema {

    @JsonProperty("customHook")
    private CustomHook__1 customHook;
    @JsonProperty("provenanceGranularityLevel")
    private StepSettingsSchema.ProvenanceGranularityLevel provenanceGranularityLevel;
    @JsonProperty("outputPermissions")
    private String outputPermissions;
    @JsonProperty("targetFormat")
    private StepSettingsSchema.TargetFormat targetFormat;
    @JsonProperty("targetDatabase")
    private String targetDatabase;
    @JsonProperty("sourceDatabase")
    private String sourceDatabase;
    @JsonProperty("outputCollections")
    private List<String> outputCollections = new ArrayList<String>();
    @JsonProperty("defaultOutputCollections")
    private List<String> defaultOutputCollections = new ArrayList<String>();
    @JsonProperty("targetCollections")
    private TargetCollections targetCollections;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("customHook")
    public CustomHook__1 getCustomHook() {
        return customHook;
    }

    @JsonProperty("customHook")
    public void setCustomHook(CustomHook__1 customHook) {
        this.customHook = customHook;
    }

    @JsonProperty("provenanceGranularityLevel")
    public StepSettingsSchema.ProvenanceGranularityLevel getProvenanceGranularityLevel() {
        return provenanceGranularityLevel;
    }

    @JsonProperty("provenanceGranularityLevel")
    public void setProvenanceGranularityLevel(StepSettingsSchema.ProvenanceGranularityLevel provenanceGranularityLevel) {
        this.provenanceGranularityLevel = provenanceGranularityLevel;
    }

    @JsonProperty("outputPermissions")
    public String getOutputPermissions() {
        return outputPermissions;
    }

    @JsonProperty("outputPermissions")
    public void setOutputPermissions(String outputPermissions) {
        this.outputPermissions = outputPermissions;
    }

    @JsonProperty("targetFormat")
    public StepSettingsSchema.TargetFormat getTargetFormat() {
        return targetFormat;
    }

    @JsonProperty("targetFormat")
    public void setTargetFormat(StepSettingsSchema.TargetFormat targetFormat) {
        this.targetFormat = targetFormat;
    }

    @JsonProperty("targetDatabase")
    public String getTargetDatabase() {
        return targetDatabase;
    }

    @JsonProperty("targetDatabase")
    public void setTargetDatabase(String targetDatabase) {
        this.targetDatabase = targetDatabase;
    }

    @JsonProperty("sourceDatabase")
    public String getSourceDatabase() {
        return sourceDatabase;
    }

    @JsonProperty("sourceDatabase")
    public void setSourceDatabase(String sourceDatabase) {
        this.sourceDatabase = sourceDatabase;
    }

    @JsonProperty("outputCollections")
    public List<String> getOutputCollections() {
        return outputCollections;
    }

    @JsonProperty("outputCollections")
    public void setOutputCollections(List<String> outputCollections) {
        this.outputCollections = outputCollections;
    }

    @JsonProperty("defaultOutputCollections")
    public List<String> getDefaultOutputCollections() {
        return defaultOutputCollections;
    }

    @JsonProperty("defaultOutputCollections")
    public void setDefaultOutputCollections(List<String> defaultOutputCollections) {
        this.defaultOutputCollections = defaultOutputCollections;
    }

    @JsonProperty("targetCollections")
    public TargetCollections getTargetCollections() {
        return targetCollections;
    }

    @JsonProperty("targetCollections")
    public void setTargetCollections(TargetCollections targetCollections) {
        this.targetCollections = targetCollections;
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
        sb.append(StepSettingsSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("customHook");
        sb.append('=');
        sb.append(((this.customHook == null)?"<null>":this.customHook));
        sb.append(',');
        sb.append("provenanceGranularityLevel");
        sb.append('=');
        sb.append(((this.provenanceGranularityLevel == null)?"<null>":this.provenanceGranularityLevel));
        sb.append(',');
        sb.append("outputPermissions");
        sb.append('=');
        sb.append(((this.outputPermissions == null)?"<null>":this.outputPermissions));
        sb.append(',');
        sb.append("targetFormat");
        sb.append('=');
        sb.append(((this.targetFormat == null)?"<null>":this.targetFormat));
        sb.append(',');
        sb.append("targetDatabase");
        sb.append('=');
        sb.append(((this.targetDatabase == null)?"<null>":this.targetDatabase));
        sb.append(',');
        sb.append("sourceDatabase");
        sb.append('=');
        sb.append(((this.sourceDatabase == null)?"<null>":this.sourceDatabase));
        sb.append(',');
        sb.append("outputCollections");
        sb.append('=');
        sb.append(((this.outputCollections == null)?"<null>":this.outputCollections));
        sb.append(',');
        sb.append("defaultOutputCollections");
        sb.append('=');
        sb.append(((this.defaultOutputCollections == null)?"<null>":this.defaultOutputCollections));
        sb.append(',');
        sb.append("targetCollections");
        sb.append('=');
        sb.append(((this.targetCollections == null)?"<null>":this.targetCollections));
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
        result = ((result* 31)+((this.outputPermissions == null)? 0 :this.outputPermissions.hashCode()));
        result = ((result* 31)+((this.defaultOutputCollections == null)? 0 :this.defaultOutputCollections.hashCode()));
        result = ((result* 31)+((this.provenanceGranularityLevel == null)? 0 :this.provenanceGranularityLevel.hashCode()));
        result = ((result* 31)+((this.outputCollections == null)? 0 :this.outputCollections.hashCode()));
        result = ((result* 31)+((this.sourceDatabase == null)? 0 :this.sourceDatabase.hashCode()));
        result = ((result* 31)+((this.customHook == null)? 0 :this.customHook.hashCode()));
        result = ((result* 31)+((this.targetFormat == null)? 0 :this.targetFormat.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.targetCollections == null)? 0 :this.targetCollections.hashCode()));
        result = ((result* 31)+((this.targetDatabase == null)? 0 :this.targetDatabase.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof StepSettingsSchema) == false) {
            return false;
        }
        StepSettingsSchema rhs = ((StepSettingsSchema) other);
        return (((((((((((this.outputPermissions == rhs.outputPermissions)||((this.outputPermissions!= null)&&this.outputPermissions.equals(rhs.outputPermissions)))&&((this.defaultOutputCollections == rhs.defaultOutputCollections)||((this.defaultOutputCollections!= null)&&this.defaultOutputCollections.equals(rhs.defaultOutputCollections))))&&((this.provenanceGranularityLevel == rhs.provenanceGranularityLevel)||((this.provenanceGranularityLevel!= null)&&this.provenanceGranularityLevel.equals(rhs.provenanceGranularityLevel))))&&((this.outputCollections == rhs.outputCollections)||((this.outputCollections!= null)&&this.outputCollections.equals(rhs.outputCollections))))&&((this.sourceDatabase == rhs.sourceDatabase)||((this.sourceDatabase!= null)&&this.sourceDatabase.equals(rhs.sourceDatabase))))&&((this.customHook == rhs.customHook)||((this.customHook!= null)&&this.customHook.equals(rhs.customHook))))&&((this.targetFormat == rhs.targetFormat)||((this.targetFormat!= null)&&this.targetFormat.equals(rhs.targetFormat))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.targetCollections == rhs.targetCollections)||((this.targetCollections!= null)&&this.targetCollections.equals(rhs.targetCollections))))&&((this.targetDatabase == rhs.targetDatabase)||((this.targetDatabase!= null)&&this.targetDatabase.equals(rhs.targetDatabase))));
    }

    public enum ProvenanceGranularityLevel {

        OFF("off"),
        COARSE("coarse"),
        FINE("fine");
        private final String value;
        private final static Map<String, StepSettingsSchema.ProvenanceGranularityLevel> CONSTANTS = new HashMap<String, StepSettingsSchema.ProvenanceGranularityLevel>();

        static {
            for (StepSettingsSchema.ProvenanceGranularityLevel c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        private ProvenanceGranularityLevel(String value) {
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
        public static StepSettingsSchema.ProvenanceGranularityLevel fromValue(String value) {
            StepSettingsSchema.ProvenanceGranularityLevel constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

    public enum TargetFormat {

        JSON("json"),
        XML("xml");
        private final String value;
        private final static Map<String, StepSettingsSchema.TargetFormat> CONSTANTS = new HashMap<String, StepSettingsSchema.TargetFormat>();

        static {
            for (StepSettingsSchema.TargetFormat c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        private TargetFormat(String value) {
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
        public static StepSettingsSchema.TargetFormat fromValue(String value) {
            StepSettingsSchema.TargetFormat constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
