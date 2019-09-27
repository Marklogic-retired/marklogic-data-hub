package com.marklogic.hub;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.DefaultAppConfigFactory;
import com.marklogic.appdeployer.command.modules.LoadModulesCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.mgmt.util.SimplePropertySource;

import java.util.Properties;

/**
 * Because some tests clear out "user" modules, there's a chance that a test that depends on test modules -
 * marklogic-unit-test and modules under src/test/ml-modules - will have been deleted before a test runs that depends
 * on them. So any test that depends on them can use this class to ensure the test modules are loaded.
 */
public class LoadTestModules {

    public static void loadTestModules(String host, int finalPort, String username, String password, String modulesDatabaseName) {
        Properties props = new Properties();
        props.setProperty("mlUsername", username);
        props.setProperty("mlPassword", password);
        props.setProperty("mlHost", host);
        props.setProperty("mlRestPort", finalPort + "");

        AppConfig config = new DefaultAppConfigFactory(new SimplePropertySource(props)).newAppConfig();
        config.setModuleTimestampsPath(null);
        config.setModulesDatabaseName(modulesDatabaseName);
        config.setAppServicesPort(8010);

        /**
         * Setting this to a small number to fix some issues on Jenkins where jobs are picking up test modules
         * from multiple places. This ensures that a single transaction doesn't try to write the same module
         * twice.
         */
        config.setModulesLoaderBatchSize(5);

        /**
         * Adjust this to the possible paths that contain test modules (the path depends on how this test is run - e.g.
         * via an IDE or via Gradle). We don't need nor want to load from src/main/resources/ml-modules
         * because that will overwrite some collections and tokens set by the Installer program.
         */
        config.getModulePaths().clear();
        config.getModulePaths().add("marklogic-data-hub/build/mlBundle/marklogic-unit-test-modules/ml-modules");
        config.getModulePaths().add("marklogic-data-hub/src/test/ml-modules");
        config.getModulePaths().add("build/mlBundle/marklogic-unit-test-modules/ml-modules");
        config.getModulePaths().add("src/test/ml-modules");
        config.getModulePaths().add("../build/mlBundle/marklogic-unit-test-modules/ml-modules");
        config.getModulePaths().add("../src/test/ml-modules");

        // Removing GenerateFunctionMetaDataCommand as the command has spring related dependencies (hubConfig, versions
        // objects have to be created
        new SimpleAppDeployer(
            new LoadModulesCommand()
        ).deploy(config);
    }
}
