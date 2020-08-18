package com.marklogic.hub_unit_test;

import com.marklogic.bootstrap.Installer;
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
        hubConfigInterceptor.claimHubConfig(Thread.currentThread().getName());
        HubConfigImpl hubConfig = hubConfigInterceptor.getProxiedHubConfig(Thread.currentThread().getName());

        // Ensure the test modules are present
        // And run the security commands that ensure certain test resources are in place for the unit tests
        Installer.loadTestModules(hubConfig, true);

        final DatabaseClient client = hubConfig.newFinalClient();
        TestManager testManager = new TestManager(client);
        try {
            List<TestModule> testModules = testManager.list();
            return Stream.of(testModules.toArray(new TestModule[]{})).map(Arguments::of);
        } catch (Exception ex) {
            logger.error("Could not obtain a list of marklogic-unit-test modules; " +
                "please verify that the ml-unit-test library has been properly loaded and that /v1/resources/marklogic-unit-test is accessible", ex);
            return Stream.of();
        }
    }
}
