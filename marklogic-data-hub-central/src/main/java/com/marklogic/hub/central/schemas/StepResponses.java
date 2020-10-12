
package com.marklogic.hub.central.schemas;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


/**
 * For each step that was executed, a key with a name equaling the step number of the step will be present
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({

})
public class StepResponses {


    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(StepResponses.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
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
        if ((other instanceof StepResponses) == false) {
            return false;
        }
        StepResponses rhs = ((StepResponses) other);
        return true;
    }

}
