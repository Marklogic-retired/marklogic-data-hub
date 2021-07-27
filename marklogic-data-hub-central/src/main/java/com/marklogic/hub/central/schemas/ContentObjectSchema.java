
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
 * ContentObject
 * <p>
 * Defines the object that is passed, either by itself or within a sequence, to a step module for processing; the step module then outputs a content object that is used to insert a document
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "uri",
    "value",
    "$delete",
    "context",
    "provenance"
})
@Generated("jsonschema2pojo")
public class ContentObjectSchema {

    /**
     * The identifier for this content object; will be a document URI unless sourceQueryIsScript=true in the step, in which case it can be any value
     * 
     */
    @JsonProperty("uri")
    @JsonPropertyDescription("The identifier for this content object; will be a document URI unless sourceQueryIsScript=true in the step, in which case it can be any value")
    private String uri;
    /**
     * The document to be processed
     * 
     */
    @JsonProperty("value")
    @JsonPropertyDescription("The document to be processed")
    private Value value;
    /**
     * If true, then the documented identified by the 'uri' property will be deleted and no document will be inserted
     * 
     */
    @JsonProperty("$delete")
    @JsonPropertyDescription("If true, then the documented identified by the 'uri' property will be deleted and no document will be inserted")
    private Boolean $delete;
    /**
     * Defines properties that affect how a document is inserted
     * 
     */
    @JsonProperty("context")
    @JsonPropertyDescription("Defines properties that affect how a document is inserted")
    private Context context;
    /**
     * Defines changes to entity properties by a step
     * 
     */
    @JsonProperty("provenance")
    @JsonPropertyDescription("Defines changes to entity properties by a step")
    private Provenance provenance;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * The identifier for this content object; will be a document URI unless sourceQueryIsScript=true in the step, in which case it can be any value
     * 
     */
    @JsonProperty("uri")
    public String getUri() {
        return uri;
    }

    /**
     * The identifier for this content object; will be a document URI unless sourceQueryIsScript=true in the step, in which case it can be any value
     * 
     */
    @JsonProperty("uri")
    public void setUri(String uri) {
        this.uri = uri;
    }

    /**
     * The document to be processed
     * 
     */
    @JsonProperty("value")
    public Value getValue() {
        return value;
    }

    /**
     * The document to be processed
     * 
     */
    @JsonProperty("value")
    public void setValue(Value value) {
        this.value = value;
    }

    /**
     * If true, then the documented identified by the 'uri' property will be deleted and no document will be inserted
     * 
     */
    @JsonProperty("$delete")
    public Boolean get$delete() {
        return $delete;
    }

    /**
     * If true, then the documented identified by the 'uri' property will be deleted and no document will be inserted
     * 
     */
    @JsonProperty("$delete")
    public void set$delete(Boolean $delete) {
        this.$delete = $delete;
    }

    /**
     * Defines properties that affect how a document is inserted
     * 
     */
    @JsonProperty("context")
    public Context getContext() {
        return context;
    }

    /**
     * Defines properties that affect how a document is inserted
     * 
     */
    @JsonProperty("context")
    public void setContext(Context context) {
        this.context = context;
    }

    /**
     * Defines changes to entity properties by a step
     * 
     */
    @JsonProperty("provenance")
    public Provenance getProvenance() {
        return provenance;
    }

    /**
     * Defines changes to entity properties by a step
     * 
     */
    @JsonProperty("provenance")
    public void setProvenance(Provenance provenance) {
        this.provenance = provenance;
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
        sb.append(ContentObjectSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("uri");
        sb.append('=');
        sb.append(((this.uri == null)?"<null>":this.uri));
        sb.append(',');
        sb.append("value");
        sb.append('=');
        sb.append(((this.value == null)?"<null>":this.value));
        sb.append(',');
        sb.append("$delete");
        sb.append('=');
        sb.append(((this.$delete == null)?"<null>":this.$delete));
        sb.append(',');
        sb.append("context");
        sb.append('=');
        sb.append(((this.context == null)?"<null>":this.context));
        sb.append(',');
        sb.append("provenance");
        sb.append('=');
        sb.append(((this.provenance == null)?"<null>":this.provenance));
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
        result = ((result* 31)+((this.provenance == null)? 0 :this.provenance.hashCode()));
        result = ((result* 31)+((this.context == null)? 0 :this.context.hashCode()));
        result = ((result* 31)+((this.$delete == null)? 0 :this.$delete.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.uri == null)? 0 :this.uri.hashCode()));
        result = ((result* 31)+((this.value == null)? 0 :this.value.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ContentObjectSchema) == false) {
            return false;
        }
        ContentObjectSchema rhs = ((ContentObjectSchema) other);
        return (((((((this.provenance == rhs.provenance)||((this.provenance!= null)&&this.provenance.equals(rhs.provenance)))&&((this.context == rhs.context)||((this.context!= null)&&this.context.equals(rhs.context))))&&((this.$delete == rhs.$delete)||((this.$delete!= null)&&this.$delete.equals(rhs.$delete))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.uri == rhs.uri)||((this.uri!= null)&&this.uri.equals(rhs.uri))))&&((this.value == rhs.value)||((this.value!= null)&&this.value.equals(rhs.value))));
    }

}
