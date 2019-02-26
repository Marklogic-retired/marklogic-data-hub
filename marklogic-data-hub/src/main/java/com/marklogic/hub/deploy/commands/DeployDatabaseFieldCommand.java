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
import org.apache.commons.io.FileUtils;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

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

        InputStream inputStream = null;
        try {
            ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(getClass().getClassLoader());
            Resource[] resources = resolver.getResources("classpath*:/ml-database-field/*.xml");
            for (Resource r : resources) {
                inputStream = r.getInputStream();
                File databaseFile = File.createTempFile("db-field-", ".xml");
                databaseFile.deleteOnExit();
                FileUtils.copyInputStreamToFile(inputStream, databaseFile);

                logger.info("Will process file: " + databaseFile);
                dbCommands.add(new DeployDatabaseCommand(databaseFile));
            }
        }
        catch (IOException e) {
            e.printStackTrace();
        }
        finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                }
                catch (IOException e) {
                }
            }
        }

        return dbCommands;
    }
}
