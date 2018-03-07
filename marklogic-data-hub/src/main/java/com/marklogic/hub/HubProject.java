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
