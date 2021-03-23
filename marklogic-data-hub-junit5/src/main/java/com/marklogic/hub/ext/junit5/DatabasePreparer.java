package com.marklogic.hub.ext.junit5;

import org.springframework.test.context.TestContext;

public interface DatabasePreparer {

    void prepareDatabasesBeforeTestMethod(TestContext testContext);
}
