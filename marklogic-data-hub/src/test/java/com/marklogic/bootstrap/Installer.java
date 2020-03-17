package com.marklogic.bootstrap;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.User;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@EnableAutoConfiguration
public class Installer extends HubTestBase implements InitializingBean {

    private static Logger logger = LoggerFactory.getLogger(Installer.class);

    public void setupProject() {
        createProjectDir();
    }

    public void teardownProject() {
        deleteProjectDir();
    }

    public void bootstrapHub() {
        teardownProject();
        setupProject();

        boolean isInstalled = false;
        try {
            isInstalled = dataHub.isInstalled().isInstalled();
        } catch (Exception e) {
            logger.info("Datahub is not installed");
        }

        if (!isInstalled) {
            dataHub.install();

            User dataHubDeveloper = new User(new API(adminHubConfig.getManageClient()), "test-data-hub-developer");
            dataHubDeveloper.setPassword("password");
            dataHubDeveloper.addRole("data-hub-developer");
            dataHubDeveloper.save();

            User dataHubOperator = new User(new API(adminHubConfig.getManageClient()), "test-data-hub-operator");
            dataHubOperator.setPassword("password");
            dataHubOperator.addRole("data-hub-operator");
            dataHubOperator.save();

            User testAdmin = new User(new API(adminHubConfig.getManageClient()), "test-admin-for-data-hub-tests");
            testAdmin.setDescription("This user is intended to be used by DHF tests that require admin or " +
                "admin-like capabilities, such as being able to deploy a DHF application");
            testAdmin.setPassword("password");
            testAdmin.addRole("admin");
            testAdmin.save();

            applyDatabasePropertiesForTests(dataHub, adminHubConfig);
        }

        if (getDataHubAdminConfig().getIsProvisionedEnvironment()) {
            installHubModules();
        }
    }

    /**
     * This is public and static so that it can also be invoked by RunMarkLogicUnitTestsTest. Apparently, some of these
     * database changes go away as a result of some test that runs in our test suite before RMLUTT. So RMLUTT has to
     * run this again to ensure that the indexes it depends on are present. Sigh.
     *
     * @param dataHub
     * @param hubConfig
     */
    public static void applyDatabasePropertiesForTests(DataHub dataHub, HubConfig hubConfig) {
        try {
            Path srcDir = Paths.get("src", "test", "ml-config", "databases","final-database.json");
            Path dstDir = Paths.get(hubConfig.getUserDatabaseDir().toString(), "test-final-database.json");
            FileUtils.copyFile(srcDir.toAbsolutePath().toFile(), dstDir.toAbsolutePath().toFile());
        } catch (IOException ioe) {
            throw new RuntimeException("Unable to copy test indexes file to project", ioe);
        }
        dataHub.updateIndexes();
    }

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Installer.class, ApplicationConfig.class);
        app.setWebApplicationType(WebApplicationType.NONE);
        ConfigurableApplicationContext ctx = app.run();
    }

    /**
     * Invoked by the containing {@code BeanFactory} after it has set all bean properties
     * and satisfied {@link BeanFactoryAware}, {@code ApplicationContextAware} etc.
     * <p>This method allows the bean instance to perform validation of its overall
     * configuration and final initialization when all bean properties have been set.
     *
     * @throws Exception in the event of misconfiguration (such as failure to set an
     *                   essential property) or if initialization fails for any other reason
     */
    @Override
    public void afterPropertiesSet() throws Exception {
        super.afterPropertiesSet();
        bootstrapHub();
    }
}
