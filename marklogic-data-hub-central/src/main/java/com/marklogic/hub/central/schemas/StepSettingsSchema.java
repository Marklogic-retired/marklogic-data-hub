
package com.marklogic.hub.central.schemas;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.annotation.JsonValue;


/**
 * StepSettings
 * <p>
 * Settings for a step. This is a logical structure to simplify front-end/middle-tier APIs
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "customHook",
    "provenanceGranularityLevel",
    "permissions",
    "targetFormat",
    "targetDatabase",
    "sourceDatabase",
    "collections",
    "additionalCollections",
    "targetCollections"
})
public class StepSettingsSchema {

    /**
     * CustomHook
     * <p>
     * 
     * 
     */
    @JsonProperty("customHook")
    private CustomHookSchema customHook;
    @JsonProperty("provenanceGranularityLevel")
    private StepSettingsSchema.ProvenanceGranularityLevel provenanceGranularityLevel;
    @JsonProperty("permissions")
    private String permissions;
    @JsonProperty("targetFormat")
    private StepSettingsSchema.TargetFormat targetFormat;
    @JsonProperty("targetDatabase")
    private String targetDatabase;
    @JsonProperty("sourceDatabase")
    private String sourceDatabase;
    @JsonProperty("collections")
    private List<String> collections = new ArrayList<String>();
    @JsonProperty("additionalCollections")
    private List<String> additionalCollections = new ArrayList<String>();
    @JsonProperty("targetCollections")
    private TargetCollections targetCollections;

    /**
     * CustomHook
     * <p>
     * 
     * 
     */
    @JsonProperty("customHook")
    public CustomHookSchema getCustomHook() {
        return customHook;
    }

    /**
     * CustomHook
     * <p>
     * 
     * 
     */
    @JsonProperty("customHook")
    public void setCustomHook(CustomHookSchema customHook) {
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

    @JsonProperty("permissions")
    public String getPermissions() {
        return permissions;
    }

    @JsonProperty("permissions")
    public void setPermissions(String permissions) {
        this.permissions = permissions;
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

    @JsonProperty("collections")
    public List<String> getCollections() {
        return collections;
    }

    @JsonProperty("collections")
    public void setCollections(List<String> collections) {
        this.collections = collections;
    }

    @JsonProperty("additionalCollections")
    public List<String> getAdditionalCollections() {
        return additionalCollections;
    }

    @JsonProperty("additionalCollections")
    public void setAdditionalCollections(List<String> additionalCollections) {
        this.additionalCollections = additionalCollections;
    }

    @JsonProperty("targetCollections")
    public TargetCollections getTargetCollections() {
        return targetCollections;
    }

    @JsonProperty("targetCollections")
    public void setTargetCollections(TargetCollections targetCollections) {
        this.targetCollections = targetCollections;
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
        sb.append("permissions");
        sb.append('=');
        sb.append(((this.permissions == null)?"<null>":this.permissions));
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
        sb.append("collections");
        sb.append('=');
        sb.append(((this.collections == null)?"<null>":this.collections));
        sb.append(',');
        sb.append("additionalCollections");
        sb.append('=');
        sb.append(((this.additionalCollections == null)?"<null>":this.additionalCollections));
        sb.append(',');
        sb.append("targetCollections");
        sb.append('=');
        sb.append(((this.targetCollections == null)?"<null>":this.targetCollections));
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
        result = ((result* 31)+((this.additionalCollections == null)? 0 :this.additionalCollections.hashCode()));
        result = ((result* 31)+((this.provenanceGranularityLevel == null)? 0 :this.provenanceGranularityLevel.hashCode()));
        result = ((result* 31)+((this.sourceDatabase == null)? 0 :this.sourceDatabase.hashCode()));
        result = ((result* 31)+((this.collections == null)? 0 :this.collections.hashCode()));
        result = ((result* 31)+((this.permissions == null)? 0 :this.permissions.hashCode()));
        result = ((result* 31)+((this.customHook == null)? 0 :this.customHook.hashCode()));
        result = ((result* 31)+((this.targetFormat == null)? 0 :this.targetFormat.hashCode()));
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
        return ((((((((((this.additionalCollections == rhs.additionalCollections)||((this.additionalCollections!= null)&&this.additionalCollections.equals(rhs.additionalCollections)))&&((this.provenanceGranularityLevel == rhs.provenanceGranularityLevel)||((this.provenanceGranularityLevel!= null)&&this.provenanceGranularityLevel.equals(rhs.provenanceGranularityLevel))))&&((this.sourceDatabase == rhs.sourceDatabase)||((this.sourceDatabase!= null)&&this.sourceDatabase.equals(rhs.sourceDatabase))))&&((this.collections == rhs.collections)||((this.collections!= null)&&this.collections.equals(rhs.collections))))&&((this.permissions == rhs.permissions)||((this.permissions!= null)&&this.permissions.equals(rhs.permissions))))&&((this.customHook == rhs.customHook)||((this.customHook!= null)&&this.customHook.equals(rhs.customHook))))&&((this.targetFormat == rhs.targetFormat)||((this.targetFormat!= null)&&this.targetFormat.equals(rhs.targetFormat))))&&((this.targetCollections == rhs.targetCollections)||((this.targetCollections!= null)&&this.targetCollections.equals(rhs.targetCollections))))&&((this.targetDatabase == rhs.targetDatabase)||((this.targetDatabase!= null)&&this.targetDatabase.equals(rhs.targetDatabase))));
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
