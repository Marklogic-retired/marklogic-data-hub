/*
 * Copyright (c) 2020 MarkLogic Corporation
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

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.mgmt.resource.ResourceManager;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.io.File;
import java.util.Map;

/**
 * Extends the ml-app-deployer command to provide some custom error handling.
 */
public class DeployHubOtherServersCommand extends DeployOtherServersCommand {

    private String serverVersion;
    private HubConfig hubConfig;

    /**
     * @param hubConfig required so that a connection can be made to ML, regardless of whether DHF has been installed yet
     *                  or not
     */
    public DeployHubOtherServersCommand(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    public void execute(CommandContext context) {
        addServerVersionToCustomTokens(context);
        super.execute(context);
    }

    protected void addServerVersionToCustomTokens(CommandContext context) {
        AppConfig appConfig = context.getAppConfig();
        Map<String, String> customTokens = appConfig.getCustomTokens();
        final String token = "%%mlServerVersion%%";
        try {
            final String version = serverVersion != null ? serverVersion : new MarkLogicVersion(hubConfig.getManageClient()).getVersionString();
            customTokens.put(token, version.replaceAll("([^.]+)\\..*", "$1"));
        } catch (Exception ex) {
            logger.warn("Unable to determine the server version; cause: " + ex.getMessage());
            logger.warn("Will set mlServerVersion to 9 as a fallback");
            customTokens.put(token, "9");
        }
    }

    @Override
    protected void deleteResource(ResourceManager mgr, CommandContext context, File f) {
        try {
            super.deleteResource(mgr, context, f);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                logger.warn("Unable to delete resource due to missing user or bad credentials, skipping.");
            } else {
                throw e;
            }
        }
    }

    public void setServerVersion(String serverVersion) {
        this.serverVersion = serverVersion;
    }
}
