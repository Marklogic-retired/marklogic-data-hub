
package com.marklogic.hub.central.schemas;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


/**
 * MappingProperties
 * <p>
 * 
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({

})
public class MappingPropertiesSchema {


    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(MappingPropertiesSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
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
        if ((other instanceof MappingPropertiesSchema) == false) {
            return false;
        }
        MappingPropertiesSchema rhs = ((MappingPropertiesSchema) other);
        return true;
    }

}
