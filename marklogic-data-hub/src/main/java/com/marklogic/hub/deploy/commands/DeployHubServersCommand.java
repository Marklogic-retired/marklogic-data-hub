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

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.appdeployer.command.AbstractResourceCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.ResourceFilenameFilter;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.hub.HubConfig;
import com.marklogic.mgmt.SaveReceipt;
import com.marklogic.mgmt.resource.ResourceManager;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import com.marklogic.rest.util.JsonNodeUtil;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class DeployHubServersCommand extends AbstractResourceCommand {

    private HubConfig hubConfig;

    public DeployHubServersCommand(HubConfig config) {
        this.hubConfig = config;
        setExecuteSortOrder(SortOrderConstants.DEPLOY_OTHER_SERVERS);
        setUndoSortOrder(SortOrderConstants.DELETE_OTHER_SERVERS);
        setRestartAfterDelete(true);
        setCatchExceptionOnDeleteFailure(true);
        setResourceFilenameFilter(new ResourceFilenameFilter("rest-api-server.xml", "rest-api-server.json"));
    }

    @Override
    protected File[] getResourceDirs(CommandContext context) {
        return new File[] { hubConfig.getHubServersDir().toFile() };
    }

    @Override
    protected ResourceManager getResourceManager(CommandContext context) {
        return new ServerManager(context.getManageClient(), context.getAppConfig().getGroupName());
    }

    @Override
    public Integer getUndoSortOrder() {
        return 0;
    }

    @Override
    protected SaveReceipt saveResource(ResourceManager mgr, CommandContext context, File f) {
        String payload = getPayload(f, context);
        return mgr.save(payload);
    }

    protected void deleteResource(final ResourceManager mgr, CommandContext context, File f) {
        final String payload = getPayload(f, context);
        try {
            if (isRestartAfterDelete()) {
                context.getAdminManager().invokeActionRequiringRestart(() -> mgr.delete(payload).isDeleted());
            } else {
                mgr.delete(payload);
            }
        } catch (RuntimeException e) {
            throw e;
        }
    }
    protected String getPayload(File f, CommandContext context) {
        JsonNode node = mergeServerFiles(f);
        if (node == null) {
            logger.info("No server files found, so not processing");
            return null;
        }
        String str = node.toString();
        return str != null ? payloadTokenReplacer.replaceTokens(str, context.getAppConfig(), false) : str;
    }

    protected JsonNode mergeServerFiles(File f) {
        List<File> files = new ArrayList<>();
        files.add(f);

        File userServerDir = hubConfig.getUserServersDir().toFile();
        File otherServerFile = new File(userServerDir, f.getName());
        if (otherServerFile != null && otherServerFile.exists()) {
            files.add(otherServerFile);
        }
        if (logger.isInfoEnabled()) {
            logger.info("Merging JSON files at locations: " + files);
        }
        return JsonNodeUtil.mergeJsonFiles(files);
    }
}
