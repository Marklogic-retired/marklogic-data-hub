package com.marklogic.hub.ext.mlunittest;

import com.marklogic.client.ext.helper.LoggingObject;
import org.springframework.util.Assert;
import org.springframework.util.FileCopyUtils;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Generates marklogic-unit-test test suites. Primary intended interface is the DHF Gradle plugin.
 */
public class TestSuiteGenerator extends LoggingObject {

    public List<File> generateTestSuite(Path sourcePath, String suiteName) {
        return generateTestSuite(sourcePath, suiteName, null);
    }

    public List<File> generateTestSuite(Path sourcePath, String suiteName, String testModuleName) {
        Assert.notNull(sourcePath, "sourcePath must be specified");
        Assert.notNull(suiteName, "suiteName must be specified");
        if (StringUtils.isEmpty(testModuleName)) {
            testModuleName = "test";
        }

        File suiteDir = sourcePath.resolve("root").resolve("test").resolve("suites").resolve(suiteName).toFile();
        suiteDir.mkdirs();

        List<File> generatedFiles = new ArrayList<>();

        writeFile(new File(suiteDir, "suiteSetup.sjs"),
            "// Uncomment the three lines below to prepare the databases once before all test modules are run.\n" +
                "// If you instead want to prepare the databases before each test module is run, modify setup.sjs .\n\n" +
                "// declareUpdate();\n" +
                "// const dhmut = require('/data-hub/public/marklogic-unit-test/hub-test-helper.xqy');\n" +
                "// dhmut.prepareDatabases();", generatedFiles
        );

        writeFile(new File(suiteDir, "setup.sjs"),
            "// Uses the Data Hub test helper library to prepare the staging, final, and job databases before each test module is run.\n" +
                "// If you need this functionality instead at the suite level, just remove the code below and modify the generated suiteSetup.sjs file.\n" +
                "// If you do not need this functionality, it is safe to delete the code below and/or this module.\n\n" +
                "declareUpdate();\n" +
                "const dhmut = require('/data-hub/public/marklogic-unit-test/hub-test-helper.xqy');\n" +
                "dhmut.prepareDatabases();", generatedFiles);

        writeFile(new File(suiteDir, testModuleName + ".sjs"),
            "// Example test module that performs a single assertion and returns an array containing the result of that single assertion.\n" +
                "// This is a simple starting point for a test module; modify as needed.\n\n" +
                "const test = require('/test/test-helper.xqy');\n\n" +
                "const assertions = [];\n\n" +
                "assertions.push(test.assertEqual(true, true));\n\n" +
                "assertions", generatedFiles);

        return generatedFiles;
    }

    private void writeFile(File file, String content, List<File> generatedFiles) {
        if (file.exists()) {
            logger.warn("File already exists, will not overwrite: " + file.getAbsolutePath());
        } else {
            try {
                FileCopyUtils.copy(content.getBytes(), file);
                generatedFiles.add(file);
            } catch (IOException e) {
                throw new RuntimeException("Unable to write unit test file: " + file.getAbsolutePath() + "; cause: " + e.getMessage());
            }
        }
    }
}
