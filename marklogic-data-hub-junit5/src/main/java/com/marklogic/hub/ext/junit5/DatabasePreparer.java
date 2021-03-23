package com.marklogic.hub.ext.junit5;

import org.springframework.test.context.TestContext;

/**
 * Defines how the DHF databases are prepared before a test method is executed. A typical best practice is to remove
 * all data expect for DHF artifacts, both OOTB ones and user-defined ones.
 */
public interface DatabasePreparer {

    void prepareDatabasesBeforeTestMethod(TestContext testContext);
}
