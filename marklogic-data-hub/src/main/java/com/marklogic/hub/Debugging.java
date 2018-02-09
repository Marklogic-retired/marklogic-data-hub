package com.marklogic.hub;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;

public class Debugging extends ResourceManager {
    private static final String NAME = "ml:debug";

    public Debugging(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    /**
     * Enables debugging
     */
    public void enable() {
        RequestParameters params = new RequestParameters();
        params.add("enable", "true");
        this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
    }

    /**
     * Disables debugging
     */
    public void disable() {
        RequestParameters params = new RequestParameters();
        params.add("enable", "false");
        this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
    }

    /**
     * Determines if the hub has debugging enabled or not
     *
     * @return - true if enabled, false otherwise
     */
    public boolean isEnabled() {
        RequestParameters params = new RequestParameters();
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return false;
        }
        ServiceResult res = resultItr.next();
        StringHandle handle = new StringHandle();
        String enabled = res.getContent(handle).get();
        return Boolean.parseBoolean(enabled);
    }
}
