package com.marklogic.bootstrap;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.modules.LoadModulesCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.deploy.commands.GenerateFunctionMetadataCommand;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Privilege;
import com.marklogic.mgmt.api.security.User;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.resource.security.PrivilegeManager;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.List;

@EnableAutoConfiguration
public class Installer extends HubTestBase implements InitializingBean {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Installer.class, ApplicationConfig.class);
        app.setWebApplicationType(WebApplicationType.NONE);
        ConfigurableApplicationContext ctx = app.run();
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        super.afterPropertiesSet();
        bootstrapHub();
    }

    public void setupProject() {
        createProjectDir();
    }

    public void teardownProject() {
        deleteProjectDir();
    }

    public void bootstrapHub() {
        teardownProject();
        setupProject();

        dataHub.install();

        loadTestModules(adminHubConfig);

        final API api = new API(adminHubConfig.getManageClient());

        User dataHubDeveloper = new User(api, "test-data-hub-developer");
        dataHubDeveloper.setPassword("password");
        dataHubDeveloper.addRole("data-hub-developer");
        dataHubDeveloper.addRole("hub-central-developer");
        dataHubDeveloper.save();

        User dataHubOperator = new User(api, "test-data-hub-operator");
        dataHubOperator.setPassword("password");
        dataHubOperator.addRole("data-hub-operator");
        dataHubOperator.addRole("hub-central-operator");
        dataHubOperator.save();

        User hubCentralMappingReader = new User(api, "test-hub-mapping-reader");
        hubCentralMappingReader.setPassword("password");
        hubCentralMappingReader.addRole("hub-central-mapping-reader");
        hubCentralMappingReader.save();

        User hubCentralLoadReader = new User(api, "test-hub-load-reader");
        hubCentralLoadReader.setPassword("password");
        hubCentralLoadReader.addRole("hub-central-load-reader");
        hubCentralLoadReader.save();

        User testAdmin = new User(api, "test-admin-for-data-hub-tests");
        testAdmin.setDescription("This user is intended to be used by DHF tests that require admin or " +
            "admin-like capabilities, such as being able to deploy a DHF application");
        testAdmin.setPassword("password");
        testAdmin.addRole("admin");
        testAdmin.save();

        User dataHubEnvManager = new User(api, "test-data-hub-environment-manager");
        dataHubEnvManager.setPassword("password");
        dataHubEnvManager.addRole("data-hub-environment-manager");
        // Temporary
        dataHubEnvManager.addRole("hub-central-user");
        dataHubEnvManager.save();

        User dataHubTestUser = new User(api, "test-data-hub-user");
        dataHubTestUser.setDescription("Each JUnit test is free to change the roles on this to test whatever it wants to test");
        dataHubTestUser.save();

        addStatusPrivilegeToDataHubDeveloper();

        applyDatabasePropertiesForTests(adminHubConfig);
    }

    /**
     * This allows for any user that inherits data-hub-developer to invoke the "waitForTasksToFinish" method.
     */
    protected void addStatusPrivilegeToDataHubDeveloper() {
        ManageClient client = adminHubConfig.getManageClient();
        PrivilegeManager mgr = new PrivilegeManager(client);
        String json = mgr.getAsJson("status-builtins", "kind", "execute");
        Privilege p = new DefaultResourceMapper(new API(client)).readResource(json, Privilege.class);
        p.addRole("data-hub-developer");
        mgr.save(p.getJson());
    }

    /**
     * Loads the marklogic-unit-test modules and the DHF test modules under src/test/ml-modules.
     *
     * @param hubConfig
     */
    public static void loadTestModules(HubConfig hubConfig) {
        final AppConfig appConfig = hubConfig.getAppConfig();
        final Integer originalAppServicesPort = appConfig.getAppServicesPort();
        final Integer originalBatchSize = appConfig.getModulesLoaderBatchSize();
        final List<String> originalModulePaths = appConfig.getModulePaths();

        try {
            appConfig.setModuleTimestampsPath(null);
            appConfig.setAppServicesPort(8010);

            /**
             * Setting this to a small number to fix some issues on Jenkins where jobs are picking up test modules
             * from multiple places. This ensures that a single transaction doesn't try to write the same module
             * twice.
             */
            appConfig.setModulesLoaderBatchSize(5);

            /**
             * Adjust this to the possible paths that contain test modules (the path depends on how this test is run - e.g.
             * via an IDE or via Gradle). We don't need nor want to load from src/main/resources/ml-modules
             * because that will overwrite some collections and tokens set by the Installer program.
             */
            appConfig.getModulePaths().clear();
            appConfig.getModulePaths().add("marklogic-data-hub/build/mlBundle/marklogic-unit-test-modules/ml-modules");
            appConfig.getModulePaths().add("marklogic-data-hub/src/test/ml-modules");
            appConfig.getModulePaths().add("build/mlBundle/marklogic-unit-test-modules/ml-modules");
            appConfig.getModulePaths().add("src/test/ml-modules");
            appConfig.getModulePaths().add("../build/mlBundle/marklogic-unit-test-modules/ml-modules");
            appConfig.getModulePaths().add("../src/test/ml-modules");

            // Need to run GenerateFunctionMetadataCommand as well so that function metadata is generated both for
            // core mapping functions and custom functions under src/test/ml-modules/root/custom-modules.
            new SimpleAppDeployer(
                new LoadModulesCommand(),
                new GenerateFunctionMetadataCommand(hubConfig)
            ).deploy(appConfig);

            // Toss test modules into the 'hub-core-module' collection so that clearUserData() calls don't delete them
            DatabaseClient modulesClient = hubConfig.newModulesDbClient();
            modulesClient.newServerEval().xquery("cts:uri-match('/test/**') ! xdmp:document-add-collections(., 'hub-core-module')").evalAs(String.class);
            // Preserves the modules loaded from src/test/ml-modules/root/custom-modules
            modulesClient.newServerEval().xquery("cts:uri-match('/custom-modules/**') ! xdmp:document-add-collections(., 'hub-core-module')").evalAs(String.class);
        } finally {
            appConfig.setAppServicesPort(originalAppServicesPort);
            appConfig.setModulesLoaderBatchSize(originalBatchSize);
            appConfig.setModulePaths(originalModulePaths);
        }
    }
}
