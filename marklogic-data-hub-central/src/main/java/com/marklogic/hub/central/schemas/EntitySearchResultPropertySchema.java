
package com.marklogic.hub.central.schemas;

import java.util.HashMap;
import java.util.Map;
import javax.annotation.Generated;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


/**
 * EntitySearchResultProperty
 * <p>
 * Defines a property of an entity instance within a search result
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "propertyPath",
    "propertyValue"
})
@Generated("jsonschema2pojo")
public class EntitySearchResultPropertySchema {

    @JsonProperty("propertyPath")
    private Double propertyPath;
    @JsonProperty("propertyValue")
    private Object propertyValue;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("propertyPath")
    public Double getPropertyPath() {
        return propertyPath;
    }

    @JsonProperty("propertyPath")
    public void setPropertyPath(Double propertyPath) {
        this.propertyPath = propertyPath;
    }

    @JsonProperty("propertyValue")
    public Object getPropertyValue() {
        return propertyValue;
    }

    @JsonProperty("propertyValue")
    public void setPropertyValue(Object propertyValue) {
        this.propertyValue = propertyValue;
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
        sb.append(EntitySearchResultPropertySchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("propertyPath");
        sb.append('=');
        sb.append(((this.propertyPath == null)?"<null>":this.propertyPath));
        sb.append(',');
        sb.append("propertyValue");
        sb.append('=');
        sb.append(((this.propertyValue == null)?"<null>":this.propertyValue));
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
        result = ((result* 31)+((this.propertyValue == null)? 0 :this.propertyValue.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.propertyPath == null)? 0 :this.propertyPath.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof EntitySearchResultPropertySchema) == false) {
            return false;
        }
        EntitySearchResultPropertySchema rhs = ((EntitySearchResultPropertySchema) other);
        return ((((this.propertyValue == rhs.propertyValue)||((this.propertyValue!= null)&&this.propertyValue.equals(rhs.propertyValue)))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.propertyPath == rhs.propertyPath)||((this.propertyPath!= null)&&this.propertyPath.equals(rhs.propertyPath))));
    }

}
