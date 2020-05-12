package com.marklogic.hub.central.models;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public abstract class AbstractModel {

    public JsonNode toJsonNode() {
        return new ObjectMapper().valueToTree(this);
    }
}
