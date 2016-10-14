package com.marklogic.hub.flow;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;

/**
 * Invalidates the server cache for flows. The server caches flow definitions
 * for optimal performance. This just makes sure that the cache gets invalidated.
 */
public class FlowCacheInvalidator extends ResourceManager {

    static final public String NAME = "flow";

    private DatabaseClient client;

    public FlowCacheInvalidator(DatabaseClient client) {
        super();
        this.client = client;
        this.client.init(NAME, this);
    }

    public void invalidateCache() {
        RequestParameters params = new RequestParameters();
        this.getServices().delete(params, new StringHandle());
    }
}
