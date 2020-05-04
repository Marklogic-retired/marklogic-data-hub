package com.marklogic.bootstrap;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.deploy.commands.DeployDatabaseFieldCommand;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Privilege;
import com.marklogic.mgmt.api.security.User;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.resource.security.PrivilegeManager;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.regex.Pattern;

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

        final API api = new API(adminHubConfig.getManageClient());

        User dataHubDeveloper = new User(api, "test-data-hub-developer");
        dataHubDeveloper.setPassword("password");
        dataHubDeveloper.addRole("data-hub-developer");
        // Temporary until we get the hub-central-developer role complete
        dataHubDeveloper.addRole("hub-central-user");
        dataHubDeveloper.save();

        User dataHubOperator = new User(api, "test-data-hub-operator");
        dataHubOperator.setPassword("password");
        dataHubOperator.addRole("data-hub-operator");
        // Temporary until we get the hub-central-operator role complete
        dataHubOperator.addRole("hub-central-user");
        dataHubOperator.save();

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

        if (getDataHubAdminConfig().getIsProvisionedEnvironment()) {
            installHubModules();
        }
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
     * This is public and static so that it can also be invoked by RunMarkLogicUnitTestsTest. Apparently, some of these
     * database changes go away as a result of some test that runs in our test suite before RMLUTT. So RMLUTT has to
     * run this again to ensure that the indexes it depends on are present. Sigh.
     *
     * @param hubConfig
     */
    public static void applyDatabasePropertiesForTests(HubConfig hubConfig) {
        File testFile = Paths.get("src", "test", "ml-config", "databases", "final-database.json").toFile();
        try {
            String payload = new String(FileCopyUtils.copyToByteArray(testFile));
            new DatabaseManager(hubConfig.getManageClient()).save(payload);
            // Gotta rerun this command since the test file has path range indexes in it
            DeployDatabaseFieldCommand command = new DeployDatabaseFieldCommand();
            command.setResourceFilenamesIncludePattern(Pattern.compile("final-database.xml"));
            command.execute(new CommandContext(hubConfig.getAppConfig(), hubConfig.getManageClient(), null));
        } catch (IOException ioe) {
            throw new RuntimeException("Unable to deploy test indexes from file: " + testFile, ioe);
        }
    }

}
