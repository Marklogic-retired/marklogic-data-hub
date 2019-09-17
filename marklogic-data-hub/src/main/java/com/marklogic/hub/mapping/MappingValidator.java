package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;

public class MappingValidator extends ResourceManager {

    public MappingValidator(DatabaseClient client) {
        super();
        client.init("ml:mappingValidator", this);
    }

    public JsonNode validateJsonMapping(String jsonMapping) {
        return getServices().post(new RequestParameters(),
            new StringHandle(jsonMapping).withFormat(Format.JSON), new JacksonHandle()).get();
    }
    
}
