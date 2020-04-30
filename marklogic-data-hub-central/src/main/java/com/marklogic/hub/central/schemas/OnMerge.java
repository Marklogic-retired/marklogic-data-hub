
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
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "add",
    "remove",
    "set"
})
public class OnMerge {

    @JsonProperty("add")
    private List<String> add = new ArrayList<String>();
    @JsonProperty("remove")
    private List<String> remove = new ArrayList<String>();
    @JsonProperty("set")
    private List<String> set = new ArrayList<String>();
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("add")
    public List<String> getAdd() {
        return add;
    }

    @JsonProperty("add")
    public void setAdd(List<String> add) {
        this.add = add;
    }

    @JsonProperty("remove")
    public List<String> getRemove() {
        return remove;
    }

    @JsonProperty("remove")
    public void setRemove(List<String> remove) {
        this.remove = remove;
    }

    @JsonProperty("set")
    public List<String> getSet() {
        return set;
    }

    @JsonProperty("set")
    public void setSet(List<String> set) {
        this.set = set;
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
        sb.append(OnMerge.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("add");
        sb.append('=');
        sb.append(((this.add == null)?"<null>":this.add));
        sb.append(',');
        sb.append("remove");
        sb.append('=');
        sb.append(((this.remove == null)?"<null>":this.remove));
        sb.append(',');
        sb.append("set");
        sb.append('=');
        sb.append(((this.set == null)?"<null>":this.set));
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
        result = ((result* 31)+((this.add == null)? 0 :this.add.hashCode()));
        result = ((result* 31)+((this.set == null)? 0 :this.set.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.remove == null)? 0 :this.remove.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof OnMerge) == false) {
            return false;
        }
        OnMerge rhs = ((OnMerge) other);
        return (((((this.add == rhs.add)||((this.add!= null)&&this.add.equals(rhs.add)))&&((this.set == rhs.set)||((this.set!= null)&&this.set.equals(rhs.set))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.remove == rhs.remove)||((this.remove!= null)&&this.remove.equals(rhs.remove))));
    }

}
