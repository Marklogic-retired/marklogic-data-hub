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
import com.marklogic.mgmt.ManageConfig;
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

    @Override
    public void execute(CommandContext context) {
        String stagingModulesDatabaseName = hubConfig.getStagingAppConfig().getModulesDatabaseName();
        ManageConfig manageConfig = context.getManageClient().getManageConfig();
        String securityUsername = manageConfig.getSecurityUsername();
        String securityPassword = manageConfig.getSecurityPassword();
        DatabaseClient installerClient = DatabaseClientFactory.newClient(
            hubConfig.getHost(),
            8000,
            "Security",
            new DatabaseClientFactory.DigestAuthContext(securityUsername, securityPassword)
        );
        //new AmpsInstaller(securityStagingClient).installAmps(stagingModulesDatabaseName);
        ServerEvaluationCall call = installerClient.newServerEval();
        try (InputStream is = new ClassPathResource("installer-util/install-amps.xqy").getInputStream()) {
            String ampCall = new InputStreamHandle(is).toString();
            is.close();
            ampCall.replace("data-hub-staging-MODULES", hubConfig.getDbName(DatabaseKind.STAGING_MODULES));
            call.xquery(ampCall);
            call.eval();
        } catch (IOException e) {
            throw new DataHubConfigurationException(e);
        }
    }

    @Override
    public void undo(CommandContext context) {
        String stagingModulesDatabaseName = hubConfig.getStagingAppConfig().getModulesDatabaseName();
        ManageConfig manageConfig = context.getManageClient().getManageConfig();
        String securityUsername = manageConfig.getSecurityUsername();
        String securityPassword = manageConfig.getSecurityPassword();
        DatabaseClient installerClient = DatabaseClientFactory.newClient(
            hubConfig.getHost(),
            8000,
            "Security",
            new DatabaseClientFactory.DigestAuthContext(securityUsername, securityPassword)
        );
        //new AmpsInstaller(securityStagingClient).unInstallAmps(stagingModulesDatabaseName);
        ServerEvaluationCall call = installerClient.newServerEval();
        try (InputStream is = new ClassPathResource("installer-util/uninstall-amps.xqy").getInputStream()) {
            String ampCall = new InputStreamHandle(is).toString();
            is.close();
            ampCall.replace("data-hub-staging-MODULES", hubConfig.getDbName(DatabaseKind.STAGING_MODULES));
            call.xquery(ampCall);
            call.eval();
        } catch (IOException e) {
            throw new DataHubConfigurationException(e);
        }
    }

    @Override
    protected File[] getResourceDirs(CommandContext context) {
        return new File[] {
        };
    }
}
