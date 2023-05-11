package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubConfig;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * DHF extension that provides support for writing triggers to any triggers database.
 */
public class DeployHubTriggersCommand extends DeployTriggersCommand {
    private final HubConfig hubConfig;
    private final String[] oldTriggersToRemove = new String[]{"ml-dh-json-mapping-create","ml-dh-json-mapping-modify","ml-dh-json-mapping-delete"};

    public DeployHubTriggersCommand(HubConfig hubConfig, String triggersDatabase) {
        this.hubConfig = hubConfig;
        setDatabaseIdOrName(triggersDatabase);
    }

    @Override
    public void execute(CommandContext context) {
        removeOldTriggers();
        super.execute(context);
    }

    private void removeOldTriggers() {
        DatabaseClient finalClient = hubConfig.newFinalClient(hubConfig.getFinalTriggersDbName());
        DatabaseClient stagingClient = hubConfig.newStagingClient(hubConfig.getStagingTriggersDbName());
        String xquery = "xquery version \"1.0-ml\";\n" +
                "import module namespace trgr=\"http://marklogic.com/xdmp/triggers\" \n" +
                "   at \"/MarkLogic/triggers.xqy\";\n" +
                "\n";
        xquery = xquery + Arrays.stream(oldTriggersToRemove).map(oldTrigger -> "try { trgr:remove-trigger(\"" + oldTrigger + "\") } catch * {()}").collect(Collectors.joining(", "));
        finalClient.newServerEval().xquery(xquery).eval().close();
        stagingClient.newServerEval().xquery(xquery).eval().close();
    }
}
