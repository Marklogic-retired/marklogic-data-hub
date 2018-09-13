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

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import org.apache.commons.io.IOUtils;
import org.springframework.core.io.ClassPathResource;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

public class DeployHubAmpsCommand extends DeployAmpsCommand {

    private HubConfig hubConfig;

    public DeployHubAmpsCommand(HubConfig hubConfig) {
        super();
        this.hubConfig = hubConfig;
    }

    /**
     * Installs the amps for DHF via CMA endpoint
     * @param context
     */
    @Override
    public void execute(CommandContext context) {
        String stagingModulesDatabaseName = hubConfig.getStagingAppConfig().getModulesDatabaseName();
        ManageClient manageClient = context.getManageClient();

        try (InputStream is = new ClassPathResource("hub-internal-config/configurations/amps.json").getInputStream()) {
            String payload = IOUtils.toString(is, "utf-8");
            manageClient.postJsonAsSecurityUser("/manage/v3", payload);
        } catch (IOException e) {
            throw new DataHubConfigurationException(e);
        }
    }

    @Override
    public void undo(CommandContext context) {
        logger.warn("Amps from uninstalled data hub framework to remain, but are disabled.");
    }

    @Override
    protected File[] getResourceDirs(CommandContext context) {
        return new File[] {
        };
    }
}
