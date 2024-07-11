package com.marklogic.gradle.task.command;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.DataHub;

public class HubUpdateIndexesCommand implements Command {
    private final DataHub dataHub;

    public HubUpdateIndexesCommand(DataHub dataHub) {
        this.dataHub = dataHub;
    }
    @Override
    public void execute(CommandContext commandContext) {
        System.out.println("Updating the indexes on each application database");
        dataHub.updateIndexes();
        System.out.println("Finished updating indexes");
    }

    @Override
    public Integer getExecuteSortOrder() {
        return 0;
    }
}
