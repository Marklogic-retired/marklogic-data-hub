
package com.marklogic.hub.central.schemas;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "path",
    "when",
    "vars"
})
public class Interceptor {

    /**
     * Path to a module in the modules database that will be invoked via xdmp.invoke
     * 
     */
    @JsonProperty("path")
    @JsonPropertyDescription("Path to a module in the modules database that will be invoked via xdmp.invoke")
    private String path;
    /**
     * When the interceptor should be invoked. Only 'beforeContentPersisted' is supported.
     * 
     */
    @JsonProperty("when")
    @JsonPropertyDescription("When the interceptor should be invoked. Only 'beforeContentPersisted' is supported.")
    private String when;
    /**
     * Any properties defined in this object are passed to the invoked module
     * 
     */
    @JsonProperty("vars")
    @JsonPropertyDescription("Any properties defined in this object are passed to the invoked module")
    private Vars vars;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * Path to a module in the modules database that will be invoked via xdmp.invoke
     * 
     */
    @JsonProperty("path")
    public String getPath() {
        return path;
    }

    /**
     * Path to a module in the modules database that will be invoked via xdmp.invoke
     * 
     */
    @JsonProperty("path")
    public void setPath(String path) {
        this.path = path;
    }

    /**
     * When the interceptor should be invoked. Only 'beforeContentPersisted' is supported.
     * 
     */
    @JsonProperty("when")
    public String getWhen() {
        return when;
    }

    /**
     * When the interceptor should be invoked. Only 'beforeContentPersisted' is supported.
     * 
     */
    @JsonProperty("when")
    public void setWhen(String when) {
        this.when = when;
    }

    /**
     * Any properties defined in this object are passed to the invoked module
     * 
     */
    @JsonProperty("vars")
    public Vars getVars() {
        return vars;
    }

    /**
     * Any properties defined in this object are passed to the invoked module
     * 
     */
    @JsonProperty("vars")
    public void setVars(Vars vars) {
        this.vars = vars;
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
        sb.append(Interceptor.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("path");
        sb.append('=');
        sb.append(((this.path == null)?"<null>":this.path));
        sb.append(',');
        sb.append("when");
        sb.append('=');
        sb.append(((this.when == null)?"<null>":this.when));
        sb.append(',');
        sb.append("vars");
        sb.append('=');
        sb.append(((this.vars == null)?"<null>":this.vars));
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
        result = ((result* 31)+((this.path == null)? 0 :this.path.hashCode()));
        result = ((result* 31)+((this.vars == null)? 0 :this.vars.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.when == null)? 0 :this.when.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Interceptor) == false) {
            return false;
        }
        Interceptor rhs = ((Interceptor) other);
        return (((((this.path == rhs.path)||((this.path!= null)&&this.path.equals(rhs.path)))&&((this.vars == rhs.vars)||((this.vars!= null)&&this.vars.equals(rhs.vars))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.when == rhs.when)||((this.when!= null)&&this.when.equals(rhs.when))));
    }

}
