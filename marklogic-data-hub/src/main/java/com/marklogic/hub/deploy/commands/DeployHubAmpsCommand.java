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
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.impl.Versions;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

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

        // this is a place to optimize -- is there a way to get
        // server versions without an http call?
        String serverVersion = versions.getMarkLogicVersion();


        logger.info("Choosing amp installation based on server version " + serverVersion);

        if (serverVersion.matches("^[789]\\.0-[1234]\\.\\d+")) {
            throw new DataHubConfigurationException("DHF " + hubConfig.getDHFVersion() +" cannot deploy security to server version " + serverVersion);
        }
        if (serverVersion.startsWith("9.0-5")) {
            logger.info("Using non-SSL-compatible method for 9.0-5 servers, for demos only");
            String modulesDatabaseName = hubConfig.getAppConfig().getModulesDatabaseName();
            ManageConfig manageConfig = context.getManageClient().getManageConfig();
            String securityUsername = manageConfig.getSecurityUsername();
            String securityPassword = manageConfig.getSecurityPassword();
            DatabaseClient installerClient = DatabaseClientFactory.newClient(
                hubConfig.getHost(),
                8000,
                "Security",
                new DatabaseClientFactory.DigestAuthContext(securityUsername, securityPassword)
            );
            //new AmpsInstaller(securityStagingClient).installAmps(modulesDatabaseName);
            ServerEvaluationCall call = installerClient.newServerEval();
            try (InputStream is = new ClassPathResource("installer-util/install-amps.xqy").getInputStream()) {
                String ampCall = IOUtils.toString(is, "utf-8");
                is.close();
                ampCall = ampCall.replaceAll("data-hub-MODULES", modulesDatabaseName);
                call.xquery(ampCall);
                call.eval();
            } catch (IOException e) {
                throw new DataHubConfigurationException(e);
            }
        } else {
            logger.info("Using CMA for servers starting with 9.0-6");
            String modulesDatabaseName = hubConfig.getAppConfig().getModulesDatabaseName();
            ManageClient manageClient = context.getManageClient();

            try (InputStream is = new ClassPathResource("hub-internal-config/configurations/amps.json").getInputStream()) {
                String payload = IOUtils.toString(is, "utf-8");
                payload = payload.replaceAll("data-hub-MODULES", modulesDatabaseName);
                manageClient.postJsonAsSecurityUser("/manage/v3", payload);
            } catch (IOException e) {
                throw new DataHubConfigurationException(e);
            }
        }
    }

    @Override
    public void undo(CommandContext context) {
        // this is a place to optimize -- is there a way to get
        // server versions without an http call?
        String serverVersion = versions.getMarkLogicVersion();
        logger.info("Choosing amp uninstall based on server version " + serverVersion);

        if (serverVersion.startsWith("9.0-5")) {
            logger.info("Using non-SSL-compatable method for 9.0-5 servers");
            String modulesDatabaseName = hubConfig.getAppConfig().getModulesDatabaseName();
            ManageConfig manageConfig = context.getManageClient().getManageConfig();
            String securityUsername = manageConfig.getSecurityUsername();
            String securityPassword = manageConfig.getSecurityPassword();
            DatabaseClient installerClient = DatabaseClientFactory.newClient(
                hubConfig.getHost(),
                8000,
                "Security",
                new DatabaseClientFactory.DigestAuthContext(securityUsername, securityPassword)
            );
            //new AmpsInstaller(securityStagingClient).unInstallAmps(modulesDatabaseName);
            ServerEvaluationCall call = installerClient.newServerEval();
            try (InputStream is = new ClassPathResource("installer-util/uninstall-amps.xqy").getInputStream()) {
                String ampCall = IOUtils.toString(is, "utf-8");
                is.close();
                ampCall = ampCall.replaceAll("data-hub-MODULES", modulesDatabaseName);
                call.xquery(ampCall);
                call.eval();
            } catch (IOException e) {
                throw new DataHubConfigurationException(e);
            }
        }
        else {
            // only on 9.0-5 are amps uninstalled at all.
            logger.warn("Amps from uninstalled data hub framework to remain, but are disabled.");
        }
    }

    @Override
    protected File[] getResourceDirs(CommandContext context) {
        return new File[] {
        };
    }


    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }
}
