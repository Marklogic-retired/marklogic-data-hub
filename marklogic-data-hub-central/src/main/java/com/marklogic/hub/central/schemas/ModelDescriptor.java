
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
 * ModelDescriptor
 * <p>
 * JSON schema representation of a MarkLogic Entity Services model
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "info",
    "definitions",
    "hubCentral"
})
@Generated("jsonschema2pojo")
public class ModelDescriptor {

    @JsonProperty("info")
    private Info info;
    /**
     * ModelDefinitions
     * <p>
     * 
     * 
     */
    @JsonProperty("definitions")
    private ModelDefinitions definitions;
    /**
     * Captures model configuration specific to the HubCentral application
     * 
     */
    @JsonProperty("hubCentral")
    @JsonPropertyDescription("Captures model configuration specific to the HubCentral application")
    private HubCentral hubCentral;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("info")
    public Info getInfo() {
        return info;
    }

    @JsonProperty("info")
    public void setInfo(Info info) {
        this.info = info;
    }

    /**
     * ModelDefinitions
     * <p>
     * 
     * 
     */
    @JsonProperty("definitions")
    public ModelDefinitions getDefinitions() {
        return definitions;
    }

    /**
     * ModelDefinitions
     * <p>
     * 
     * 
     */
    @JsonProperty("definitions")
    public void setDefinitions(ModelDefinitions definitions) {
        this.definitions = definitions;
    }

    /**
     * Captures model configuration specific to the HubCentral application
     * 
     */
    @JsonProperty("hubCentral")
    public HubCentral getHubCentral() {
        return hubCentral;
    }

    /**
     * Captures model configuration specific to the HubCentral application
     * 
     */
    @JsonProperty("hubCentral")
    public void setHubCentral(HubCentral hubCentral) {
        this.hubCentral = hubCentral;
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
        sb.append(ModelDescriptor.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("info");
        sb.append('=');
        sb.append(((this.info == null)?"<null>":this.info));
        sb.append(',');
        sb.append("definitions");
        sb.append('=');
        sb.append(((this.definitions == null)?"<null>":this.definitions));
        sb.append(',');
        sb.append("hubCentral");
        sb.append('=');
        sb.append(((this.hubCentral == null)?"<null>":this.hubCentral));
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
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.definitions == null)? 0 :this.definitions.hashCode()));
        result = ((result* 31)+((this.info == null)? 0 :this.info.hashCode()));
        result = ((result* 31)+((this.hubCentral == null)? 0 :this.hubCentral.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ModelDescriptor) == false) {
            return false;
        }
        ModelDescriptor rhs = ((ModelDescriptor) other);
        return (((((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties)))&&((this.definitions == rhs.definitions)||((this.definitions!= null)&&this.definitions.equals(rhs.definitions))))&&((this.info == rhs.info)||((this.info!= null)&&this.info.equals(rhs.info))))&&((this.hubCentral == rhs.hubCentral)||((this.hubCentral!= null)&&this.hubCentral.equals(rhs.hubCentral))));
    }

}
