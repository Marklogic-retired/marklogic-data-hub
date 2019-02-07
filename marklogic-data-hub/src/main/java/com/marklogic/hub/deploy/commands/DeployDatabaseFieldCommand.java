/*
 * Copyright 2012-2019 MarkLogic Corporation
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
