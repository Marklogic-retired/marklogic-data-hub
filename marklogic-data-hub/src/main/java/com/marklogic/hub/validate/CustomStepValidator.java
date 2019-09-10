package com.marklogic.hub.validate;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;

public class CustomStepValidator extends ResourceManager  {

    private static final String NAME = "ml:stepValidate";

    public CustomStepValidator(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    public JsonNode validate(String flow, String step) {
        RequestParameters params = new RequestParameters();
        params.add("flow-name", flow);
        params.add("step", step);
        ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON) );
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ResourceServices.ServiceResult res = resultItr.next();
        return res.getContent(new JacksonHandle()).get();
    }
}
