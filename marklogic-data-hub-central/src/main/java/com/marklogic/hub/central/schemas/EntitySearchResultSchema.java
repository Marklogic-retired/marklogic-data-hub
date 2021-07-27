
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
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


/**
 * EntitySearchResult
 * <p>
 * Defines a search result for an entity instance
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "index",
    "uri",
    "entityProperties"
})
@Generated("jsonschema2pojo")
public class EntitySearchResultSchema {

    @JsonProperty("index")
    private Double index;
    @JsonProperty("uri")
    private String uri;
    @JsonProperty("entityProperties")
    private List<EntitySearchResultPropertySchema> entityProperties = new ArrayList<EntitySearchResultPropertySchema>();
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("index")
    public Double getIndex() {
        return index;
    }

    @JsonProperty("index")
    public void setIndex(Double index) {
        this.index = index;
    }

    @JsonProperty("uri")
    public String getUri() {
        return uri;
    }

    @JsonProperty("uri")
    public void setUri(String uri) {
        this.uri = uri;
    }

    @JsonProperty("entityProperties")
    public List<EntitySearchResultPropertySchema> getEntityProperties() {
        return entityProperties;
    }

    @JsonProperty("entityProperties")
    public void setEntityProperties(List<EntitySearchResultPropertySchema> entityProperties) {
        this.entityProperties = entityProperties;
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
        sb.append(EntitySearchResultSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("index");
        sb.append('=');
        sb.append(((this.index == null)?"<null>":this.index));
        sb.append(',');
        sb.append("uri");
        sb.append('=');
        sb.append(((this.uri == null)?"<null>":this.uri));
        sb.append(',');
        sb.append("entityProperties");
        sb.append('=');
        sb.append(((this.entityProperties == null)?"<null>":this.entityProperties));
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
        result = ((result* 31)+((this.index == null)? 0 :this.index.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.uri == null)? 0 :this.uri.hashCode()));
        result = ((result* 31)+((this.entityProperties == null)? 0 :this.entityProperties.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof EntitySearchResultSchema) == false) {
            return false;
        }
        EntitySearchResultSchema rhs = ((EntitySearchResultSchema) other);
        return (((((this.index == rhs.index)||((this.index!= null)&&this.index.equals(rhs.index)))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.uri == rhs.uri)||((this.uri!= null)&&this.uri.equals(rhs.uri))))&&((this.entityProperties == rhs.entityProperties)||((this.entityProperties!= null)&&this.entityProperties.equals(rhs.entityProperties))));
    }

}
