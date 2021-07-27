
package com.marklogic.hub.central.schemas;

import javax.annotation.Generated;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


/**
 * For each step that was executed, a key with a name equaling the step number of the step will be present
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({

})
@Generated("jsonschema2pojo")
public class StepResponses__1 {


    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(StepResponses__1 .class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
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
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof StepResponses__1) == false) {
            return false;
        }
        StepResponses__1 rhs = ((StepResponses__1) other);
        return true;
    }

}
