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
 * for any of these tests. The test project will need to have been deployed already though via
 * "gradle bootstrap".
 */
@ContextConfiguration(classes = {TestConfig.class})
public class RunMarkLogicUnitTestsTest extends AbstractSpringMarkLogicTest {

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
