package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.ext.mlunittest.TestSuiteGenerator
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

import java.nio.file.Path
import java.nio.file.Paths

class GenerateTestSuiteTask extends HubTask {

    @TaskAction
    void generateTestSuite() {
        def suiteName = getRequiredPropertyValue("suiteName",
            "Please specify a suite name via -PsuiteName=nameOfTestSuite")

        def testModuleName = getOptionalPropertyValue("testName")
        def userDefinedSourcePath = getOptionalPropertyValue("sourcePath")

        Path sourcePath
        if (userDefinedSourcePath != null) {
            sourcePath = Paths.get(userDefinedSourcePath)
        }
        else {
            List<String> modulePaths = getHubConfig().getAppConfig().getModulePaths()
            if (modulePaths == null || modulePaths.isEmpty()) {
                throw new GradleException("No module paths defined; either define a source path via -PsourcePath=path/to/modules, or define mlModulePaths")
            }
            String presumedTestModulePath = modulePaths.get(modulePaths.size() - 1)
            sourcePath = Paths.get(presumedTestModulePath)
        }

        List<File> files = new TestSuiteGenerator().generateTestSuite(sourcePath, suiteName, testModuleName)

        println "\nGenerated the following files:"
        for (File f : files) {
            println f.getAbsolutePath()
        }
        println ""
    }
}
