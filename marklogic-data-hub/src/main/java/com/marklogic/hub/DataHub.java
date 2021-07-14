/*
 * Copyright (c) 2021 MarkLogic Corporation
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

import com.marklogic.hub.error.ServerValidationException;
import com.marklogic.hub.flow.FlowRunner;
import java.util.Map;

/**
 * Handles creation and orchastration of DHF with a MarkLogic server.
 *
 * Includes installs, version validation, updates, and the init of a DHF project.
 */
public interface DataHub {

    /**
     * Determines if the data hub is installed in MarkLogic
     * @return true if installed, false otherwise
     */
    InstallInfo isInstalled();

    /**
     * Validates the MarkLogic server to ensure compatibility with the hub
     * @param versionString - the version of the server to validate
     * @return true if valid, false otherwise
     * @throws ServerValidationException if the server is not compatible
     */
    boolean isServerVersionValid(String versionString);

    /**
     * Initializes the project on disk, creates scaffold project code
     */
    void initProject();

    /**
     * Removes user's modules from the modules db
     */
    void clearUserModules();

    /**
     * Runs the pre-install check for the datahub populating the object
     * with variables necessary to perform the install.
     * This is used for running install.
     * Must be run as a user with sufficient privileges to install a data hub.
     * @return - a hashmap of the results of the preinstall check
     */
    Map<String, Object> runPreInstallCheck();

    /**
     * Installs the data hub configuration and server-side config files into MarkLogic
     * Must be run as a user with sufficient privileges to install a data hub.
     */
    void install();

    /**
     * Updates the indexes in the database based on the project
     * Must be run as a user with flow-developer-role or equivalent
     */
    void updateIndexes();

    /**
     * Checks to make sure all the versions and database in a valid configuration with version check
     * Must be run as a user with sufficient privileges to install a data hub.
     * @return boolean - if not, returns false, if safe to proceed ahead returns true
     */
    boolean isSafeToInstall();

    /**
     * Checks to see if the port is in use
     * @param kind - the DatabaseKind enum value (ex STAGING or JOB)
     * @return true if the port is in use, false if it is not
     */
    boolean isPortInUse(DatabaseKind kind);

    /**
     * Returns name of what is using the port
     * @param kind - the DatabaseKind enum value (ex STAGING or JOB)
     * @return name of who using the port
     */
    String getPortInUseBy(DatabaseKind kind);

    /**
     * Checks to see if the datahub and server versions are compatible
     * @return true if the server version matches, false if it does not
     */
    boolean isServerVersionOk();

    /**
     * Returns the string presentation of the server version, eg: "9.03-1"
     * @return server version as a string, eg: "9.03-1"
     */
    String getServerVersion();

    /**
     * Upgrades the installed datahub on the server to this version of the DataHub
     * Must be run as a user with sufficient privileges to install a data hub.
     * @return true or false based on success of the upgrade
     */
    boolean upgradeHub();

    /**
     * Creates and returns the FlowRunner object using the datahub's autowired hubconfig
     *
     * @return FlowRunner object with current hubconfig already set
     */
    FlowRunner getFlowRunner();
}
