package com.marklogic.hub.central.controllers;

import com.marklogic.hub.HubClient;
import com.marklogic.hub.central.HttpSessionHubClientProvider;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Base controller for all HC controllers. The sole purpose of this controller (so far) is to provide a single point
 * for obtaining a HubClient, such that classes that extend this don't have to worry about how to do that.
 */
public abstract class BaseController {

    @Autowired
    HttpSessionHubClientProvider hubClientProvider;

    protected HubClient getHubClient() {
        return hubClientProvider.getHubClient();
    }
}
