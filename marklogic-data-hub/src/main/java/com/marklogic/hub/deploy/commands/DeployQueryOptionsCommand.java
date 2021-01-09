/*
 * Copyright (c) 2021 MarkLogic Corporation
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

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.EntityManagerImpl;

public class DeployQueryOptionsCommand extends AbstractCommand {

    private EntityManager entityManager;

    public DeployQueryOptionsCommand(HubConfig hubConfig) {
        this.entityManager = new EntityManagerImpl(hubConfig);
        setExecuteSortOrder(new LoadUserModulesCommand().getExecuteSortOrder() + 1);
    }

    @Override
    public void execute(CommandContext context) {
        entityManager.deployQueryOptions();
    }
}
