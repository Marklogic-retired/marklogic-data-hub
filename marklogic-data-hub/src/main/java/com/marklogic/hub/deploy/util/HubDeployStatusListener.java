package com.marklogic.hub.deploy.util;

public interface HubDeployStatusListener {
    void onStatusChange(int percentComplete, String message);
    void onError();
}
