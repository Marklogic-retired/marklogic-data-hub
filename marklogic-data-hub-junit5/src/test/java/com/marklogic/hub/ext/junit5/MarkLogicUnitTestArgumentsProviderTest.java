package com.marklogic.hub.ext.junit5;

import com.marklogic.test.unit.TestModule;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ArgumentsSource;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Example of using MarkLogicUnitTestArgumentsProvider. This also disables HubDatabasePreparer, which is not needed
 * for these tests.
 * <p>
 * This test is a little fragile as it depends on the marklogic-unit-test modules existing in the modules database.
 * But some DHF test classes clear out all user modules.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class MarkLogicUnitTestArgumentsProviderTest extends AbstractDataHubTest {

    private static int testModuleCount = 0;

    @BeforeAll
    public static void beforeAll() {
        HubDatabasePreparer.setEnabled(false);
    }

    @AfterAll
    public static void afterAll() {
        assertTrue(testModuleCount > 0, "Expected at least one test module to be found; please check to see if " +
            "the marklogic-unit-test modules are loaded; if this is failing in a Jenkins pipeline, it's best to run " +
            "the bootstrap task before running the tests for this project to ensure that marklogic-unit-test modules " +
            "are loaded");
        HubDatabasePreparer.setEnabled(true);
    }

    @ParameterizedTest
    @ArgumentsSource(MarkLogicUnitTestArgumentsProvider.class)
    void test(TestModule testModule) {
        logger.info("Found test module: " + testModule);
        testModuleCount++;
    }
}
