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

    //HubDatabase stuff goes here
    enum HubDatabase {
        STAGING("staging"),
        FINAL("final");

        private String type;

        HubDatabase(String type) {
            this.type = type;
        }

        public static HubDatabase getHubDatabase(String database) {
            for (HubDatabase hubDatabase : HubDatabase.values()) {
                if (hubDatabase.toString().equals(database)) {
                    return hubDatabase;
                }
            }
            return null;
        }

        public String toString() {
            return this.type;
        }
    }

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

    void initProject();

    /**
     * Removes user's modules from the modules db
     * TODO: this becomes much simpler when we move code into the server dir
     */
    void clearUserModules();

    void runPreInstallCheck();

    void runPreInstallCheck(Versions versions);

    /**
     * Installs the data hub configuration and server-side modules into MarkLogic
     */
    void install();

    /**
     * Installs the data hub configuration and server-side modules into MarkLogic
     * @param listener - the callback method to receive status updates
     */
    void install(HubDeployStatusListener listener);

    void updateIndexes();

    /**
     * Uninstalls the data hub configuration and server-side modules from MarkLogic
     */
    void uninstall();

    /**
     * Uninstalls the data hub configuration and server-side modules from MarkLogic
     * @param listener - the callback method to receive status updates
     */
    void uninstall(HubDeployStatusListener listener);

    boolean isSafeToInstall();

    boolean isStagingPortInUse();

    void setStagingPortInUse(boolean stagingPortInUse);

    String getStagingPortInUseBy();

    void setStagingPortInUseBy(String stagingPortInUseBy);

    boolean isFinalPortInUse();

    void setFinalPortInUse(boolean finalPortInUse);

    String getFinalPortInUseBy();

    void setFinalPortInUseBy(String finalPortInUseBy);

    boolean isJobPortInUse();

    void setJobPortInUse(boolean jobPortInUse);

    String getJobPortInUseBy();

    void setJobPortInUseBy(String jobPortInUseBy);

    boolean isTracePortInUse();

    void setTracePortInUse(boolean tracePortInUse);

    String getTracePortInUseBy();

    void setTracePortInUseBy(String tracePortInUseBy);

    boolean isServerVersionOk();

    void setServerVersionOk(boolean serverVersionOk);

    String getServerVersion();

    void setServerVersion(String serverVersion);

    boolean upgradeHub() throws CantUpgradeException;

    boolean upgradeHub(List<String> updatedFlows) throws CantUpgradeException;

}
