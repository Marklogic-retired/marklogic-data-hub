package com.marklogic.hub_unit_test;

import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.bootstrap.Installer;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.deploy.commands.CreateGranularPrivilegesCommand;
import com.marklogic.junit5.MarkLogicUnitTestArgumentsProvider;
import com.marklogic.test.unit.TestManager;
import com.marklogic.test.unit.TestModule;
import com.marklogic.test.unit.TestResult;
import com.marklogic.test.unit.TestSuiteResult;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ArgumentsSource;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;

/**
 * Runs all marklogic-unit-test tests located under src/test/ml-modules/root/test.
 * <p>
 * To run these tests, this class just needs to know how to connect to the
 * /v1/resources/marklogic-unit-test endpoint on a REST server. None of the plumbing in HubTestBase is needed
 * for any of these tests.
 * <p>
 * This class depends on TestConfig loading the marklogic-unit-test and test modules because other tests in the DHF
 * test suite will clear out these modules after "gradle bootstrap" loads them.
 * <p>
 * After running this, you can also access the marklogic-unit-test runner at host:8011/test/default.xqy.
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {ApplicationConfig.class, TestConfig.class})
@TestInstance(Lifecycle.PER_CLASS)
public class RunMarkLogicUnitTestsTest extends HubTestBase {

    private static boolean databasesHaveBeenReset = false;
    private static boolean initialized = false;

    /**
     * Some tests clear out the final database, so we have to ensure that hub artifacts are still present. Only need to
     * do this once though. It does create a need to extend HubTestBase though
     */
//    @BeforeEach
//    public void setup() {
//        if (!databasesHaveBeenReset) {
//        }
//    }

    @BeforeAll
    public void prepareDatabasesBeforeAnyTestsRun() {
        Installer.applyDatabasePropertiesForTests(adminHubConfig);

        resetDatabases();
        runAsDataHubDeveloper();
    }

    /**
     * Reset the databases after the last test to ensure that whatever the last test was, it doesn't leave anything
     * behind that could break the next test in the suite.
     */
    @AfterAll
    public void resetDatabasesAfterAllTestsHaveRun() {
        resetDatabases();
    }

    /**
     * This is overridden so that the test class is only initialized once, which is sufficient. Otherwise, it's invoked
     * for every unit test module, which is unnecessary.
     */
    @Override
    protected void init() {
        if (!initialized) {
            super.init();
            // deploy test related amps
            adminHubConfig.getAppConfig().getConfigDirs().add(new ConfigDir(new File("src/test/ml-config")));
            new SimpleAppDeployer(new DeployRolesCommand(), new DeployAmpsCommand(), new CreateGranularPrivilegesCommand(adminHubConfig)).deploy(adminHubConfig.getAppConfig());
            initialized = true;
        }
    }

    /**
     * This test will report each marklogic-unit-test test module back as a separate JUnit test result.
     *
     * @param testModule
     */
    @ParameterizedTest
    @ArgumentsSource(MarkLogicUnitTestArgumentsProvider.class)
    public void test(TestModule testModule) {
        TestSuiteResult result = new TestManager(adminHubConfig.newFinalClient()).run(testModule);
        for (TestResult testResult : result.getTestResults()) {
            String failureXml = testResult.getFailureXml();
            if (failureXml != null) {
                Assertions.fail(String.format("Test %s in suite %s failed, cause: %s", testResult.getName(), testModule.getSuite(), failureXml));
            }
        }
    }

}
