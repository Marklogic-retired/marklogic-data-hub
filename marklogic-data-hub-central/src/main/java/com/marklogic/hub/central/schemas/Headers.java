
package com.marklogic.hub.central.schemas;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


/**
 * Container for what can typically be considered metadata that pertains to the instance data in the envelope
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "createdBy",
    "createdOn",
    "createdUsingFile",
    "datahub",
    "id",
    "merges",
    "merge-options",
    "sources"
})
public class Headers {

    /**
     * MarkLogic user that created this document
     * 
     */
    @JsonProperty("createdBy")
    @JsonPropertyDescription("MarkLogic user that created this document")
    private String createdBy;
    /**
     * dateTime at which this document was created
     * 
     */
    @JsonProperty("createdOn")
    @JsonPropertyDescription("dateTime at which this document was created")
    private String createdOn;
    /**
     * Will be set when running an ingestion step via DHF and ingesting CSV files
     * 
     */
    @JsonProperty("createdUsingFile")
    @JsonPropertyDescription("Will be set when running an ingestion step via DHF and ingesting CSV files")
    private String createdUsingFile;
    /**
     * Intended to store all DHF-specific headers in the future
     * 
     */
    @JsonProperty("datahub")
    @JsonPropertyDescription("Intended to store all DHF-specific headers in the future")
    private Datahub datahub;
    /**
     * Appears to be set as part of mastering
     * 
     */
    @JsonProperty("id")
    @JsonPropertyDescription("Appears to be set as part of mastering")
    private List<String> id = new ArrayList<String>();
    @JsonProperty("merges")
    private List<Merge> merges = new ArrayList<Merge>();
    @JsonProperty("merge-options")
    private MergeOptions mergeOptions;
    @JsonProperty("sources")
    private List<Source> sources = new ArrayList<Source>();
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * MarkLogic user that created this document
     * 
     */
    @JsonProperty("createdBy")
    public String getCreatedBy() {
        return createdBy;
    }

    /**
     * MarkLogic user that created this document
     * 
     */
    @JsonProperty("createdBy")
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    /**
     * dateTime at which this document was created
     * 
     */
    @JsonProperty("createdOn")
    public String getCreatedOn() {
        return createdOn;
    }

    /**
     * dateTime at which this document was created
     * 
     */
    @JsonProperty("createdOn")
    public void setCreatedOn(String createdOn) {
        this.createdOn = createdOn;
    }

    /**
     * Will be set when running an ingestion step via DHF and ingesting CSV files
     * 
     */
    @JsonProperty("createdUsingFile")
    public String getCreatedUsingFile() {
        return createdUsingFile;
    }

    /**
     * Will be set when running an ingestion step via DHF and ingesting CSV files
     * 
     */
    @JsonProperty("createdUsingFile")
    public void setCreatedUsingFile(String createdUsingFile) {
        this.createdUsingFile = createdUsingFile;
    }

    /**
     * Intended to store all DHF-specific headers in the future
     * 
     */
    @JsonProperty("datahub")
    public Datahub getDatahub() {
        return datahub;
    }

    /**
     * Intended to store all DHF-specific headers in the future
     * 
     */
    @JsonProperty("datahub")
    public void setDatahub(Datahub datahub) {
        this.datahub = datahub;
    }

    /**
     * Appears to be set as part of mastering
     * 
     */
    @JsonProperty("id")
    public List<String> getId() {
        return id;
    }

    /**
     * Appears to be set as part of mastering
     * 
     */
    @JsonProperty("id")
    public void setId(List<String> id) {
        this.id = id;
    }

    @JsonProperty("merges")
    public List<Merge> getMerges() {
        return merges;
    }

    @JsonProperty("merges")
    public void setMerges(List<Merge> merges) {
        this.merges = merges;
    }

    @JsonProperty("merge-options")
    public MergeOptions getMergeOptions() {
        return mergeOptions;
    }

    @JsonProperty("merge-options")
    public void setMergeOptions(MergeOptions mergeOptions) {
        this.mergeOptions = mergeOptions;
    }

    @JsonProperty("sources")
    public List<Source> getSources() {
        return sources;
    }

    @JsonProperty("sources")
    public void setSources(List<Source> sources) {
        this.sources = sources;
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
        sb.append(Headers.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("createdBy");
        sb.append('=');
        sb.append(((this.createdBy == null)?"<null>":this.createdBy));
        sb.append(',');
        sb.append("createdOn");
        sb.append('=');
        sb.append(((this.createdOn == null)?"<null>":this.createdOn));
        sb.append(',');
        sb.append("createdUsingFile");
        sb.append('=');
        sb.append(((this.createdUsingFile == null)?"<null>":this.createdUsingFile));
        sb.append(',');
        sb.append("datahub");
        sb.append('=');
        sb.append(((this.datahub == null)?"<null>":this.datahub));
        sb.append(',');
        sb.append("id");
        sb.append('=');
        sb.append(((this.id == null)?"<null>":this.id));
        sb.append(',');
        sb.append("merges");
        sb.append('=');
        sb.append(((this.merges == null)?"<null>":this.merges));
        sb.append(',');
        sb.append("mergeOptions");
        sb.append('=');
        sb.append(((this.mergeOptions == null)?"<null>":this.mergeOptions));
        sb.append(',');
        sb.append("sources");
        sb.append('=');
        sb.append(((this.sources == null)?"<null>":this.sources));
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
        result = ((result* 31)+((this.sources == null)? 0 :this.sources.hashCode()));
        result = ((result* 31)+((this.createdBy == null)? 0 :this.createdBy.hashCode()));
        result = ((result* 31)+((this.createdUsingFile == null)? 0 :this.createdUsingFile.hashCode()));
        result = ((result* 31)+((this.mergeOptions == null)? 0 :this.mergeOptions.hashCode()));
        result = ((result* 31)+((this.id == null)? 0 :this.id.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.createdOn == null)? 0 :this.createdOn.hashCode()));
        result = ((result* 31)+((this.datahub == null)? 0 :this.datahub.hashCode()));
        result = ((result* 31)+((this.merges == null)? 0 :this.merges.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Headers) == false) {
            return false;
        }
        Headers rhs = ((Headers) other);
        return ((((((((((this.sources == rhs.sources)||((this.sources!= null)&&this.sources.equals(rhs.sources)))&&((this.createdBy == rhs.createdBy)||((this.createdBy!= null)&&this.createdBy.equals(rhs.createdBy))))&&((this.createdUsingFile == rhs.createdUsingFile)||((this.createdUsingFile!= null)&&this.createdUsingFile.equals(rhs.createdUsingFile))))&&((this.mergeOptions == rhs.mergeOptions)||((this.mergeOptions!= null)&&this.mergeOptions.equals(rhs.mergeOptions))))&&((this.id == rhs.id)||((this.id!= null)&&this.id.equals(rhs.id))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.createdOn == rhs.createdOn)||((this.createdOn!= null)&&this.createdOn.equals(rhs.createdOn))))&&((this.datahub == rhs.datahub)||((this.datahub!= null)&&this.datahub.equals(rhs.datahub))))&&((this.merges == rhs.merges)||((this.merges!= null)&&this.merges.equals(rhs.merges))));
    }

}
