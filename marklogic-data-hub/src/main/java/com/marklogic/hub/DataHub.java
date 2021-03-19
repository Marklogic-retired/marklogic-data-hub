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

import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.ServerValidationException;
import com.marklogic.hub.flow.FlowRunner;

import java.util.HashMap;
import java.util.Map;

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
     * Installs the data hub configuration and server-side config files into MarkLogic
     * Must be run as a user with sufficient privileges to install a data hub.
     * @param listener - the callback method to receive status updates
     */
    void install(HubDeployStatusListener listener);

    /**
     * Updates the indexes in the database based on the project
     * Must be run as a user with flow-developer-role or equivalent
     */
    void updateIndexes();

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
}
