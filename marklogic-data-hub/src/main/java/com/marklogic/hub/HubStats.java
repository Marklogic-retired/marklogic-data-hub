package com.marklogic.hub;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.sun.jersey.api.client.ClientHandlerException;

public class HubStats extends ResourceManager{
    private static final String NAME = "hubstats";

    private RequestParameters params = new RequestParameters();

    public HubStats(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    public String getStats() {
        try {
            ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
            if (resultItr == null || ! resultItr.hasNext()) {
                return "{}";
            }
            ResourceServices.ServiceResult res = resultItr.next();
            StringHandle handle = new StringHandle();
            return res.getContent(handle).get();
        }
        catch(ClientHandlerException e) {
        }
        return "{}";
    }

}
