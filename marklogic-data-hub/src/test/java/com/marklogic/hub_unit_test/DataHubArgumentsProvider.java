package com.marklogic.hub_unit_test;

import com.marklogic.bootstrap.TestAppInstaller;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.test.HubConfigInterceptor;
import com.marklogic.test.unit.TestManager;
import com.marklogic.test.unit.TestModule;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.ArgumentsProvider;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.Properties;
import java.util.stream.Stream;

/**
 * Need to use a custom ArgumentsProvider instead of the one in marklogic-unit-test, as we need to fetch a HubConfig
 * via HubConfigInterceptor.
 */
public class DataHubArgumentsProvider extends LoggingObject implements ArgumentsProvider {

    @Override
    public Stream<? extends Arguments> provideArguments(ExtensionContext context) {
        ApplicationContext applicationContext = SpringExtension.getApplicationContext(context);
        HubConfigInterceptor hubConfigInterceptor = applicationContext.getBean(HubConfigInterceptor.class);
        hubConfigInterceptor.borrowHubConfig(Thread.currentThread().getName());
        HubConfigImpl hubConfig = hubConfigInterceptor.getProxiedHubConfig(Thread.currentThread().getName());

        // Need to run as admin in order to run TestAppInstaller function
        Properties props = new Properties();
        props.setProperty("mlUsername", "test-admin-for-data-hub-tests");
        props.setProperty("mlPassword", "password");
        props.setProperty("mlHost", hubConfig.getHost());
        hubConfig.applyProperties(props);

        logger.info("Loading test modules and running security commands to ensure that test modules and certain " +
            "test resources are in place before unit tests are run; host: " + hubConfig.getHost() + "; user: " + hubConfig.getMlUsername());
        TestAppInstaller.loadTestModules(hubConfig, true);

        final DatabaseClient client = hubConfig.newFinalClient();
        TestManager testManager = new TestManager(client);
        try {
            List<TestModule> testModules = testManager.list();
            logger.info("marklogic-unit-test test count: " + testModules.size());
            return Stream.of(testModules.toArray(new TestModule[]{})).map(Arguments::of);
        } catch (Exception ex) {
            logger.error("Could not obtain a list of marklogic-unit-test modules; " +
                "please verify that the ml-unit-test library has been properly loaded and that /v1/resources/marklogic-unit-test is accessible", ex);
            return Stream.of();
        }
    }
}
