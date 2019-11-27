package com.marklogic.hub.deploy.util;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ModuleWatchingConsumerTest {

    private ModuleWatchingConsumer consumer = new ModuleWatchingConsumer(null, null);

    @Test
    public void shouldGenerateFunctionMetadata() {
        Set<Resource> resources = new HashSet<>();
        resources.add(new FileSystemResource("marklogic-data-hub/src/test/ml-modules/root/custom-modules/mapping-functions/custom-mapping-functions.sjs"));
        assertTrue(consumer.shouldFunctionMetadataBeGenerated(resources));
    }

    @Test
    public void shouldNotGenerateFunctionMetadata() {
        Set<Resource> resources = new HashSet<>();
        resources.add(new FileSystemResource("marklogic-data-hub/src/test/ml-modules/root/test/data-hub-test-helper.xqy"));
        assertFalse(consumer.shouldFunctionMetadataBeGenerated(resources));
    }

    @Test
    public void generatingThrowsAnException() {
        TestCommand command = new TestCommand();
        consumer = new ModuleWatchingConsumer(new CommandContext(null, null, null), command);

        Set<Resource> resources = new HashSet<>();
        resources.add(new FileSystemResource("marklogic-data-hub/src/test/ml-modules/root/custom-modules/mapping-functions/custom-mapping-functions.sjs"));
        consumer.accept(resources);

        assertTrue(command.wasExecuted, "The command should have been executed, which means it threw an exception that " +
            "was logged and not rethrown, as we want mlWatch to keep running, even if function metadata cannot be generated.");
    }
}

class TestCommand implements Command {

    public boolean wasExecuted = false;

    @Override
    public void execute(CommandContext context) {
        wasExecuted = true;
        throw new RuntimeException("This should be caught and logged");
    }

    @Override
    public Integer getExecuteSortOrder() {
        return null;
    }
}
