package com.marklogic.hub;

import com.marklogic.hub.impl.HubProjectImpl;

import java.nio.file.Path;
import java.util.Map;

public interface HubProject {
    String HUB_CONFIG_DIR = "hub-internal-config";
    String USER_CONFIG_DIR = "user-config";

    static HubProject create(String projectDirStr) {
        return new HubProjectImpl(projectDirStr);
    }

    Path getHubPluginsDir();

    Path getHubEntitiesDir();

    Path getHubConfigDir();

    Path getHubDatabaseDir();

    Path getHubServersDir();

    Path getHubSecurityDir();

    Path getHubMimetypesDir();

    Path getUserConfigDir();

    Path getUserSecurityDir();

    Path getUserDatabaseDir();

    Path getUserSchemasDir();

    Path getUserServersDir();

    Path getEntityConfigDir();

    Path getEntityDatabaseDir();

    boolean isInitialized();

    /**
     * Initializes a directory as a hub project directory.
     * This means putting certain files and folders in place.
     * @param customTokens - some custom tokens to start with
     */
    void init(Map<String, String> customTokens);
}
