package com.marklogic.hub.deploy;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class HubAppDeployerTest {

    @Test
    public void test() {
        List<String> messages = new ArrayList<>();

        List<Command> commands = new ArrayList<>();
        commands.add(new TestCommand(20, messages));
        commands.add(new TestCommand(30, messages));
        commands.add(new TestCommand(10, messages));

        TestListener testListener = new TestListener();

        HubAppDeployer appDeployer = new HubAppDeployer(null, null, testListener, null);
        appDeployer.setCommands(commands);
        appDeployer.deploy(new AppConfig());

        // Verify commands were executed in correct order
        assertEquals("My sort order: 10", messages.get(0));
        assertEquals("My sort order: 20", messages.get(1));
        assertEquals("My sort order: 30", messages.get(2));

        // Verify correct status messages were passed to our listener
        System.out.println(testListener.getMessages());
        assertEquals("0:Installing...", testListener.getMessages().get(0));
        assertEquals("0:[Step 1 of 3]  com.marklogic.hub.deploy.TestCommand", testListener.getMessages().get(1));
        assertEquals("33:[Step 2 of 3]  com.marklogic.hub.deploy.TestCommand", testListener.getMessages().get(2));
        assertEquals("66:[Step 3 of 3]  com.marklogic.hub.deploy.TestCommand", testListener.getMessages().get(3));
        assertEquals("100:Installation Complete", testListener.getMessages().get(4));
    }
}

class TestCommand implements Command {

    private int sortOrder;
    private List<String> messages;

    public TestCommand(int sortOrder, List<String> messages) {
        this.sortOrder = sortOrder;
        this.messages = messages;
    }

    @Override
    public void execute(CommandContext context) {
        messages.add("My sort order: " + sortOrder);
    }

    @Override
    public Integer getExecuteSortOrder() {
        return sortOrder;
    }
}

class TestListener implements HubDeployStatusListener {

    private List<String> messages = new ArrayList<>();

    @Override
    public void onStatusChange(int percentComplete, String message) {
        messages.add(percentComplete + ":" + message);
    }

    @Override
    public void onError() {

    }

    public List<String> getMessages() {
        return messages;
    }
}
