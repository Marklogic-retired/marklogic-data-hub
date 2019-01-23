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
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.util.CMASettings;
import com.marklogic.hub.impl.Versions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class DeployHubAmpsCommand extends DeployAmpsCommand {

    @Autowired
    private HubConfig hubConfig;

    @Autowired
    private Versions versions;

    public DeployHubAmpsCommand() {
        super();
    }

    /**
     * This is still needed by the Gradle tasks.
     *
     * @param hubConfig
     */
    public DeployHubAmpsCommand(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.versions = new Versions(hubConfig);
    }

    /**
     * Installs the amps for DHF via CMA endpoint
     * @param context The command context for execution.
     */
    @Override
    public void execute(CommandContext context) {
        CMASettings.getInstance().setCmaSettings(context.getAppConfig());
        super.execute(context);
    }

    @Override
    public void undo(CommandContext context) {
        // this is a place to optimize -- is there a way to get
        // server versions without an http call?
        String hubVersion = versions.getHubVersion();
        CMASettings.getInstance().setCmaSettings(context.getAppConfig());
        if (hubVersion.contains("-SNAPSHOT")) {
            logger.warn("Amps from uninstalled data hub framework to remain, but are disabled.");
        }
        else {
            logger.info("Uninstalling amps from data hub framework.");
            super.execute(context);
        }
    }

    @Override
    protected File[] getResourceDirs(CommandContext context) {
        return super.getResourceDirs(context);
    }


    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }
}
