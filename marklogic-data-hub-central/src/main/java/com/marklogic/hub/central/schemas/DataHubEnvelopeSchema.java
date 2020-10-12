
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
 * DataHubEnvelope
 * <p>
 * Defines the envelope structure with DHF-specific additions to headers
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "headers",
    "triples",
    "instance",
    "attachments"
})
public class DataHubEnvelopeSchema {

    /**
     * Container for what can typically be considered metadata that pertains to the instance data in the envelope
     * 
     */
    @JsonProperty("headers")
    @JsonPropertyDescription("Container for what can typically be considered metadata that pertains to the instance data in the envelope")
    private Headers headers;
    /**
     * Optional array of triples
     * 
     */
    @JsonProperty("triples")
    @JsonPropertyDescription("Optional array of triples")
    private List<Triple> triples = new ArrayList<Triple>();
    /**
     * Instance data can be anything a user chooses
     * 
     */
    @JsonProperty("instance")
    @JsonPropertyDescription("Instance data can be anything a user chooses")
    private Instance instance;
    @JsonProperty("attachments")
    private List<Attachment> attachments = new ArrayList<Attachment>();
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * Container for what can typically be considered metadata that pertains to the instance data in the envelope
     * 
     */
    @JsonProperty("headers")
    public Headers getHeaders() {
        return headers;
    }

    /**
     * Container for what can typically be considered metadata that pertains to the instance data in the envelope
     * 
     */
    @JsonProperty("headers")
    public void setHeaders(Headers headers) {
        this.headers = headers;
    }

    /**
     * Optional array of triples
     * 
     */
    @JsonProperty("triples")
    public List<Triple> getTriples() {
        return triples;
    }

    /**
     * Optional array of triples
     * 
     */
    @JsonProperty("triples")
    public void setTriples(List<Triple> triples) {
        this.triples = triples;
    }

    /**
     * Instance data can be anything a user chooses
     * 
     */
    @JsonProperty("instance")
    public Instance getInstance() {
        return instance;
    }

    /**
     * Instance data can be anything a user chooses
     * 
     */
    @JsonProperty("instance")
    public void setInstance(Instance instance) {
        this.instance = instance;
    }

    @JsonProperty("attachments")
    public List<Attachment> getAttachments() {
        return attachments;
    }

    @JsonProperty("attachments")
    public void setAttachments(List<Attachment> attachments) {
        this.attachments = attachments;
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
        sb.append(DataHubEnvelopeSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("headers");
        sb.append('=');
        sb.append(((this.headers == null)?"<null>":this.headers));
        sb.append(',');
        sb.append("triples");
        sb.append('=');
        sb.append(((this.triples == null)?"<null>":this.triples));
        sb.append(',');
        sb.append("instance");
        sb.append('=');
        sb.append(((this.instance == null)?"<null>":this.instance));
        sb.append(',');
        sb.append("attachments");
        sb.append('=');
        sb.append(((this.attachments == null)?"<null>":this.attachments));
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
        result = ((result* 31)+((this.headers == null)? 0 :this.headers.hashCode()));
        result = ((result* 31)+((this.triples == null)? 0 :this.triples.hashCode()));
        result = ((result* 31)+((this.instance == null)? 0 :this.instance.hashCode()));
        result = ((result* 31)+((this.attachments == null)? 0 :this.attachments.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof DataHubEnvelopeSchema) == false) {
            return false;
        }
        DataHubEnvelopeSchema rhs = ((DataHubEnvelopeSchema) other);
        return ((((((this.headers == rhs.headers)||((this.headers!= null)&&this.headers.equals(rhs.headers)))&&((this.triples == rhs.triples)||((this.triples!= null)&&this.triples.equals(rhs.triples))))&&((this.instance == rhs.instance)||((this.instance!= null)&&this.instance.equals(rhs.instance))))&&((this.attachments == rhs.attachments)||((this.attachments!= null)&&this.attachments.equals(rhs.attachments))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))));
    }

}
