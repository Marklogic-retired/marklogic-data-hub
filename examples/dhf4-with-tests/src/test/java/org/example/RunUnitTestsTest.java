package org.example;

import com.marklogic.junit5.dhf.DataHubUnitTestsTest;

/**
 * This class must exist on the test classpath so that JUnit5 is able to run something that knows how to
 * execute marklogic-unit-test test modules and aggregate the results into a format that JUnit 5 understands and
 * can include in its report.
 *
 * Note that this test won't pass when the app is only installed with QuickStart, as QuickStart is not aware of
 * mlRestApi dependencies like marklogic-unit-test. If you install with QuickStart, you'll need to then run
 * Gradle's mlReloadModules task to get marklogic-unit-test loaded.
 */
public class RunUnitTestsTest extends DataHubUnitTestsTest {

}

