
package com.marklogic.hub.central.schemas;

import javax.annotation.Generated;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


/**
 * CustomHook
 * <p>
 * 
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "module",
    "parameters",
    "user",
    "runBefore"
})
@Generated("jsonschema2pojo")
public class CustomHookSchema {

    @JsonProperty("module")
    private String module;
    /**
     * This is temporarily a string until a bug in HC is fixed where HC wants to set it as a string
     * 
     */
    @JsonProperty("parameters")
    @JsonPropertyDescription("This is temporarily a string until a bug in HC is fixed where HC wants to set it as a string")
    private String parameters;
    @JsonProperty("user")
    private String user;
    @JsonProperty("runBefore")
    private Boolean runBefore;

    @JsonProperty("module")
    public String getModule() {
        return module;
    }

    @JsonProperty("module")
    public void setModule(String module) {
        this.module = module;
    }

    /**
     * This is temporarily a string until a bug in HC is fixed where HC wants to set it as a string
     * 
     */
    @JsonProperty("parameters")
    public String getParameters() {
        return parameters;
    }

    /**
     * This is temporarily a string until a bug in HC is fixed where HC wants to set it as a string
     * 
     */
    @JsonProperty("parameters")
    public void setParameters(String parameters) {
        this.parameters = parameters;
    }

    @JsonProperty("user")
    public String getUser() {
        return user;
    }

    @JsonProperty("user")
    public void setUser(String user) {
        this.user = user;
    }

    @JsonProperty("runBefore")
    public Boolean getRunBefore() {
        return runBefore;
    }

    @JsonProperty("runBefore")
    public void setRunBefore(Boolean runBefore) {
        this.runBefore = runBefore;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(CustomHookSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("module");
        sb.append('=');
        sb.append(((this.module == null)?"<null>":this.module));
        sb.append(',');
        sb.append("parameters");
        sb.append('=');
        sb.append(((this.parameters == null)?"<null>":this.parameters));
        sb.append(',');
        sb.append("user");
        sb.append('=');
        sb.append(((this.user == null)?"<null>":this.user));
        sb.append(',');
        sb.append("runBefore");
        sb.append('=');
        sb.append(((this.runBefore == null)?"<null>":this.runBefore));
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
        result = ((result* 31)+((this.parameters == null)? 0 :this.parameters.hashCode()));
        result = ((result* 31)+((this.user == null)? 0 :this.user.hashCode()));
        result = ((result* 31)+((this.runBefore == null)? 0 :this.runBefore.hashCode()));
        result = ((result* 31)+((this.module == null)? 0 :this.module.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof CustomHookSchema) == false) {
            return false;
        }
        CustomHookSchema rhs = ((CustomHookSchema) other);
        return (((((this.parameters == rhs.parameters)||((this.parameters!= null)&&this.parameters.equals(rhs.parameters)))&&((this.user == rhs.user)||((this.user!= null)&&this.user.equals(rhs.user))))&&((this.runBefore == rhs.runBefore)||((this.runBefore!= null)&&this.runBefore.equals(rhs.runBefore))))&&((this.module == rhs.module)||((this.module!= null)&&this.module.equals(rhs.module))));
    }

}
