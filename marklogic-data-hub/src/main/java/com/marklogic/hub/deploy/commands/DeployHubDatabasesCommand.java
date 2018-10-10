/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.AbstractUndoableCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.ResourceFilenameFilter;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommandComparator;
import com.marklogic.appdeployer.command.databases.DeploySchemasDatabaseCommand;
import com.marklogic.appdeployer.command.databases.DeployTriggersDatabaseCommand;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.io.File;
import java.util.*;

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

    private HubConfig hubConfig;
    private final String prefix = "staging";

    public DeployHubDatabasesCommand(HubConfig config) {
        this.hubConfig = config;
        setExecuteSortOrder(SortOrderConstants.DEPLOY_OTHER_DATABASES);
        setUndoSortOrder(SortOrderConstants.DELETE_OTHER_DATABASES);
    }

    @Override
    public void execute(CommandContext context) {
        List<DeployDatabaseCommand> list = buildDatabaseCommands(context);
        sortCommandsBeforeExecute(list, context);
        for (DeployDatabaseCommand c : list) {
            logger.debug("Deploying database command: " + c.buildPayload(context) );
            try {
                c.execute(context);
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                    logger.warn("Deployment of database failed with FORBIDDEN.  Assuming a provisioned environment.");
                }
                else {
                    throw(e);
                }

            }
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

        ConfigDir configDir = new ConfigDir(hubConfig.getHubConfigDir().toFile());
        File dir = configDir.getDatabasesDir();
        if (dir != null && dir.exists()) {
            Set<String> ignore = new HashSet<>();
            for (File f : configDir.getContentDatabaseFiles()) {
                ignore.add(f.getName());
            }
            ignore.add(prefix + "-" + DeploySchemasDatabaseCommand.DATABASE_FILENAME);
            ignore.add(prefix + "-" + DeployTriggersDatabaseCommand.DATABASE_FILENAME);

            ResourceFilenameFilter filter = new ResourceFilenameFilter(ignore);
            setResourceFilenameFilter(filter);

            for (File f : listFilesInDirectory(dir)) {
                if (logger.isDebugEnabled()) {
                    logger.debug("Will process other database in file: " + f.getName());
                }
                DeployHubDatabaseCommand c = new DeployHubDatabaseCommand(hubConfig, f.getName());
                dbCommands.add(c);
            }
        }
        return dbCommands;
    }
}
