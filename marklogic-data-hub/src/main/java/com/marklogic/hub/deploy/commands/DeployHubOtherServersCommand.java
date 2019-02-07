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
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand;
import com.marklogic.mgmt.resource.ResourceManager;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.io.File;

/**
 * Extends the ml-app-deployer command to provide some custom error handling.
 */
public class DeployHubOtherServersCommand extends DeployOtherServersCommand {

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

}
