package com.marklogic.hub.central;

import com.marklogic.hub.HubClient;

/**
 * Abstracts how a HubClient is obtained. The intent is for Hub Central controllers to be bound to this interface
 * so that they can obtain a HubClient and hand that off to e.g. Data Service interfaces and DH core classes, and that
 * classes won't then be using a session-scoped bean. The implementation of this is expected to be session-scoped so
 * that each Hub Central user has its own instance.
 */
public interface HubClientProvider {

    HubClient getHubClient();

}
