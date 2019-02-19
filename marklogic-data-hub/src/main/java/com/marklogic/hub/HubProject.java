/*
 * Copyright 2012-2019 MarkLogic Corporation
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

import com.marklogic.hub.step.Step;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;

/**
 * Creates and gathers information about a hub project.
 *
 * This handles what is initially created on disk for the project.
 */
public interface HubProject {
    String PATH_PREFIX = "src/main/";
    String HUB_CONFIG_DIR = PATH_PREFIX + "hub-internal-config";
    String USER_CONFIG_DIR = PATH_PREFIX + "ml-config";

    /**
     * Gets the string used to originally make the project
     *
     * @return The directory string.
     */
    String getProjectDirString();


    /**
     * Gets the path for the hub plugins directory
     *
     * @return the path for the hub plugins directory
     */
    Path getHubPluginsDir();

    /**
     * Gets the path for the hub step directory
     *
     * @return the path for the hub steps directory
     */
    Path getStepsDir();

    /**
     * Gets the path for the hub entities directory
     *
     * @return the path for the hub entities directory
     */
    Path getHubEntitiesDir();

    /**
     * Gets the path for the hub mappings directory
     *
     * @return the path for the hub mappings directory
     */
    Path getHubMappingsDir();

    /**
     * Gets the path for the hub step directory by step type
     *
     * @param type - a Step type
     * @return the path for the hub steps directory
     */
    Path getStepsDirByType(Step.StepType type);

    /**
     * Gets the path for the hub's config directory
     *
     * @return the path for the hub's config directory
     */
    Path getHubConfigDir();

    /**
     * Gets the path for the hub's database directory
     *
     * @return the path for the hub's database directory
     */
    Path getHubDatabaseDir();

    /**
     * Gets the path for the hub servers directory
     *
     * @return the path for the hub servers database directory
     */
    Path getHubServersDir();

    /**
     * Gets the path for the hub's security directory
     *
     * @return the path for the hub's security directory
     */
    Path getHubSecurityDir();

    /**
     * Gets the path for the hub's triggers directory
     *
     * @return the path for the hub's triggers directory
     */
    Path getHubTriggersDir();

    /**
     * Gets the path for the user config directory
     *
     * @return the path for the user config directory
     */
    Path getUserConfigDir();

    /**
     * Gets the path for the user security directory
     *
     * @return the path for the user security directory
     */
    Path getUserSecurityDir();

    /**
     * Gets the path for the user database directory
     *
     * @return the path for the user database directory
     */
    Path getUserDatabaseDir();

    /**
     * Gets the path for the user schemas directory
     *
     * @return the path for the user schemas directory
     */
    Path getUserSchemasDir();

    /**
     * Gets the path for the user servers directory
     *
     * @return the path for the user servers database directory
     */
    Path getUserServersDir();

    /**
     * Gets the path for the entity's config directory
     *
     * @return the path for the entity's config directory
     */
    Path getEntityConfigDir();

    /**
     * Gets the path for the entity database directory
     *
     * @return the path for the entity's database directory
     */
    Path getEntityDatabaseDir();

    /**
     * Gets the path for the flows directory
     *
     * @return the path for the flows directory
     */
    Path getFlowsDir();

    /**
     * Gets the path for the hub staging modules
     *
     * @return the path for the hub staging modules
     */
    @Deprecated
    Path getHubStagingModulesDir();

    /**
     * Gets the path for the user staging modules
     *
     * @return the path for the user staging modules
     */
    @Deprecated
    Path getUserStagingModulesDir();

    /**
     * Gets the path for the modules directory
     *
     * @return the path for the modules directory
     */
    Path getModulesDir();

    /**
     * Gets the path for the user final modules
     *
     * @return the path for the user final modules
     */
    @Deprecated
    Path getUserFinalModulesDir();

    /**
     * Checks if the project has been initialized or not
     *
     * @return true if initialized, false if not
     */
    boolean isInitialized();

    /**
     * Initializes a directory as a hub project directory.
     * This means putting certain files and folders in place.
     *
     * @param customTokens - some custom tokens to start with
     */
    void init(Map<String, String> customTokens);

    /**
     * Performs an upgrade to a pre-4.0 project by copying folders
     * to their new positions as defined in hubproject.
     *
     * @throws IOException if problem happens with the on-disk project.
     */
    void upgradeProject() throws IOException;

    String getHubModulesDeployTimestampFile();

    String getUserModulesDeployTimestampFile();

    void setUserModulesDeployTimestampFile(String userModulesDeployTimestampFile);

    Path getEntityDir(String entityName);

    Path getMappingDir(String mappingName);

    /**
     * Returns the base directory for this project
     *
     * @return the project's directory as a Path
     */
    Path getProjectDir();

    void createProject(String projectDirString);
}
