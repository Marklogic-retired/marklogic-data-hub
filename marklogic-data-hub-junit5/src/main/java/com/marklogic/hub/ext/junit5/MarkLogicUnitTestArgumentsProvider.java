package com.marklogic.hub.ext.junit5;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.DatabaseClientProvider;
import com.marklogic.test.unit.TestManager;
import com.marklogic.test.unit.TestModule;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.ArgumentsProvider;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;
import java.util.stream.Stream;

/**
 * Implements the JUnit5 ArgumentsProvider interface so that it can provide a stream of marklogic-unit-test-client
 * TestModule instances to a parameterized test class.
 * <p>
 * This class depends on the Spring container that can be found in the JUnit5 ExtensionContext to contain a single
 * instance of DatabaseClientProvider. That bean is used to obtain a DatabaseClient that is then used to get the list
 * of test modules via the marklogic-unit-test REST extension that is assumed to be installed at
 * /v1/resources/marklogic-unit-test.
 * <p>
 * The marklogic-community:marklogic-junit5 has a very similar implementation of this class, but because the only
 * available release of that library - 1.0.0 - brings along a number of other classes that aren't needed and can cause
 * confusion, this project instead provides its own implementation.
 */
public class MarkLogicUnitTestArgumentsProvider implements ArgumentsProvider {

    @Override
    public Stream<? extends Arguments> provideArguments(ExtensionContext context) {
        TestManager testManager = new TestManager(getDatabaseClient(context));
        try {
            List<TestModule> testModules = testManager.list();
            return Stream.of(testModules.toArray(new TestModule[]{})).map(Arguments::of);
        } catch (Exception ex) {
            String message = "Could not obtain a list of marklogic-unit-test modules; " +
                "please verify that the marklogic-unit-test library has been loaded into your modules database and " +
                "that the REST extension path '/v1/resources/marklogic-unit-test' is accessible; cause: " + ex.getMessage();
            throw new RuntimeException(message, ex);
        }
    }

    private DatabaseClient getDatabaseClient(ExtensionContext extensionContext) {
        ApplicationContext applicationContext = SpringExtension.getApplicationContext(extensionContext);

        DatabaseClientProvider databaseClientProvider;
        try {
            databaseClientProvider = applicationContext.getBean(DatabaseClientProvider.class);
        } catch (NoSuchBeanDefinitionException e) {
            throw new RuntimeException("Unable to find an instance of " + DatabaseClientProvider.class + " in the " +
                "Spring container; please ensure that the Spring Configuration class(es) you're using contain an instance " +
                "of this class, as a DatabaseClient is needed to get the list of test modules to run", e);
        }
        return databaseClientProvider.getDatabaseClient();
    }
}
