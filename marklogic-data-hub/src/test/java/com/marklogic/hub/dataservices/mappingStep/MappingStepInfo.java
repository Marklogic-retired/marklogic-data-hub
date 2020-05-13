package com.marklogic.hub.dataservices.mappingStep;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class MappingStepInfo {

    public String name;
    public String description;
    public String selectedSource;
    public String sourceQuery;
    public String targetEntityType;

    public static MappingStepInfo newMappingStepInfo(String name) {
        MappingStepInfo info = new MappingStepInfo();
        info.name = name;
        info.description = "optional description";
        info.selectedSource = "collection";
        info.sourceQuery = "cts.collectionQuery('customer-input')";
        info.targetEntityType = "http://example.org/Customer-0.0.1/Customer";
        return info;
    }

    public ObjectNode toJsonNode() {
        return new ObjectMapper().valueToTree(this);
    }
}
