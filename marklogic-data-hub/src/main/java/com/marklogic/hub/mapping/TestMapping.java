package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;

public class TestMapping extends ResourceManager {
    private static final String NAME = "ml:mappingTest";
    private RequestParameters params;

    public TestMapping(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    public JsonNode getMappingTestResponse(String mappingName, String mappingVersion, String docURI) {
        params = new RequestParameters();
        params.add("mappingName", mappingName);
        params.add("mappingVersion", mappingVersion);
        params.add("docURI", docURI);

        return getServices().get(params, new JacksonHandle()).get();

    }
}

