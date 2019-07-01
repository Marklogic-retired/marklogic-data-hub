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
package com.marklogic.hub.deploy;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.UndoableCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.AdminManager;

/**
 * Extends ml-app-deployer's SimpleAppDeployer to provide progress reporting.
 */
public class HubAppDeployer extends SimpleAppDeployer {

    private ManageClient manageClient;
    private AdminManager adminManager;
    private HubDeployStatusListener listener;
    // this is for the telemetry hook to use mlUsername/mlPassword
    private DatabaseClient databaseClient;

    private String mlVersion = null;
    // Keeps track of completion percentage
    private int completed = 0;

    public HubAppDeployer(ManageClient manageClient, AdminManager adminManager, HubDeployStatusListener listener, DatabaseClient databaseClient) {
        super(manageClient, adminManager);
        this.manageClient = manageClient;
        this.adminManager = adminManager;
        this.databaseClient = databaseClient;
        this.listener = listener;
    }

    @Override
    public void deploy(AppConfig appConfig) {
        this.completed = 0;
        onStatusChange(0, "Installing...");
        super.deploy(appConfig);
        onStatusChange(100, "Installation Complete");

        if (databaseClient != null) {
            //Below is telemetry metric code for tracking successful dhf installs
            //TODO: when more uses of telemetry are defined, change this to a more e-node based method
            ServerEvaluationCall eval = databaseClient.newServerEval();
            String query = "xdmp:feature-metric-increment(xdmp:feature-metric-register(\"datahub.core.install.count\"))";
            try {
                eval.xquery(query).eval().close();
            } catch (FailedRequestException e) {
                logger.error("Failed to increment feature metric telemetry count: " + query, e);
                e.printStackTrace();
            }
        }
    }

    @Override
    protected void executeCommand(Command command, CommandContext context) {
        reportStatus(command);
        super.executeCommand(command, context);
        completed++;
    }

    @Override
    public void undeploy(AppConfig appConfig) {
        this.completed = 0;
        onStatusChange(0, "Uninstalling...");
        super.undeploy(appConfig);
        onStatusChange(100, "Installation Complete");
    }

    @Override
    protected void undoCommand(UndoableCommand command, CommandContext context) {
        reportStatus(command);
        super.undoCommand(command, context);
        completed++;
    }

    protected void reportStatus(Command command) {
        int count = getCommands().size();
        float percent = ((float) completed / (float) count) * 100;
        String name = command.getClass().getName();
        onStatusChange((int) percent, format("[Step %d of %d]  %s", completed + 1, count, name));
    }

    private void onStatusChange(int percentComplete, String message) {
        if (this.listener != null) {
            this.listener.onStatusChange(percentComplete, message);
        }
    }
}
