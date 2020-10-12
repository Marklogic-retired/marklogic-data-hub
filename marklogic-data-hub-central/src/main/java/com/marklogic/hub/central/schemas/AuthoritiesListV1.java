
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

    LOGIN_TO_HUB_CENTRAL(null),
    WRITE_INGESTION(null),
    READ_INGESTION(null),
    WRITE_MAPPING(null),
    READ_MAPPING(null),
    WRITE_FLOW(null),
    READ_FLOW(null),
    WRITE_STEP_DEFINITION(null),
    READ_STEP_DEFINITION(null),
    READ_MATCHING(null),
    WRITE_MATCHING(null),
    WRITE_MERGING(null),
    READ_MERGING(null);
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
