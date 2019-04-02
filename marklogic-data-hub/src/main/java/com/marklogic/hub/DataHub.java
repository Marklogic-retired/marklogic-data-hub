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

import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.CantUpgradeException;
import com.marklogic.hub.error.ServerValidationException;

import java.util.HashMap;
import java.util.List;

/**
 * Handles creation and orchastration of DHF with a MarkLogic server.
 *
 * Includes installs, version validation, updates, and the init of a DHF project.
 */
public interface DataHub {

    /**
     * Clears the database of all documents
     * @param database - the name of the database in string form
     */

    void clearDatabase(String database);

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
    HashMap runPreInstallCheck();

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
     * Must be run as a user with data-hub-admin-role or equivalent
     */
    void updateIndexes();

    /**
     * Uninstalls the data hub configuration, server-side config files and final databases and servers from MarkLogic
     * Must be run as a user with sufficient privileges to install a data hub.
     */
    void uninstall();

    /**
     * Uninstalls the data hub configuration, server-side config files and final databases and servers from MarkLogic
     * Must be run as a user with sufficient privileges to install a data hub.
     * @param listener - the callback method to receive status updates
     */
    void uninstall(HubDeployStatusListener listener);

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
     * Sets what appserver name is using the port
     * @param kind - the DatabaseKind enum value (ex STAGING or JOB)
     * @param usedBy - string name of what is using the port
     */
    void setPortInUseBy(DatabaseKind kind, String usedBy);

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
     * Sets true or false if the server version is okay with this version of DHF
     * @param serverVersionOk - true if it compatible or false if it is not
     */
    void setServerVersionOk(boolean serverVersionOk);

    /**
     * Returns the string presentation of the server version, eg: "9.03-1"
     * @return server version as a string, eg: "9.03-1"
     */
    String getServerVersion();

    /**
     * Sets the server version holder on the datahub object - currently unused
     * @param serverVersion - server version as a string, eg: "9.03-1"
     */
    void setServerVersion(String serverVersion);

    /**
     * Upgrades the installed datahub on the server to this version of the DataHub
     * Must be run as a user with sufficient privileges to install a data hub.
     * @return true or false based on success of the upgrade
     * @throws CantUpgradeException - exception thrown when an upgrade can't happen
     */
    boolean upgradeHub() throws CantUpgradeException;

    /**
     * Upgrades the hub based on list of provided updated flows. All flows SHOULD be provided.
     * The method without params will handle this automatically.
     * Must be run as a user with sufficient privileges to install a data hub.
     * @param updatedFlows - the list of the name of the flows you want to update
     * @return boolean - false if upgrade fails for a reason other than an upgrade exception
     * @throws CantUpgradeException - should the hub fail to upgrade for incompatibility reasons
     */
    boolean upgradeHub(List<String> updatedFlows) throws CantUpgradeException;

}
