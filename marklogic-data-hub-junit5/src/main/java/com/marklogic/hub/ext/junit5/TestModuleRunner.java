package com.marklogic.hub.ext.junit5;

import com.marklogic.client.DatabaseClient;
import com.marklogic.test.unit.TestManager;
import com.marklogic.test.unit.TestModule;
import com.marklogic.test.unit.TestResult;
import com.marklogic.test.unit.TestSuiteResult;
import org.junit.jupiter.api.Assertions;

/**
 * Handles running a marklogic-unit-test module, represented by a TestModule instance, and throwing a JUnit5
 * assertion failure if the test module fails.
 */
public class TestModuleRunner {

    private TestManager testManager;

    public TestModuleRunner(DatabaseClient client) {
        this.testManager = new TestManager(client);
    }

    public void runTestModule(TestModule testModule) {
        TestSuiteResult result = this.testManager.run(testModule);
        for (TestResult testResult : result.getTestResults()) {
            String failureXml = testResult.getFailureXml();
            if (failureXml != null) {
                Assertions.fail(String.format("Test %s in suite %s failed, cause: %s", testResult.getName(), testModule.getSuite(), failureXml));
            }
        }
    }
}
