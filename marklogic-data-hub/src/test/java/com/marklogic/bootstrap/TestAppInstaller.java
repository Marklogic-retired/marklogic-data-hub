package com.marklogic.bootstrap;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.modules.LoadModulesCommand;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.deploy.commands.CreateGranularPrivilegesCommand;
import com.marklogic.hub.deploy.commands.GenerateFunctionMetadataCommand;
import com.marklogic.hub.test.HubConfigInterceptor;
import com.marklogic.hub.test.HubCoreTestConfig;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Permission;
import com.marklogic.mgmt.api.security.Privilege;
import com.marklogic.mgmt.api.security.Role;
import com.marklogic.mgmt.api.security.User;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.resource.security.PrivilegeManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class TestAppInstaller {

    private final static Logger logger = LoggerFactory.getLogger(TestAppInstaller.class);

    public static void main(String[] args) {
        ConfigurableApplicationContext applicationContext = new AnnotationConfigApplicationContext(HubCoreTestConfig.class);
        try {
            String[] hosts = applicationContext.getBean(HubConfigInterceptor.class).getHubConfigObjectFactory().getHosts();
            logger.info("Will install test app on hosts: " + Arrays.asList(hosts));
            ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
            taskExecutor.setCorePoolSize(hosts.length);
            taskExecutor.setMaxPoolSize(hosts.length);
            taskExecutor.setWaitForTasksToCompleteOnShutdown(true);
            taskExecutor.afterPropertiesSet();
            for (int i = 0; i < hosts.length; i++) {
                taskExecutor.execute(new InstallerThread(applicationContext));
            }
            // Installation should normally just take a couple minutes
            taskExecutor.setAwaitTerminationSeconds(600);
            taskExecutor.shutdown();
            logger.info("Finished installing test app on hosts: " + Arrays.asList(hosts));
        } finally {
            applicationContext.close();
            // LoadUserModulesCommand may cause hanging because its thread pool is not shutdown;
            // will investigate in 5.5.0, doing system.exit for now
            System.exit(0);
        }
    }

    /**
     * Loads the marklogic-unit-test modules and the DHF test modules under src/test/ml-modules.
     *
     * @param hubConfig
     * @param includeSecurityCommands whether to deploy some security resources; apparently these are needed before
     *                                RunMarkLogicUnitTestsTest does its thing, in which case we should just move that
     *                                code into RMLUTT
     */
    public static void loadTestModules(HubConfig hubConfig, boolean includeSecurityCommands) {
        logger.info("Loading test modules");

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
             * via an IDE or via Gradle).
             */
            appConfig.getModulePaths().clear();
            appConfig.getModulePaths().add("marklogic-data-hub/build/mlBundle/marklogic-unit-test-modules/ml-modules");
            appConfig.getModulePaths().add("marklogic-data-hub/src/test/ml-modules");
            appConfig.getModulePaths().add("build/mlBundle/marklogic-unit-test-modules/ml-modules");
            appConfig.getModulePaths().add("src/test/ml-modules");
            appConfig.getModulePaths().add("../build/mlBundle/marklogic-unit-test-modules/ml-modules");
            appConfig.getModulePaths().add("../src/test/ml-modules");

            // Picks up the test roles/amps
            appConfig.getConfigDirs().add(new ConfigDir(new ClassPathResource("test-config").getFile()));

            // Need to run GenerateFunctionMetadataCommand as well so that function metadata is generated both for
            // core mapping functions and custom functions under src/test/ml-modules/root/custom-modules.
            List<Command> commands = new ArrayList<>();
            commands.add(new GenerateFunctionMetadataCommand(hubConfig));
            commands.add(new LoadModulesCommand());
            if (includeSecurityCommands) {
                commands.add(new DeployRolesCommand());
                commands.add(new DeployAmpsCommand());
                commands.add(new CreateGranularPrivilegesCommand(hubConfig));
            }
            new SimpleAppDeployer(hubConfig.getManageClient(), hubConfig.getAdminManager(), commands.toArray(new Command[0])).deploy(appConfig);

            // Toss test modules into the 'hub-core-module' collection so that clearUserData() calls don't delete them
            DatabaseClient modulesClient = hubConfig.newModulesDbClient();
            modulesClient.newServerEval().xquery("cts:uri-match('/test/**') ! xdmp:document-add-collections(., 'hub-core-module')").evalAs(String.class);
            // Preserves the modules loaded from src/test/ml-modules/root/custom-modules
            modulesClient.newServerEval().xquery("cts:uri-match('/custom-modules/**') ! xdmp:document-add-collections(., 'hub-core-module')").evalAs(String.class);
            logger.info("Finished loading test modules");
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        } finally {
            appConfig.setAppServicesPort(originalAppServicesPort);
            appConfig.setModulesLoaderBatchSize(originalBatchSize);
            appConfig.setModulePaths(originalModulePaths);
        }
    }
}

class InstallerThread extends LoggingObject implements Runnable {
    private ApplicationContext applicationContext;

    public InstallerThread(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @Override
    public void run() {
        HubConfig hubConfig = applicationContext.getBean(HubConfig.class);
        applicationContext.getBean(HubConfigInterceptor.class).borrowHubConfig(Thread.currentThread().getName());

        try {
            logger.info("Installing test application in host: " + hubConfig.getHost());

            installDataHubIfNecessary(hubConfig);
            TestAppInstaller.loadTestModules(hubConfig, true);
            createTestUsers(hubConfig);
            HubTestBase.applyDatabasePropertiesForTests(hubConfig);

            logger.info("Finished installing test application in host: " + hubConfig.getHost());
        } finally {
            applicationContext.getBean(HubConfigInterceptor.class).returnHubConfig(Thread.currentThread().getName());
        }
    }

    /**
     * When running the tests in DHS, we do not want to install DHF.
     */
    private void installDataHubIfNecessary(HubConfig hubConfig) {
        if (Boolean.TRUE.equals(hubConfig.getIsProvisionedEnvironment())) {
            logger.info("Will not install DHF since environment is provisioned");
        } else {
            logger.info("Installing DHF");
            applicationContext.getBean(DataHub.class).install();
        }
    }

    /**
     * Create a set of users that tests depend on a) existing, and b) having a certain set of roles.
     *
     * @param hubConfig
     */
    private void createTestUsers(HubConfig hubConfig) {
        logger.info("Creating test users");

        final API api = new API(hubConfig.getManageClient());

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

        User dataHubSecurityAdmin = new User(api, "test-data-hub-security-admin");
        dataHubSecurityAdmin.setPassword("password");
        dataHubSecurityAdmin.addRole("data-hub-security-admin");
        dataHubSecurityAdmin.save();

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

        Role describeTestRole = new Role(api, "test-describe-role");
        describeTestRole.addRole("data-hub-common");
        describeTestRole.setDescription("Has default perms/colls so it can be used for testing the Describe feature");
        describeTestRole.addPermission(new Permission("data-hub-common", "read"));
        describeTestRole.addPermission(new Permission("qconsole-user", "update"));
        describeTestRole.addCollection("test-describe-role-collection");
        describeTestRole.addCollection("test-shared-collection");
        describeTestRole.save();

        User describeTestUser = new User(api, "test-describe-user");
        describeTestUser.addRole("test-describe-role");
        describeTestUser.setDescription("Has default perms/colls so it can be used for testing the Describe feature");
        describeTestUser.setPassword("password");
        describeTestUser.addPermission(new Permission("data-hub-common", "read"));
        describeTestUser.addPermission(new Permission("data-hub-common-writer", "update"));
        describeTestUser.addCollection("test-describe-user-collection");
        describeTestUser.addCollection("test-shared-collection");
        describeTestUser.save();

        addStatusPrivilegeToDataHubDeveloper(hubConfig);

        logger.info("Finished creating test users");
    }

    /**
     * This allows for any user that inherits data-hub-developer to invoke the "waitForTasksToFinish" method.
     */
    private void addStatusPrivilegeToDataHubDeveloper(HubConfig hubConfig) {
        ManageClient client = hubConfig.getManageClient();
        PrivilegeManager mgr = new PrivilegeManager(client);
        String json = mgr.getAsJson("status-builtins", "kind", "execute");
        Privilege p = new DefaultResourceMapper(new API(client)).readResource(json, Privilege.class);
        p.addRole("data-hub-developer");
        mgr.save(p.getJson());
    }

}
