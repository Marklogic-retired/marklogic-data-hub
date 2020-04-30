
package com.marklogic.hub.central.schemas;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;


/**
 * AuthoritiesList.v1
 * <p>
 * List describing the autorites a given user has.
 * 
 */
public enum AuthoritiesListV1 {

    CAN_LOGIN_TO_HUB_CENTRAL(null),
    CAN_WRITE_LOAD_DATA(null),
    CAN_READ_LOAD_DATA(null),
    CAN_WRITE_MAPPING(null),
    CAN_READ_MAPPING(null),
    CAN_WRITE_FLOW(null),
    CAN_READ_FLOW(null),
    CAN_WRITE_STEP_DEFINITION(null),
    CAN_READ_STEP_DEFINITION(null),
    CAN_READ_MATCHING(null),
    CAN_WRITE_MATCHING(null),
    CAN_WRITE_MERGE(null),
    CAN_READ_MERGE(null);
    private final List<String> value;
    private final static Map<List<String> , AuthoritiesListV1> CONSTANTS = new HashMap<List<String> , AuthoritiesListV1>();

    static {
        for (AuthoritiesListV1 c: values()) {
            CONSTANTS.put(c.value, c);
        }
    }

    private AuthoritiesListV1(List<String> value) {
        this.value = value;
    }

    @JsonValue
    public List<String> value() {
        return this.value;
    }

    @JsonCreator
    public static AuthoritiesListV1 fromValue(List<String> value) {
        AuthoritiesListV1 constant = CONSTANTS.get(value);
        if (constant == null) {
            throw new IllegalArgumentException((value +""));
        } else {
            return constant;
        }
    }

}
