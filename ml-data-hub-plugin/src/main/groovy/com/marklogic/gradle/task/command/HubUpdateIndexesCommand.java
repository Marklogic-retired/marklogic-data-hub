package com.marklogic.gradle.task.command;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.DataHub;

public class HubUpdateIndexesCommand implements Command {

    private DataHub dataHub;

    public HubUpdateIndexesCommand(DataHub dataHub) {
        this.dataHub = dataHub;
    }

    @Override
    public void execute(CommandContext context) {
        dataHub.updateIndexes();
    }

    @Override
    public Integer getExecuteSortOrder() {
        // value doesn't matter as this is intended to be used solely for the mlUpdateIndexes task
        return 0;
    }
}
