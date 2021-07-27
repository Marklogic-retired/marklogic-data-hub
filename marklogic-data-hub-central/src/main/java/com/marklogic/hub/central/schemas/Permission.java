
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

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "roleId",
    "capability"
})
@Generated("jsonschema2pojo")
public class Permission {

    /**
     * MarkLogic-defined ID of the role associated with this permission
     * 
     */
    @JsonProperty("roleId")
    @JsonPropertyDescription("MarkLogic-defined ID of the role associated with this permission")
    private String roleId;
    /**
     * Either read, update, insert, or execute
     * 
     */
    @JsonProperty("capability")
    @JsonPropertyDescription("Either read, update, insert, or execute")
    private String capability;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * MarkLogic-defined ID of the role associated with this permission
     * 
     */
    @JsonProperty("roleId")
    public String getRoleId() {
        return roleId;
    }

    /**
     * MarkLogic-defined ID of the role associated with this permission
     * 
     */
    @JsonProperty("roleId")
    public void setRoleId(String roleId) {
        this.roleId = roleId;
    }

    /**
     * Either read, update, insert, or execute
     * 
     */
    @JsonProperty("capability")
    public String getCapability() {
        return capability;
    }

    /**
     * Either read, update, insert, or execute
     * 
     */
    @JsonProperty("capability")
    public void setCapability(String capability) {
        this.capability = capability;
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
        sb.append(Permission.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("roleId");
        sb.append('=');
        sb.append(((this.roleId == null)?"<null>":this.roleId));
        sb.append(',');
        sb.append("capability");
        sb.append('=');
        sb.append(((this.capability == null)?"<null>":this.capability));
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
        result = ((result* 31)+((this.capability == null)? 0 :this.capability.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.roleId == null)? 0 :this.roleId.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Permission) == false) {
            return false;
        }
        Permission rhs = ((Permission) other);
        return ((((this.capability == rhs.capability)||((this.capability!= null)&&this.capability.equals(rhs.capability)))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.roleId == rhs.roleId)||((this.roleId!= null)&&this.roleId.equals(rhs.roleId))));
    }

}
