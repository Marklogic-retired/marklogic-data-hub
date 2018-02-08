package com.marklogic.hub.validate;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;

public class EntitiesValidator extends ResourceManager {
    private static final String NAME = "validate";

    public EntitiesValidator(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    public JsonNode validateAll() {
        ResourceServices.ServiceResultIterator resultItr = this.getServices().get(new RequestParameters());
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ResourceServices.ServiceResult res = resultItr.next();
        return res.getContent(new JacksonHandle()).get();
    }

    public JsonNode validate(String entity, String flow, String plugin, String type, String content) {
        RequestParameters params = new RequestParameters();
        params.add("entity", entity);
        params.add("flow", flow);
        params.add("plugin", plugin);
        params.add("type", type);
        StringHandle handle = new StringHandle(content);
        handle.setFormat(Format.TEXT);
        ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, handle );
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ResourceServices.ServiceResult res = resultItr.next();
        return res.getContent(new JacksonHandle()).get();
    }
}
