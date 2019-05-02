package com.marklogic.hub.impl;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ConstructServerManagerTest {

    private DataHubImpl dataHub = new DataHubImpl();
    private HubConfigImpl hubConfig = new HubConfigImpl();

    // A valid ManageClient isn't needed for the purposes of this test class
    private ManageClient manageClient = null;

    @Test
    public void appConfigIsNull() {
        Assertions.assertNull(hubConfig.getAppConfig(),
            "The AppConfig is expected to be null on a new HubConfigImpl instance");

        ServerManager mgr = dataHub.constructServerManager(manageClient, hubConfig);
        assertEquals("/manage/v2/servers/Admin/properties?group-id=Default", mgr.getPropertiesPath("Admin"),
            "With no AppConfig, the path for an app server should use the Default group");
    }

    @Test
    public void appConfigHasNoGroupName() {
        hubConfig.setAppConfig(new AppConfig(), true);

        ServerManager mgr = dataHub.constructServerManager(manageClient, hubConfig);
        assertEquals("/manage/v2/servers/Admin/properties?group-id=Default", mgr.getPropertiesPath("Admin"),
            "If the group name isn't overridden, then the path for an app server should use the Default group");
    }

    @Test
    public void appConfigHasOverriddenGroupName() {
        AppConfig appConfig = new AppConfig();
        appConfig.setGroupName("CustomGroupName");
        hubConfig.setAppConfig(appConfig, true);

        ServerManager mgr = dataHub.constructServerManager(manageClient, hubConfig);
        assertEquals("/manage/v2/servers/Admin/properties?group-id=CustomGroupName", mgr.getPropertiesPath("Admin"),
            "If group name is overridden on the AppConfig, then its value should be used in the path for an app server");
    }
}
