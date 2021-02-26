
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
 * MappingStep
 * <p>
 * 
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "properties",
    "relatedEntityMappings"
})
public class MappingStepSchema {

    /**
     * MappingProperties
     * <p>
     * 
     * 
     */
    @JsonProperty("properties")
    private MappingPropertiesSchema properties;
    /**
     * additional collections provided by the user that get applied to the step output
     * 
     */
    @JsonProperty("relatedEntityMappings")
    @JsonPropertyDescription("additional collections provided by the user that get applied to the step output")
    private List<RelatedEntityMapping> relatedEntityMappings = new ArrayList<RelatedEntityMapping>();
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * MappingProperties
     * <p>
     * 
     * 
     */
    @JsonProperty("properties")
    public MappingPropertiesSchema getProperties() {
        return properties;
    }

    /**
     * MappingProperties
     * <p>
     * 
     * 
     */
    @JsonProperty("properties")
    public void setProperties(MappingPropertiesSchema properties) {
        this.properties = properties;
    }

    /**
     * additional collections provided by the user that get applied to the step output
     * 
     */
    @JsonProperty("relatedEntityMappings")
    public List<RelatedEntityMapping> getRelatedEntityMappings() {
        return relatedEntityMappings;
    }

    /**
     * additional collections provided by the user that get applied to the step output
     * 
     */
    @JsonProperty("relatedEntityMappings")
    public void setRelatedEntityMappings(List<RelatedEntityMapping> relatedEntityMappings) {
        this.relatedEntityMappings = relatedEntityMappings;
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
        sb.append(MappingStepSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("properties");
        sb.append('=');
        sb.append(((this.properties == null)?"<null>":this.properties));
        sb.append(',');
        sb.append("relatedEntityMappings");
        sb.append('=');
        sb.append(((this.relatedEntityMappings == null)?"<null>":this.relatedEntityMappings));
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
        result = ((result* 31)+((this.relatedEntityMappings == null)? 0 :this.relatedEntityMappings.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.properties == null)? 0 :this.properties.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof MappingStepSchema) == false) {
            return false;
        }
        MappingStepSchema rhs = ((MappingStepSchema) other);
        return ((((this.relatedEntityMappings == rhs.relatedEntityMappings)||((this.relatedEntityMappings!= null)&&this.relatedEntityMappings.equals(rhs.relatedEntityMappings)))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.properties == rhs.properties)||((this.properties!= null)&&this.properties.equals(rhs.properties))));
    }

}
