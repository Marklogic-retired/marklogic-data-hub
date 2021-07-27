
package com.marklogic.hub.central.schemas;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
 * EntitySearchPropertyDefinition
 * <p>
 * Defines a property definition of an entity instance; may refer to a structured property too
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "propertyPath",
    "propertyLabel",
    "datatype",
    "multiple",
    "properties"
})
@Generated("jsonschema2pojo")
public class EntitySearchPropertyDefinitionSchema {

    /**
     * The unique path to this property. For a structured property, uses dot notation - e.g. billing.street.fiveDigit
     * 
     */
    @JsonProperty("propertyPath")
    @JsonPropertyDescription("The unique path to this property. For a structured property, uses dot notation - e.g. billing.street.fiveDigit")
    private String propertyPath;
    /**
     * This is equivalent to the property path, with dots being converted into spaces for structured properties
     * 
     */
    @JsonProperty("propertyLabel")
    @JsonPropertyDescription("This is equivalent to the property path, with dots being converted into spaces for structured properties")
    private String propertyLabel;
    @JsonProperty("datatype")
    private String datatype;
    /**
     * true if the property allows for an array of values
     * 
     */
    @JsonProperty("multiple")
    @JsonPropertyDescription("true if the property allows for an array of values")
    private Boolean multiple;
    /**
     * For a structured property, this will be an array of EntitySearchPropertyDefinition objects
     * 
     */
    @JsonProperty("properties")
    @JsonPropertyDescription("For a structured property, this will be an array of EntitySearchPropertyDefinition objects")
    private List<EntitySearchPropertyDefinitionSchema> properties = new ArrayList<EntitySearchPropertyDefinitionSchema>();
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * The unique path to this property. For a structured property, uses dot notation - e.g. billing.street.fiveDigit
     * 
     */
    @JsonProperty("propertyPath")
    public String getPropertyPath() {
        return propertyPath;
    }

    /**
     * The unique path to this property. For a structured property, uses dot notation - e.g. billing.street.fiveDigit
     * 
     */
    @JsonProperty("propertyPath")
    public void setPropertyPath(String propertyPath) {
        this.propertyPath = propertyPath;
    }

    /**
     * This is equivalent to the property path, with dots being converted into spaces for structured properties
     * 
     */
    @JsonProperty("propertyLabel")
    public String getPropertyLabel() {
        return propertyLabel;
    }

    /**
     * This is equivalent to the property path, with dots being converted into spaces for structured properties
     * 
     */
    @JsonProperty("propertyLabel")
    public void setPropertyLabel(String propertyLabel) {
        this.propertyLabel = propertyLabel;
    }

    @JsonProperty("datatype")
    public String getDatatype() {
        return datatype;
    }

    @JsonProperty("datatype")
    public void setDatatype(String datatype) {
        this.datatype = datatype;
    }

    /**
     * true if the property allows for an array of values
     * 
     */
    @JsonProperty("multiple")
    public Boolean getMultiple() {
        return multiple;
    }

    /**
     * true if the property allows for an array of values
     * 
     */
    @JsonProperty("multiple")
    public void setMultiple(Boolean multiple) {
        this.multiple = multiple;
    }

    /**
     * For a structured property, this will be an array of EntitySearchPropertyDefinition objects
     * 
     */
    @JsonProperty("properties")
    public List<EntitySearchPropertyDefinitionSchema> getProperties() {
        return properties;
    }

    /**
     * For a structured property, this will be an array of EntitySearchPropertyDefinition objects
     * 
     */
    @JsonProperty("properties")
    public void setProperties(List<EntitySearchPropertyDefinitionSchema> properties) {
        this.properties = properties;
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
        sb.append(EntitySearchPropertyDefinitionSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("propertyPath");
        sb.append('=');
        sb.append(((this.propertyPath == null)?"<null>":this.propertyPath));
        sb.append(',');
        sb.append("propertyLabel");
        sb.append('=');
        sb.append(((this.propertyLabel == null)?"<null>":this.propertyLabel));
        sb.append(',');
        sb.append("datatype");
        sb.append('=');
        sb.append(((this.datatype == null)?"<null>":this.datatype));
        sb.append(',');
        sb.append("multiple");
        sb.append('=');
        sb.append(((this.multiple == null)?"<null>":this.multiple));
        sb.append(',');
        sb.append("properties");
        sb.append('=');
        sb.append(((this.properties == null)?"<null>":this.properties));
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
        result = ((result* 31)+((this.datatype == null)? 0 :this.datatype.hashCode()));
        result = ((result* 31)+((this.propertyLabel == null)? 0 :this.propertyLabel.hashCode()));
        result = ((result* 31)+((this.multiple == null)? 0 :this.multiple.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.propertyPath == null)? 0 :this.propertyPath.hashCode()));
        result = ((result* 31)+((this.properties == null)? 0 :this.properties.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof EntitySearchPropertyDefinitionSchema) == false) {
            return false;
        }
        EntitySearchPropertyDefinitionSchema rhs = ((EntitySearchPropertyDefinitionSchema) other);
        return (((((((this.datatype == rhs.datatype)||((this.datatype!= null)&&this.datatype.equals(rhs.datatype)))&&((this.propertyLabel == rhs.propertyLabel)||((this.propertyLabel!= null)&&this.propertyLabel.equals(rhs.propertyLabel))))&&((this.multiple == rhs.multiple)||((this.multiple!= null)&&this.multiple.equals(rhs.multiple))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.propertyPath == rhs.propertyPath)||((this.propertyPath!= null)&&this.propertyPath.equals(rhs.propertyPath))))&&((this.properties == rhs.properties)||((this.properties!= null)&&this.properties.equals(rhs.properties))));
    }

}
