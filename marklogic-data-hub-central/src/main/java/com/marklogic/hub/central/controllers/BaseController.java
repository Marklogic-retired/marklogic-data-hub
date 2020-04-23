package com.marklogic.hub.central.controllers;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.central.models.HubConfigSession;
import com.marklogic.hub.impl.HubConfigImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;

public abstract class BaseController {

    @Autowired
    private HubConfigSession hubConfigSession;

    protected HubConfig getHubConfig() {
        final HubConfigImpl realHubConfig = hubConfigSession.getHubConfigImpl();
        Assert.isNull(realHubConfig.getHubProject(), "No HubProject should exist while running Hub Central");
        return realHubConfig;
    }
}
