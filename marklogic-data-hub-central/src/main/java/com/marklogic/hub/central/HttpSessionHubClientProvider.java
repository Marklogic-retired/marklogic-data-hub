package com.marklogic.hub.central;

import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubClientConfig;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.SessionScope;

/**
 * Session-scoped implementation of HubClientProvider that is given a HubClient when a user successfully authenticates.
 * Clients can then retrieve a HubClient from this class, where the HubClient itself is not directly bound to an HTTP
 * session, nor managed by Spring at all.
 */
@Component
@SessionScope
public class HttpSessionHubClientProvider implements HubClientProvider {

    private HubClient hubClientDelegate;
    private HubClientConfig hubClientConfig;

    @Override
    public HubClient getHubClient() {
        return hubClientDelegate;
    }

    @Override
    public HubClientConfig getHubClientConfig() {
        return hubClientConfig;
    }

    public void setHubClientDelegate(HubClient hubClientDelegate) {
        this.hubClientDelegate = hubClientDelegate;
    }

    public void setHubClientConfig(HubClientConfig hubClientConfig) {
        this.hubClientConfig = hubClientConfig;
    }
}
