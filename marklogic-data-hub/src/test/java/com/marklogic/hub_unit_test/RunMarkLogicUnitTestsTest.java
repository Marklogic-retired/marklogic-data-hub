package com.marklogic.hub_unit_test;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.test.unit.TestManager;
import com.marklogic.test.unit.TestModule;
import com.marklogic.test.unit.TestResult;
import com.marklogic.test.unit.TestSuiteResult;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ArgumentsSource;

/**
 * Runs all marklogic-unit-test tests located under src/test/ml-modules/root/test.
 * <p>
 * To run these tests, this class just needs to know how to connect to the
 * /v1/resources/marklogic-unit-test endpoint on a REST server.
 * <p>
 * After running this, you can also access the marklogic-unit-test runner at host:8011/test/default.xqy.
 */
@TestInstance(Lifecycle.PER_CLASS)
public class RunMarkLogicUnitTestsTest extends AbstractHubCoreTest {

    private static boolean initialized = false;

    /**
     * We don't need to claim a HubConfig, as one was already claimed by DataHubArgumentsProvider. And all the test
     * modules will be run on the same thread.
     */
    @Override
    @BeforeEach
    public void beforeEachHubTestBaseTest(TestInfo testInfo) {
        if (!initialized) {
            // Need to do these things just once, before the first test module is run
            resetHubProject();
            applyDatabasePropertiesForTests(getHubConfig());
            resetDatabases();
            runAsDataHubDeveloper();
            initialized = true;
        }
    }

    @BeforeEach
    @Override
    protected void beforeEachHubCoreTest() {
        // Don't need to do anything here, as we're doing a one-time initialization in beforeEachHubTestBaseTest
    }

    /**
     * Reset the databases after the last test to ensure that whatever the last test was, it doesn't leave anything
     * behind that could break the next test in the suite.
     */
    @AfterAll
    public void resetDatabasesAfterAllTestsHaveRun(TestInfo testInfo) {
        resetDatabases();
        super.afterEachHubTestBaseTest(testInfo);
    }

    @AfterEach
    @Override
    protected void afterEachHubTestBaseTest(TestInfo testInfo) {
        // We don't want to release, as all tests run on the same thread
        // The AfterAll method will release the HubConfig
    }

    /**
     * This test will report each marklogic-unit-test test module back as a separate JUnit test result.
     *
     * @param testModule
     */
    @ParameterizedTest
    @ArgumentsSource(DataHubArgumentsProvider.class)
    public void test(TestModule testModule) {
        // Ensure we run as data-hub-developer, which has the hub-central-developer role, which flow-developer does not
        runAsDataHubDeveloper();
        logger.info("Running test: " + testModule.getTest() + "; thread: " + Thread.currentThread().getName() + "; host: " + getHubConfig().getHost());
        TestSuiteResult result = new TestManager(getHubConfig().newFinalClient()).run(testModule);
        for (TestResult testResult : result.getTestResults()) {
            String failureXml = testResult.getFailureXml();
            if (failureXml != null) {
                Assertions.fail(String.format("Test %s in suite %s failed, cause: %s", testResult.getName(), testModule.getSuite(), failureXml));
            }
        }
    }

}
