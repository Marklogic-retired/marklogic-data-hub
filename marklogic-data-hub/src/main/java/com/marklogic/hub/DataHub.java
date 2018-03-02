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

import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.CantUpgradeException;
import com.marklogic.hub.error.ServerValidationException;
import com.marklogic.hub.impl.DataHubImpl;
import com.marklogic.hub.util.Versions;

import java.util.List;

public interface DataHub {

    static DataHub create(HubConfig hubConfig) {
        return new DataHubImpl(hubConfig);
    }

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
     */
    void runPreInstallCheck();

    /**
     * Runs the pre-install check for the datahub populating the object
     * with variables necessary to perform the install.
     * This is used for running install.
     * @param versions - the versions that the check is to be run against
     */
    void runPreInstallCheck(Versions versions);

    /**
     * Installs the data hub configuration and server-side config files into MarkLogic
     */
    void install();

    /**
     * Installs the data hub configuration and server-side config files into MarkLogic
     * @param listener - the callback method to receive status updates
     */
    void install(HubDeployStatusListener listener);

    /**
     * Updates the indexes in the database based on the project
     */
    void updateIndexes();

    /**
     * Uninstalls the data hub configuration and server-side config files from MarkLogic
     */
    void uninstall();

    /**
     * Uninstalls the data hub configuration and server-side config files from MarkLogic
     * @param listener - the callback method to receive status updates
     */
    void uninstall(HubDeployStatusListener listener);

    /**
     * Checks to make sure all the versions and database in a valid configuration with version check
     * @return boolean - if not, returns false, if safe to proceed ahead returns true
     */
    boolean isSafeToInstall();

    boolean isPortInUse(DatabaseKind kind);

    void setPortInUseBy(DatabaseKind kind, String usedBy);

    String getPortInUseBy(DatabaseKind kind);

    boolean isServerVersionOk();

    void setServerVersionOk(boolean serverVersionOk);

    String getServerVersion();

    void setServerVersion(String serverVersion);

    boolean upgradeHub() throws CantUpgradeException;

    /**
     * Upgrades the hub based on list of provided updated flows. All flows SHOULD be provided.
     * The method without params will handle this automatically.
     * @return boolean - false if upgrade fails for a reason other than an upgrade exception
     * @throws CantUpgradeException - should the hub fail to upgrade for incompatibility reasons
     */
    boolean upgradeHub(List<String> updatedFlows) throws CantUpgradeException;

}
