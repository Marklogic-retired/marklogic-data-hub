
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
 * Defines collection names associated with the possible outputs of this step
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "archivedCollection",
    "contentCollection",
    "mergedCollection",
    "notificationCollection",
    "auditingCollection"
})
@Generated("jsonschema2pojo")
public class CollectionsInformation {

    @JsonProperty("archivedCollection")
    private String archivedCollection;
    @JsonProperty("contentCollection")
    private String contentCollection;
    @JsonProperty("mergedCollection")
    private String mergedCollection;
    @JsonProperty("notificationCollection")
    private String notificationCollection;
    @JsonProperty("auditingCollection")
    private String auditingCollection;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("archivedCollection")
    public String getArchivedCollection() {
        return archivedCollection;
    }

    @JsonProperty("archivedCollection")
    public void setArchivedCollection(String archivedCollection) {
        this.archivedCollection = archivedCollection;
    }

    @JsonProperty("contentCollection")
    public String getContentCollection() {
        return contentCollection;
    }

    @JsonProperty("contentCollection")
    public void setContentCollection(String contentCollection) {
        this.contentCollection = contentCollection;
    }

    @JsonProperty("mergedCollection")
    public String getMergedCollection() {
        return mergedCollection;
    }

    @JsonProperty("mergedCollection")
    public void setMergedCollection(String mergedCollection) {
        this.mergedCollection = mergedCollection;
    }

    @JsonProperty("notificationCollection")
    public String getNotificationCollection() {
        return notificationCollection;
    }

    @JsonProperty("notificationCollection")
    public void setNotificationCollection(String notificationCollection) {
        this.notificationCollection = notificationCollection;
    }

    @JsonProperty("auditingCollection")
    public String getAuditingCollection() {
        return auditingCollection;
    }

    @JsonProperty("auditingCollection")
    public void setAuditingCollection(String auditingCollection) {
        this.auditingCollection = auditingCollection;
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
        sb.append(CollectionsInformation.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("archivedCollection");
        sb.append('=');
        sb.append(((this.archivedCollection == null)?"<null>":this.archivedCollection));
        sb.append(',');
        sb.append("contentCollection");
        sb.append('=');
        sb.append(((this.contentCollection == null)?"<null>":this.contentCollection));
        sb.append(',');
        sb.append("mergedCollection");
        sb.append('=');
        sb.append(((this.mergedCollection == null)?"<null>":this.mergedCollection));
        sb.append(',');
        sb.append("notificationCollection");
        sb.append('=');
        sb.append(((this.notificationCollection == null)?"<null>":this.notificationCollection));
        sb.append(',');
        sb.append("auditingCollection");
        sb.append('=');
        sb.append(((this.auditingCollection == null)?"<null>":this.auditingCollection));
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
        result = ((result* 31)+((this.contentCollection == null)? 0 :this.contentCollection.hashCode()));
        result = ((result* 31)+((this.mergedCollection == null)? 0 :this.mergedCollection.hashCode()));
        result = ((result* 31)+((this.notificationCollection == null)? 0 :this.notificationCollection.hashCode()));
        result = ((result* 31)+((this.archivedCollection == null)? 0 :this.archivedCollection.hashCode()));
        result = ((result* 31)+((this.auditingCollection == null)? 0 :this.auditingCollection.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof CollectionsInformation) == false) {
            return false;
        }
        CollectionsInformation rhs = ((CollectionsInformation) other);
        return (((((((this.contentCollection == rhs.contentCollection)||((this.contentCollection!= null)&&this.contentCollection.equals(rhs.contentCollection)))&&((this.mergedCollection == rhs.mergedCollection)||((this.mergedCollection!= null)&&this.mergedCollection.equals(rhs.mergedCollection))))&&((this.notificationCollection == rhs.notificationCollection)||((this.notificationCollection!= null)&&this.notificationCollection.equals(rhs.notificationCollection))))&&((this.archivedCollection == rhs.archivedCollection)||((this.archivedCollection!= null)&&this.archivedCollection.equals(rhs.archivedCollection))))&&((this.auditingCollection == rhs.auditingCollection)||((this.auditingCollection!= null)&&this.auditingCollection.equals(rhs.auditingCollection))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))));
    }

}
