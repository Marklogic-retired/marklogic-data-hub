package com.marklogic.hub_unit_test;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.junit5.MarkLogicUnitTestArgumentsProvider;
import com.marklogic.test.unit.TestManager;
import com.marklogic.test.unit.TestModule;
import com.marklogic.test.unit.TestResult;
import com.marklogic.test.unit.TestSuiteResult;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ArgumentsSource;
import org.springframework.test.context.ContextConfiguration;

/**
 * Runs all marklogic-unit-test tests located under src/test/ml-modules/root/test.
 * <p>
 * To run these tests, this class just needs to know how to connect to the
 * /v1/resources/marklogic-unit-test endpoint on a REST server.
 * <p>
 * After running this, you can also access the marklogic-unit-test runner at host:8011/test/default.xqy.
 */
@ContextConfiguration(classes = {TestConfig.class})
@TestInstance(Lifecycle.PER_CLASS)
public class RunMarkLogicUnitTestsTest extends AbstractHubCoreTest {

    private static boolean initialized = false;

    @BeforeAll
    public void prepareDatabasesBeforeAnyTestsRun() {
        applyDatabasePropertiesForTests(adminHubConfig);

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
        // Ensure we run as data-hub-developer, which has the hub-central-developer role, which flow-developer does not
        runAsDataHubDeveloper();
        TestSuiteResult result = new TestManager(adminHubConfig.newFinalClient()).run(testModule);
        for (TestResult testResult : result.getTestResults()) {
            String failureXml = testResult.getFailureXml();
            if (failureXml != null) {
                Assertions.fail(String.format("Test %s in suite %s failed, cause: %s", testResult.getName(), testModule.getSuite(), failureXml));
            }
        }
    }

}
