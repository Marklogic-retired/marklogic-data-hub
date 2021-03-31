package com.marklogic.hub.ext.mlunittest;

import com.marklogic.bootstrap.TestAppInstaller;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.test.unit.TestManager;
import com.marklogic.test.unit.TestModule;
import com.marklogic.test.unit.TestResult;
import com.marklogic.test.unit.TestSuiteResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class GenerateTestSuiteTest extends AbstractHubCoreTest {

    Path sourcePath;

    boolean loadedTestModules = false;

    @BeforeEach
    void beforeEach() {
        if (!loadedTestModules) {
            // Need the marklogic-unit-test bundle to be loaded before any of the tests run
            TestAppInstaller.loadTestModules(getHubConfig(), false);
            loadedTestModules = true;
        }

        // A developer can choose any path for test modules; src/test/ml-modules is a common choice
        sourcePath = getHubProject().getProjectDir().resolve("src").resolve("test").resolve("ml-modules");
    }

    @Test
    void generateAndRunTestSuite() {
        List<File> files = new TestSuiteGenerator().generateTestSuite(sourcePath, "generationTestSuite");

        assertEquals(3, files.size(), "teardown modules are not generated because those aren't often needed");
        assertEquals("suiteSetup.sjs", files.get(0).getName());
        assertEquals("setup.sjs", files.get(1).getName());
        assertEquals("test.sjs", files.get(2).getName(), "test.sjs is the default name of the test module");

        verifyGeneratedTestSuiteWorks("test.sjs");
    }

    @Test
    void generateAndRunWithCustomTestModuleName() {
        List<File> files = new TestSuiteGenerator().generateTestSuite(sourcePath, "generationTestSuite", "customModuleName");

        assertEquals(3, files.size());
        assertEquals("suiteSetup.sjs", files.get(0).getName());
        assertEquals("setup.sjs", files.get(1).getName());
        assertEquals("customModuleName.sjs", files.get(2).getName(), "The filename should use the value provided by the user");

        verifyGeneratedTestSuiteWorks("customModuleName.sjs");
    }

    private void verifyGeneratedTestSuiteWorks(String expectedTestModuleFilename) {
        loadGeneratedTestModules(sourcePath);
        createDataThatShouldBeDeletedWhenTestIsRun();

        TestSuiteResult result = runGeneratedTestSuite(expectedTestModuleFilename);

        assertEquals(1, result.getTotal(), "The generated test suite should contain 1 example test");
        assertEquals(1, result.getPassed(), "The generated test module should have one simple assertion that passes");
        assertEquals(0, result.getFailed());
        TestResult testResult = result.getTestResults().get(0);
        assertEquals(expectedTestModuleFilename, testResult.getName());
        assertNull(testResult.getFailureXml());

        assertEquals(0, getStagingDocCount("stagingTestData"), "The generated test suite should use the " +
            "DH prepareDatabases() helper function to delete documents that are not artifacts");
        assertEquals(0, getFinalDocCount("finalTestData"));
        assertEquals(0, getJobsDocCount("Jobs"), "The prepareDatabases helper function should delete everything " +
            "in the 'Jobs' collection in the jobs database");
    }

    private void loadGeneratedTestModules(Path sourcePath) {
        getHubConfig().getAppConfig().getModulePaths().add(sourcePath.toFile().getAbsolutePath());
        new LoadUserModulesCommand(getHubConfig()).execute(newCommandContext());
    }

    private void createDataThatShouldBeDeletedWhenTestIsRun() {
        writeStagingJsonDoc("/stagingDoc.json", "{}", "stagingTestData");
        writeFinalJsonDoc("/finalDoc.json", "{}", "finalTestData");
        writeJsonDoc(getHubClient().getJobsClient(), "/jobDoc.json", "{}", "Jobs");
        assertEquals(1, getStagingDocCount("stagingTestData"));
        assertEquals(1, getFinalDocCount("finalTestData"));
        assertEquals(1, getJobsDocCount("Jobs"));
    }

    private TestSuiteResult runGeneratedTestSuite(String expectedTestModuleFilename) {
        TestManager testManager = new TestManager(getHubClient().getFinalClient());
        TestModule generatedTestModule = null;
        for (TestModule testModule : testManager.list()) {
            if ("generationTestSuite".equals(testModule.getSuite()) && expectedTestModuleFilename.equals(testModule.getTest())) {
                generatedTestModule = testModule;
                break;
            }
        }

        if (generatedTestModule == null) {
            fail("Could not find generated test suite in modules database with filename: " + expectedTestModuleFilename);
        }

        return testManager.run(generatedTestModule);
    }
}
