package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;

public class MappingFunctions extends ResourceManager {
    private static final String NAME = "ml:mappingFunctions";

    public MappingFunctions(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    public JsonNode getMappingFunctions() {
        ResourceServices.ServiceResultIterator resultItr = this.getServices().get(new RequestParameters());
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ResourceServices.ServiceResult res = resultItr.next();
        return res.getContent(new JacksonHandle()).get();
    }
}

