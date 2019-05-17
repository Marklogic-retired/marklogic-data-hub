package com.marklogic.hub;

import com.marklogic.junit5.MarkLogicUnitTestArgumentsProvider;
import com.marklogic.junit5.spring.AbstractSpringMarkLogicTest;
import com.marklogic.test.unit.TestModule;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ArgumentsSource;
import org.springframework.test.context.ContextConfiguration;

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
@ContextConfiguration(classes = {TestConfig.class})
public class RunMarkLogicUnitTestsTest extends AbstractSpringMarkLogicTest {

    @Override
    public void deleteDocumentsBeforeTestRuns() {
        // No need for this yet
    }

    /**
     * This test will report each marklogic-unit-test test module back as a separate JUnit test result.
     *
     * @param testModule
     */
    @ParameterizedTest
    @ArgumentsSource(MarkLogicUnitTestArgumentsProvider.class)
    public void test(TestModule testModule) {
        runMarkLogicUnitTests(testModule);
    }

}
