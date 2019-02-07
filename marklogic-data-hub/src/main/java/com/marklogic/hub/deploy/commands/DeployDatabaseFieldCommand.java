package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class DeployDatabaseFieldCommand extends DeployDatabaseCommand {

    public DeployDatabaseFieldCommand() {
        setExecuteSortOrder(SortOrderConstants.DEPLOY_CONTENT_DATABASES + 1);
    }

    @Override
    public void execute(CommandContext context) {
        List<DeployDatabaseCommand> databaseCommandList = buildDatabaseCommands();
        for (DeployDatabaseCommand deployDatabaseCommand : databaseCommandList) {
            deployDatabaseCommand.execute(context);
        }
    }

    private List<DeployDatabaseCommand> buildDatabaseCommands() {
        List<DeployDatabaseCommand> dbCommands = new ArrayList<>();

        String filePath = Objects.requireNonNull(getClass().getClassLoader().getResource("ml-database-field"))
            .getFile();
        File databaseFieldDir = new File(filePath);

        if (databaseFieldDir.exists()) {
            for (File databaseFile : listFilesInDirectory(databaseFieldDir)) {
                logger.info("Will process file: " + databaseFile);
                dbCommands.add(new DeployDatabaseCommand(databaseFile));
            }
        }

        return dbCommands;
    }
}
