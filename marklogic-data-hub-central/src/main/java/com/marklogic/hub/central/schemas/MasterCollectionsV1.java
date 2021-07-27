
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
 * MasteringCollections.v1
 * <p>
 * 
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "onMerge",
    "onNoMatch",
    "onArchive",
    "onNotification",
    "onAuditing"
})
@Generated("jsonschema2pojo")
public class MasterCollectionsV1 {

    @JsonProperty("onMerge")
    private List<String> onMerge = new ArrayList<String>();
    @JsonProperty("onNoMatch")
    private List<String> onNoMatch = new ArrayList<String>();
    @JsonProperty("onArchive")
    private List<String> onArchive = new ArrayList<String>();
    @JsonProperty("onNotification")
    private List<String> onNotification = new ArrayList<String>();
    @JsonProperty("onAuditing")
    private List<String> onAuditing = new ArrayList<String>();
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("onMerge")
    public List<String> getOnMerge() {
        return onMerge;
    }

    @JsonProperty("onMerge")
    public void setOnMerge(List<String> onMerge) {
        this.onMerge = onMerge;
    }

    @JsonProperty("onNoMatch")
    public List<String> getOnNoMatch() {
        return onNoMatch;
    }

    @JsonProperty("onNoMatch")
    public void setOnNoMatch(List<String> onNoMatch) {
        this.onNoMatch = onNoMatch;
    }

    @JsonProperty("onArchive")
    public List<String> getOnArchive() {
        return onArchive;
    }

    @JsonProperty("onArchive")
    public void setOnArchive(List<String> onArchive) {
        this.onArchive = onArchive;
    }

    @JsonProperty("onNotification")
    public List<String> getOnNotification() {
        return onNotification;
    }

    @JsonProperty("onNotification")
    public void setOnNotification(List<String> onNotification) {
        this.onNotification = onNotification;
    }

    @JsonProperty("onAuditing")
    public List<String> getOnAuditing() {
        return onAuditing;
    }

    @JsonProperty("onAuditing")
    public void setOnAuditing(List<String> onAuditing) {
        this.onAuditing = onAuditing;
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
        sb.append(MasterCollectionsV1 .class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
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
        sb.append("onAuditing");
        sb.append('=');
        sb.append(((this.onAuditing == null)?"<null>":this.onAuditing));
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
        result = ((result* 31)+((this.onAuditing == null)? 0 :this.onAuditing.hashCode()));
        result = ((result* 31)+((this.onNotification == null)? 0 :this.onNotification.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.onMerge == null)? 0 :this.onMerge.hashCode()));
        result = ((result* 31)+((this.onNoMatch == null)? 0 :this.onNoMatch.hashCode()));
        result = ((result* 31)+((this.onArchive == null)? 0 :this.onArchive.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof MasterCollectionsV1) == false) {
            return false;
        }
        MasterCollectionsV1 rhs = ((MasterCollectionsV1) other);
        return (((((((this.onAuditing == rhs.onAuditing)||((this.onAuditing!= null)&&this.onAuditing.equals(rhs.onAuditing)))&&((this.onNotification == rhs.onNotification)||((this.onNotification!= null)&&this.onNotification.equals(rhs.onNotification))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.onMerge == rhs.onMerge)||((this.onMerge!= null)&&this.onMerge.equals(rhs.onMerge))))&&((this.onNoMatch == rhs.onNoMatch)||((this.onNoMatch!= null)&&this.onNoMatch.equals(rhs.onNoMatch))))&&((this.onArchive == rhs.onArchive)||((this.onArchive!= null)&&this.onArchive.equals(rhs.onArchive))));
    }

}
