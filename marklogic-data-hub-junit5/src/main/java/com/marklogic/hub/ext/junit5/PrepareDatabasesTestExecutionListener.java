package com.marklogic.hub.ext.junit5;

import com.marklogic.client.ext.helper.LoggingObject;
import org.springframework.test.context.TestContext;
import org.springframework.test.context.TestExecutionListener;

import java.util.Map;

/**
 * Allows for each DatabasePreparer found in the Spring ApplicationContext to be invoked before a test method is run.
 */
public class PrepareDatabasesTestExecutionListener extends LoggingObject implements TestExecutionListener {

    @Override
    public void beforeTestMethod(TestContext testContext) {
        Map<String, DatabasePreparer> map = testContext.getApplicationContext().getBeansOfType(DatabasePreparer.class);
        map.keySet().forEach(beanName -> {
            if (logger.isInfoEnabled()) {
                logger.info(format("Invoking DatabasePreparer with bean name: %s", beanName));
            }
            map.get(beanName).prepareDatabasesBeforeTestMethod(testContext);
        });
    }

}
