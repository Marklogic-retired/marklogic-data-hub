
package com.marklogic.hub.central.schemas;

import java.util.Date;
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

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "entityName",
    "entityTypeId",
    "entityInstanceCount",
    "latestJobId",
    "latestJobDateTime",
    "model"
})
@Generated("jsonschema2pojo")
public class PrimaryEntityType {

    /**
     * Corresponds to the value of info.title in the model
     * (Required)
     * 
     */
    @JsonProperty("entityName")
    @JsonPropertyDescription("Corresponds to the value of info.title in the model")
    private String entityName;
    /**
     * Unique identifier for an entity type that combines the entity name, base URI, and version number
     * 
     */
    @JsonProperty("entityTypeId")
    @JsonPropertyDescription("Unique identifier for an entity type that combines the entity name, base URI, and version number")
    private String entityTypeId;
    @JsonProperty("entityInstanceCount")
    private Double entityInstanceCount;
    /**
     * If at least one instance of this type has been processed by a job, then this will contain the ID of the most recent such job.
     * 
     */
    @JsonProperty("latestJobId")
    @JsonPropertyDescription("If at least one instance of this type has been processed by a job, then this will contain the ID of the most recent such job.")
    private String latestJobId;
    /**
     * If latestJobId is populated, then this will contain the dateTime of the most entity instance of this type most recently processed.
     * 
     */
    @JsonProperty("latestJobDateTime")
    @JsonPropertyDescription("If latestJobId is populated, then this will contain the dateTime of the most entity instance of this type most recently processed.")
    private Date latestJobDateTime;
    /**
     * ModelDescriptor
     * <p>
     * JSON schema representation of a MarkLogic Entity Services model
     * (Required)
     * 
     */
    @JsonProperty("model")
    @JsonPropertyDescription("JSON schema representation of a MarkLogic Entity Services model")
    private ModelDescriptor model;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * Corresponds to the value of info.title in the model
     * (Required)
     * 
     */
    @JsonProperty("entityName")
    public String getEntityName() {
        return entityName;
    }

    /**
     * Corresponds to the value of info.title in the model
     * (Required)
     * 
     */
    @JsonProperty("entityName")
    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    /**
     * Unique identifier for an entity type that combines the entity name, base URI, and version number
     * 
     */
    @JsonProperty("entityTypeId")
    public String getEntityTypeId() {
        return entityTypeId;
    }

    /**
     * Unique identifier for an entity type that combines the entity name, base URI, and version number
     * 
     */
    @JsonProperty("entityTypeId")
    public void setEntityTypeId(String entityTypeId) {
        this.entityTypeId = entityTypeId;
    }

    @JsonProperty("entityInstanceCount")
    public Double getEntityInstanceCount() {
        return entityInstanceCount;
    }

    @JsonProperty("entityInstanceCount")
    public void setEntityInstanceCount(Double entityInstanceCount) {
        this.entityInstanceCount = entityInstanceCount;
    }

    /**
     * If at least one instance of this type has been processed by a job, then this will contain the ID of the most recent such job.
     * 
     */
    @JsonProperty("latestJobId")
    public String getLatestJobId() {
        return latestJobId;
    }

    /**
     * If at least one instance of this type has been processed by a job, then this will contain the ID of the most recent such job.
     * 
     */
    @JsonProperty("latestJobId")
    public void setLatestJobId(String latestJobId) {
        this.latestJobId = latestJobId;
    }

    /**
     * If latestJobId is populated, then this will contain the dateTime of the most entity instance of this type most recently processed.
     * 
     */
    @JsonProperty("latestJobDateTime")
    public Date getLatestJobDateTime() {
        return latestJobDateTime;
    }

    /**
     * If latestJobId is populated, then this will contain the dateTime of the most entity instance of this type most recently processed.
     * 
     */
    @JsonProperty("latestJobDateTime")
    public void setLatestJobDateTime(Date latestJobDateTime) {
        this.latestJobDateTime = latestJobDateTime;
    }

    /**
     * ModelDescriptor
     * <p>
     * JSON schema representation of a MarkLogic Entity Services model
     * (Required)
     * 
     */
    @JsonProperty("model")
    public ModelDescriptor getModel() {
        return model;
    }

    /**
     * ModelDescriptor
     * <p>
     * JSON schema representation of a MarkLogic Entity Services model
     * (Required)
     * 
     */
    @JsonProperty("model")
    public void setModel(ModelDescriptor model) {
        this.model = model;
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
        sb.append(PrimaryEntityType.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("entityName");
        sb.append('=');
        sb.append(((this.entityName == null)?"<null>":this.entityName));
        sb.append(',');
        sb.append("entityTypeId");
        sb.append('=');
        sb.append(((this.entityTypeId == null)?"<null>":this.entityTypeId));
        sb.append(',');
        sb.append("entityInstanceCount");
        sb.append('=');
        sb.append(((this.entityInstanceCount == null)?"<null>":this.entityInstanceCount));
        sb.append(',');
        sb.append("latestJobId");
        sb.append('=');
        sb.append(((this.latestJobId == null)?"<null>":this.latestJobId));
        sb.append(',');
        sb.append("latestJobDateTime");
        sb.append('=');
        sb.append(((this.latestJobDateTime == null)?"<null>":this.latestJobDateTime));
        sb.append(',');
        sb.append("model");
        sb.append('=');
        sb.append(((this.model == null)?"<null>":this.model));
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
        result = ((result* 31)+((this.latestJobDateTime == null)? 0 :this.latestJobDateTime.hashCode()));
        result = ((result* 31)+((this.entityName == null)? 0 :this.entityName.hashCode()));
        result = ((result* 31)+((this.entityInstanceCount == null)? 0 :this.entityInstanceCount.hashCode()));
        result = ((result* 31)+((this.entityTypeId == null)? 0 :this.entityTypeId.hashCode()));
        result = ((result* 31)+((this.model == null)? 0 :this.model.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.latestJobId == null)? 0 :this.latestJobId.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof PrimaryEntityType) == false) {
            return false;
        }
        PrimaryEntityType rhs = ((PrimaryEntityType) other);
        return ((((((((this.latestJobDateTime == rhs.latestJobDateTime)||((this.latestJobDateTime!= null)&&this.latestJobDateTime.equals(rhs.latestJobDateTime)))&&((this.entityName == rhs.entityName)||((this.entityName!= null)&&this.entityName.equals(rhs.entityName))))&&((this.entityInstanceCount == rhs.entityInstanceCount)||((this.entityInstanceCount!= null)&&this.entityInstanceCount.equals(rhs.entityInstanceCount))))&&((this.entityTypeId == rhs.entityTypeId)||((this.entityTypeId!= null)&&this.entityTypeId.equals(rhs.entityTypeId))))&&((this.model == rhs.model)||((this.model!= null)&&this.model.equals(rhs.model))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.latestJobId == rhs.latestJobId)||((this.latestJobId!= null)&&this.latestJobId.equals(rhs.latestJobId))));
    }

}
