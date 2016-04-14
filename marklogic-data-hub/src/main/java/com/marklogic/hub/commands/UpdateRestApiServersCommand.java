package com.marklogic.hub.commands;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.mgmt.appservers.ServerManager;

/**
 * Command for updating an existing REST API server that was presumably created via /v1/rest-apis.
 */
public class UpdateRestApiServersCommand extends AbstractCommand {

    private String serverName;
    public UpdateRestApiServersCommand(String serverName) {
        this.serverName = serverName;
        setExecuteSortOrder(SortOrderConstants.UPDATE_REST_API_SERVERS);
    }

    /**
     * This uses a different file than that of creating a REST API, as the payload for /v1/rest-apis differs from that
     * of the /manage/v2/servers endpoint.
     */
    @Override
    public void execute(CommandContext context) {
        AppConfig appConfig = context.getAppConfig();

        ServerManager mgr = new ServerManager(context.getManageClient(), appConfig.getGroupName());

        String json = buildRestApiJson(appConfig);
        mgr.save(json);
    }

    private String buildRestApiJson(AppConfig config) {
        ObjectMapper m = new ObjectMapper();
        ObjectNode node = m.createObjectNode();
        node.put("server-name", serverName);
        node.put("error-handler", "/com.marklogic.hub/error-handler.xqy");

        try {
            String json = m.writer(new DefaultPrettyPrinter()).writeValueAsString(node);
            return json;
        } catch (JsonProcessingException ex) {
            throw new RuntimeException(ex);
        }
    }


}
