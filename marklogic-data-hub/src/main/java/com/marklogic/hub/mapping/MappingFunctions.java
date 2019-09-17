package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;

public class MappingFunctions extends ResourceManager {
    private static final String NAME = "ml:mappingFunctions";

    public MappingFunctions(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    public JsonNode getMappingFunctions() {
        return getServices().get(new RequestParameters(), new JacksonHandle()).get();

    }
}

