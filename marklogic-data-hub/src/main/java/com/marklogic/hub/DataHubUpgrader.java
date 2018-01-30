package com.marklogic.hub;

import com.marklogic.hub.error.CantUpgradeException;
import com.marklogic.hub.util.Versions;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.regex.Pattern;

public class DataHubUpgrader {

    public static String MIN_UPGRADE_VERSION = "1.1.3";

    private HubConfig hubConfig;
    private DataHub dataHub;

    public DataHubUpgrader(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.dataHub = new DataHub(hubConfig);
    }

    public boolean upgradeHub() throws CantUpgradeException {
        return upgradeHub(null);
    }

    public boolean upgradeHub(List<String> updatedFlows) throws CantUpgradeException {
        boolean isHubInstalled = dataHub.isInstalled().isInstalled();

        String currentVersion = new Versions(hubConfig).getHubVersion();
        int compare = Versions.compare(currentVersion, MIN_UPGRADE_VERSION);
        if (compare == -1) {
            throw new CantUpgradeException(currentVersion, MIN_UPGRADE_VERSION);
        }

        boolean result = false;
        boolean alreadyInitialized = hubConfig.getHubProject().isInitialized();
        File buildGradle = Paths.get(hubConfig.getProjectDir(), "build.gradle").toFile();
        try {
            // update the hub-internal-config files
            hubConfig.initHubProject();

            if (alreadyInitialized) {
                // replace the hub version in build.gradle
                String text = FileUtils.readFileToString(buildGradle);
                String version = hubConfig.getJarVersion();
                text = Pattern.compile("^(\\s*)id\\s+['\"]com.marklogic.ml-data-hub['\"]\\s+version.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1id 'com.marklogic.ml-data-hub' version '" + version + "'");
                text = Pattern.compile("^(\\s*)compile.+marklogic-data-hub.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1compile 'com.marklogic:marklogic-data-hub:" + version + "'");
                FileUtils.writeStringToFile(buildGradle, text);

                hubConfig.getHubSecurityDir().resolve("roles").resolve("data-hub-user.json").toFile().delete();
            }

            // update legacy flows to include main.(sjs|xqy)
            List<String> flows = new FlowManager(hubConfig).updateLegacyFlows(currentVersion);
            if (updatedFlows != null) {
                updatedFlows.addAll(flows);
            }

            if (isHubInstalled) {
                // install hub modules into MarkLogic
                dataHub.install();
            }

            result = true;
        }
        catch(IOException e) {
            e.printStackTrace();
        }
        return result;
    }

}
