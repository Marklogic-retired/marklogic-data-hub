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

import com.marklogic.appdeployer.command.AbstractUndoableCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.ResourceFilenameFilter;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommandComparator;
import com.marklogic.appdeployer.command.databases.DeploySchemasDatabaseCommand;
import com.marklogic.appdeployer.command.databases.DeployTriggersDatabaseCommand;
import com.marklogic.hub.HubConfig;

import java.io.File;
import java.util.*;

public class DeployHubOtherDatabasesCommand extends AbstractUndoableCommand {

    private HubConfig hubConfig;
    private final String prefix = "final";
        
    public DeployHubOtherDatabasesCommand(HubConfig config) {
        this.hubConfig = config;
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

        File dir = hubConfig.getUserDatabaseDir().toFile();
        if (dir != null && dir.exists()) {
            Set<String> ignore = new HashSet<>();
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