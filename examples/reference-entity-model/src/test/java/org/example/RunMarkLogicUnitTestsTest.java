package org.example;

import com.marklogic.hub.ext.junit5.AbstractDataHubTest;
import com.marklogic.hub.ext.junit5.HubDatabasePreparer;
import com.marklogic.hub.ext.junit5.MarkLogicUnitTestArgumentsProvider;
import com.marklogic.hub.ext.junit5.TestModuleRunner;
import com.marklogic.test.unit.TestModule;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ArgumentsSource;

/**
 * Example of a JUnit5 ParameterizedTest that can run each of the marklogic-unit-test module as a separate
 * test. A class like this must exist in your test source tree in order to run these test modules. It's not possible for
 * the marklogic-data-hub-junit5 library to include this itself, as a JUnit5 test runner will not run it unless it
 * sees the test in your test source tree.
 * <p>
 * The critical part of this class is the use of MarkLogicUnitTestArgumentsProvider as the ArgumentsSource. This
 * class will find each test module in the modules database and create a TestModule for it. TestModuleRunner is then
 * a convenience for running a test module and throwing an assertion failure if the test module fails.
 * <p>
 * It's assumed that those test modules have their own way of preparing the database before each test,
 * and thus this test shows how to disable HubDatabasePreparer to avoid preparing the database twice and
 * causing tests to take longer than necessary.
 * </p>
 */
public class RunMarkLogicUnitTestsTest extends AbstractDataHubTest {

    private TestModuleRunner testModuleRunner;

    @BeforeAll
    public static void beforeAll() {
        HubDatabasePreparer.setEnabled(false);
    }

    @AfterAll
    public static void afterAll() {
        HubDatabasePreparer.setEnabled(true);
    }

    @ParameterizedTest
    @ArgumentsSource(MarkLogicUnitTestArgumentsProvider.class)
    public void test(TestModule testModule) {
        if (testModuleRunner == null) {
            testModuleRunner = new TestModuleRunner(getHubClient().getFinalClient());
        }
        testModuleRunner.runTestModule(testModule);
    }

}
