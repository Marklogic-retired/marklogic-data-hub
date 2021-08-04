
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
 * Captures model configuration specific to the HubCentral application
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "modeling"
})
@Generated("jsonschema2pojo")
public class HubCentral {

    /**
     * Captures the location of an entity model on the modeling graph in HubCentral
     * 
     */
    @JsonProperty("modeling")
    @JsonPropertyDescription("Captures the location of an entity model on the modeling graph in HubCentral")
    private Modeling modeling;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * Captures the location of an entity model on the modeling graph in HubCentral
     * 
     */
    @JsonProperty("modeling")
    public Modeling getModeling() {
        return modeling;
    }

    /**
     * Captures the location of an entity model on the modeling graph in HubCentral
     * 
     */
    @JsonProperty("modeling")
    public void setModeling(Modeling modeling) {
        this.modeling = modeling;
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
        sb.append(HubCentral.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("modeling");
        sb.append('=');
        sb.append(((this.modeling == null)?"<null>":this.modeling));
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
        result = ((result* 31)+((this.modeling == null)? 0 :this.modeling.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof HubCentral) == false) {
            return false;
        }
        HubCentral rhs = ((HubCentral) other);
        return (((this.modeling == rhs.modeling)||((this.modeling!= null)&&this.modeling.equals(rhs.modeling)))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))));
    }

}
