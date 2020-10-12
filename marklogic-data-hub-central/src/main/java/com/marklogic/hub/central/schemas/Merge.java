
package com.marklogic.hub.central.schemas;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "document-uri",
    "last-merge"
})
public class Merge {

    @JsonProperty("document-uri")
    private String documentUri;
    @JsonProperty("last-merge")
    private String lastMerge;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("document-uri")
    public String getDocumentUri() {
        return documentUri;
    }

    @JsonProperty("document-uri")
    public void setDocumentUri(String documentUri) {
        this.documentUri = documentUri;
    }

    @JsonProperty("last-merge")
    public String getLastMerge() {
        return lastMerge;
    }

    @JsonProperty("last-merge")
    public void setLastMerge(String lastMerge) {
        this.lastMerge = lastMerge;
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
        sb.append(Merge.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("documentUri");
        sb.append('=');
        sb.append(((this.documentUri == null)?"<null>":this.documentUri));
        sb.append(',');
        sb.append("lastMerge");
        sb.append('=');
        sb.append(((this.lastMerge == null)?"<null>":this.lastMerge));
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
        result = ((result* 31)+((this.documentUri == null)? 0 :this.documentUri.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.lastMerge == null)? 0 :this.lastMerge.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Merge) == false) {
            return false;
        }
        Merge rhs = ((Merge) other);
        return ((((this.documentUri == rhs.documentUri)||((this.documentUri!= null)&&this.documentUri.equals(rhs.documentUri)))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.lastMerge == rhs.lastMerge)||((this.lastMerge!= null)&&this.lastMerge.equals(rhs.lastMerge))));
    }

}
