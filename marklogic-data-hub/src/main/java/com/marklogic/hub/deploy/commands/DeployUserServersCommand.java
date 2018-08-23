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
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class DeployUserServersCommand extends AbstractResourceCommand
{

    private HubConfig hubConfig;

    public DeployUserServersCommand(HubConfig config) {
        this.hubConfig = config;
        setExecuteSortOrder(SortOrderConstants.DEPLOY_OTHER_SERVERS);
        setUndoSortOrder(SortOrderConstants.DELETE_OTHER_SERVERS);
        setRestartAfterDelete(true);
        setCatchExceptionOnDeleteFailure(true);
        setResourceFilenameFilter(new ResourceFilenameFilter("rest-api-server.xml", "rest-api-server.json"));
    }

    @Override
    protected File[] getResourceDirs(CommandContext context) {
        return new File[] { hubConfig.getUserServersDir().toFile() };
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
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                logger.warn("Unable to delete resource due to missing user or bad credentials, skipping.");
            } else {
                throw e;
            }
        } catch (RuntimeException e) {
            throw e;
        }
    }
    protected String getPayload(File f, CommandContext context) {
        JsonNode node = mergeServerFiles(f);
        if (node == null) {
            logger.debug("No server files found, so not processing");
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
            logger.debug("Merging JSON files at locations: " + files);
        }
        return JsonNodeUtil.mergeJsonFiles(files);
    }
}
