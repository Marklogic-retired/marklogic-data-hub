
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
 * Defines properties that affect how a document is inserted
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "collections",
    "originalCollections",
    "permissions",
    "metadata",
    "quality"
})
public class Context {

    /**
     * The collections to be included when the document is inserted; not populated when passed to a step module; intended to be populated by a step module
     * 
     */
    @JsonProperty("collections")
    @JsonPropertyDescription("The collections to be included when the document is inserted; not populated when passed to a step module; intended to be populated by a step module")
    private List<String> collections = new ArrayList<String>();
    /**
     * The collections that exist on the document
     * 
     */
    @JsonProperty("originalCollections")
    @JsonPropertyDescription("The collections that exist on the document")
    private List<String> originalCollections = new ArrayList<String>();
    /**
     * The permissions to be included when the document is inserted
     * 
     */
    @JsonProperty("permissions")
    @JsonPropertyDescription("The permissions to be included when the document is inserted")
    private List<Permission> permissions = new ArrayList<Permission>();
    /**
     * The metadata keys and values to be included when the document is inserted
     * 
     */
    @JsonProperty("metadata")
    @JsonPropertyDescription("The metadata keys and values to be included when the document is inserted")
    private Metadata metadata;
    /**
     * The quality of documents to be inserted
     * 
     */
    @JsonProperty("quality")
    @JsonPropertyDescription("The quality of documents to be inserted")
    private Integer quality;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * The collections to be included when the document is inserted; not populated when passed to a step module; intended to be populated by a step module
     * 
     */
    @JsonProperty("collections")
    public List<String> getCollections() {
        return collections;
    }

    /**
     * The collections to be included when the document is inserted; not populated when passed to a step module; intended to be populated by a step module
     * 
     */
    @JsonProperty("collections")
    public void setCollections(List<String> collections) {
        this.collections = collections;
    }

    /**
     * The collections that exist on the document
     * 
     */
    @JsonProperty("originalCollections")
    public List<String> getOriginalCollections() {
        return originalCollections;
    }

    /**
     * The collections that exist on the document
     * 
     */
    @JsonProperty("originalCollections")
    public void setOriginalCollections(List<String> originalCollections) {
        this.originalCollections = originalCollections;
    }

    /**
     * The permissions to be included when the document is inserted
     * 
     */
    @JsonProperty("permissions")
    public List<Permission> getPermissions() {
        return permissions;
    }

    /**
     * The permissions to be included when the document is inserted
     * 
     */
    @JsonProperty("permissions")
    public void setPermissions(List<Permission> permissions) {
        this.permissions = permissions;
    }

    /**
     * The metadata keys and values to be included when the document is inserted
     * 
     */
    @JsonProperty("metadata")
    public Metadata getMetadata() {
        return metadata;
    }

    /**
     * The metadata keys and values to be included when the document is inserted
     * 
     */
    @JsonProperty("metadata")
    public void setMetadata(Metadata metadata) {
        this.metadata = metadata;
    }

    /**
     * The quality of documents to be inserted
     * 
     */
    @JsonProperty("quality")
    public Integer getQuality() {
        return quality;
    }

    /**
     * The quality of documents to be inserted
     * 
     */
    @JsonProperty("quality")
    public void setQuality(Integer quality) {
        this.quality = quality;
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
        sb.append(Context.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("collections");
        sb.append('=');
        sb.append(((this.collections == null)?"<null>":this.collections));
        sb.append(',');
        sb.append("originalCollections");
        sb.append('=');
        sb.append(((this.originalCollections == null)?"<null>":this.originalCollections));
        sb.append(',');
        sb.append("permissions");
        sb.append('=');
        sb.append(((this.permissions == null)?"<null>":this.permissions));
        sb.append(',');
        sb.append("metadata");
        sb.append('=');
        sb.append(((this.metadata == null)?"<null>":this.metadata));
        sb.append(',');
        sb.append("quality");
        sb.append('=');
        sb.append(((this.quality == null)?"<null>":this.quality));
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
        result = ((result* 31)+((this.metadata == null)? 0 :this.metadata.hashCode()));
        result = ((result* 31)+((this.collections == null)? 0 :this.collections.hashCode()));
        result = ((result* 31)+((this.permissions == null)? 0 :this.permissions.hashCode()));
        result = ((result* 31)+((this.originalCollections == null)? 0 :this.originalCollections.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.quality == null)? 0 :this.quality.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Context) == false) {
            return false;
        }
        Context rhs = ((Context) other);
        return (((((((this.metadata == rhs.metadata)||((this.metadata!= null)&&this.metadata.equals(rhs.metadata)))&&((this.collections == rhs.collections)||((this.collections!= null)&&this.collections.equals(rhs.collections))))&&((this.permissions == rhs.permissions)||((this.permissions!= null)&&this.permissions.equals(rhs.permissions))))&&((this.originalCollections == rhs.originalCollections)||((this.originalCollections!= null)&&this.originalCollections.equals(rhs.originalCollections))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.quality == rhs.quality)||((this.quality!= null)&&this.quality.equals(rhs.quality))));
    }

}
