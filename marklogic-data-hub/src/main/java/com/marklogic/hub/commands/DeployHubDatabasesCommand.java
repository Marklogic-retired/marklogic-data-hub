package com.marklogic.hub.commands;

import java.io.File;
import java.util.*;

import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.AbstractUndoableCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.ResourceFilenameFilter;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommandComparator;
import com.marklogic.appdeployer.command.databases.DeploySchemasDatabaseCommand;
import com.marklogic.appdeployer.command.databases.DeployTriggersDatabaseCommand;

/**
 * This commands handles deploying/undeploying every database file except the "default" ones of content-database.json,
 * triggers-database.json, and schemas-database.json. Those default ones are supported for ease-of-use, but it's not
 * uncommon to need to create additional databases (and perhaps REST API servers to go with them).
 * <p>
 * A key aspect of this class is its attempt to deploy/undeploy databases in the correct order. For each database file
 * that it finds that's not one of the default ones, a DeployDatabaseCommand will be created. All of those commands will
 * then be sorted based on the presence of "triggers-database" or "schema-database" within the payload for the command.
 * <p>
 * If the above strategy doesn't work for you, you can always resort to naming your database files to control the order
 * that they're processed in.
 * </p>
 */
public class DeployHubDatabasesCommand extends AbstractUndoableCommand {

    public DeployHubDatabasesCommand() {
        setExecuteSortOrder(SortOrderConstants.DEPLOY_OTHER_DATABASES);
        setUndoSortOrder(SortOrderConstants.DELETE_OTHER_DATABASES);
    }

    @Override
    public void execute(CommandContext context) {
        List<DeployDatabaseCommand> list = buildDatabaseCommands(context);
        sortCommandsBeforeExecute(list, context);
        for (DeployDatabaseCommand c : list) {
            c.execute(context);
        }
    }

    protected void sortCommandsBeforeExecute(List<DeployDatabaseCommand> list, CommandContext context) {
        Collections.sort(list, new DeployDatabaseCommandComparator(context, false));
    }

    @Override
    public void undo(CommandContext context) {
        List<DeployDatabaseCommand> list = buildDatabaseCommands(context);
        sortCommandsBeforeUndo(list, context);
        for (DeployDatabaseCommand c : list) {
            c.undo(context);
        }
    }

    protected void sortCommandsBeforeUndo(List<DeployDatabaseCommand> list, CommandContext context) {
        Collections.sort(list, new DeployDatabaseCommandComparator(context, true));
    }

    protected List<DeployDatabaseCommand> buildDatabaseCommands(CommandContext context) {
        List<DeployDatabaseCommand> dbCommands = new ArrayList<>();

        ConfigDir configDir = context.getAppConfig().getConfigDir();
        File dir = configDir.getDatabasesDir();
        if (dir != null && dir.exists()) {
            Set<String> ignore = new HashSet<>();
            for (File f : configDir.getContentDatabaseFiles()) {
                ignore.add(f.getName());
            }
            ignore.add(DeploySchemasDatabaseCommand.DATABASE_FILENAME);
            ignore.add(DeployTriggersDatabaseCommand.DATABASE_FILENAME);

            ResourceFilenameFilter filter = new ResourceFilenameFilter(ignore);
            setResourceFilenameFilter(filter);

            for (File f : listFilesInDirectory(dir)) {
                if (logger.isDebugEnabled()) {
                    logger.debug("Will process other database in file: " + f.getName());
                }
                DeployDatabaseCommand c = new DeployDatabaseCommand();
                c.setDatabaseFilename(f.getName());
                c.setForestFilename(f.getName().replace("-database", "-forest"));
                dbCommands.add(c);
            }
        }
        return dbCommands;
    }
}
