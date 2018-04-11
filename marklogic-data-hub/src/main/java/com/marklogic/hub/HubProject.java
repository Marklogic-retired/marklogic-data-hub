/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.marklogic.hub;

import com.marklogic.hub.impl.HubProjectImpl;

import java.nio.file.Path;
import java.util.Map;

/**
 * Creates and gathers information about a hub project.
 *
 * This handles what is initially created on disk for the project.
 */
public interface HubProject {
    String HUB_CONFIG_DIR = "hub-internal-config";
    String USER_CONFIG_DIR = "user-config";

    /**
     * Creates a HubProject object and returns it in the base project directory
     * @param projectDirStr - the base project directory
     * @return the HubProject object for the newly created project
     */
    static HubProject create(String projectDirStr) {
        return new HubProjectImpl(projectDirStr);
    }

    /**
     * Gets the path for the entity database directory
     * @return the path for the entity's database directory
     */
    Path getHubPluginsDir();

    /**
     * Gets the path for the hub plugins directory
     * @return the path for the hub plugins directory
     */
    Path getHubEntitiesDir();

    /**
     * Gets the path for the hub's entities directory
     * @return the path for the hub's entities directory
     */
    Path getHubConfigDir();

    /**
     * Gets the path for the hub's config directory
     * @return the path for the hub's config directory
     */
    Path getHubDatabaseDir();

    /**
     * Gets the path for the hub's database directory
     * @return the path for the hub's database directory
     */
    Path getHubServersDir();

    /**
     * Gets the path for the hub servers directory
     * @return the path for the hub servers database directory
     */
    Path getHubSecurityDir();

    /**
     * Gets the path for the entity database directory
     * @return the path for the entity's database directory
     */
    Path getUserConfigDir();

    /**
     * Gets the path for the user config directory
     * @return the path for the user config directory
     */
    Path getUserSecurityDir();

    /**
     * Gets the path for the user security directory
     * @return the path for the user security directory
     */
    Path getUserDatabaseDir();

    /**
     * Gets the path for the user schemas directory
     * @return the path for the user schemas directory
     */
    Path getUserSchemasDir();

    /**
     * Gets the path for the entity database directory
     * @return the path for the entity's database directory
     */
    Path getUserServersDir();

    /**
     * Gets the path for the user server's directory
     * @return the path for the user server's directory
     */
    Path getEntityConfigDir();

    /**
     * Gets the path for the entity database directory
     * @return the path for the entity's database directory
     */
    Path getEntityDatabaseDir();

    /**
     * Checks if the project has been initialized or not
     * @return true if initialized, false if not
     */
    boolean isInitialized();

    /**
     * Initializes a directory as a hub project directory.
     * This means putting certain files and folders in place.
     * @param customTokens - some custom tokens to start with
     */
    void init(Map<String, String> customTokens);
}
