
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
    "onMerge",
    "onNoMatch",
    "onArchive",
    "onNotification"
})
public class TargetCollections {

    @JsonProperty("onMerge")
    private OnMerge onMerge;
    @JsonProperty("onNoMatch")
    private OnNoMatch onNoMatch;
    @JsonProperty("onArchive")
    private OnArchive onArchive;
    @JsonProperty("onNotification")
    private OnNotification onNotification;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("onMerge")
    public OnMerge getOnMerge() {
        return onMerge;
    }

    @JsonProperty("onMerge")
    public void setOnMerge(OnMerge onMerge) {
        this.onMerge = onMerge;
    }

    @JsonProperty("onNoMatch")
    public OnNoMatch getOnNoMatch() {
        return onNoMatch;
    }

    @JsonProperty("onNoMatch")
    public void setOnNoMatch(OnNoMatch onNoMatch) {
        this.onNoMatch = onNoMatch;
    }

    @JsonProperty("onArchive")
    public OnArchive getOnArchive() {
        return onArchive;
    }

    @JsonProperty("onArchive")
    public void setOnArchive(OnArchive onArchive) {
        this.onArchive = onArchive;
    }

    @JsonProperty("onNotification")
    public OnNotification getOnNotification() {
        return onNotification;
    }

    @JsonProperty("onNotification")
    public void setOnNotification(OnNotification onNotification) {
        this.onNotification = onNotification;
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
        sb.append(TargetCollections.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("onMerge");
        sb.append('=');
        sb.append(((this.onMerge == null)?"<null>":this.onMerge));
        sb.append(',');
        sb.append("onNoMatch");
        sb.append('=');
        sb.append(((this.onNoMatch == null)?"<null>":this.onNoMatch));
        sb.append(',');
        sb.append("onArchive");
        sb.append('=');
        sb.append(((this.onArchive == null)?"<null>":this.onArchive));
        sb.append(',');
        sb.append("onNotification");
        sb.append('=');
        sb.append(((this.onNotification == null)?"<null>":this.onNotification));
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
        result = ((result* 31)+((this.onMerge == null)? 0 :this.onMerge.hashCode()));
        result = ((result* 31)+((this.onNoMatch == null)? 0 :this.onNoMatch.hashCode()));
        result = ((result* 31)+((this.onArchive == null)? 0 :this.onArchive.hashCode()));
        result = ((result* 31)+((this.onNotification == null)? 0 :this.onNotification.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof TargetCollections) == false) {
            return false;
        }
        TargetCollections rhs = ((TargetCollections) other);
        return ((((((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties)))&&((this.onMerge == rhs.onMerge)||((this.onMerge!= null)&&this.onMerge.equals(rhs.onMerge))))&&((this.onNoMatch == rhs.onNoMatch)||((this.onNoMatch!= null)&&this.onNoMatch.equals(rhs.onNoMatch))))&&((this.onArchive == rhs.onArchive)||((this.onArchive!= null)&&this.onArchive.equals(rhs.onArchive))))&&((this.onNotification == rhs.onNotification)||((this.onNotification!= null)&&this.onNotification.equals(rhs.onNotification))));
    }

}
