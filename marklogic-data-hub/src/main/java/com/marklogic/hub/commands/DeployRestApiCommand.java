package com.marklogic.hub.commands;

import org.springframework.http.HttpMethod;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.UndoableCommand;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.ActionRequiringRestart;
import com.marklogic.mgmt.appservers.ServerManager;
import com.marklogic.mgmt.restapis.RestApiManager;

public class DeployRestApiCommand extends AbstractCommand implements UndoableCommand {

    private String name;
    private Integer port;
    private String databaseName;
    private int forestsPerHost;
    private boolean deleteModulesDatabase = false;
    private boolean deleteContentDatabase = true;

    public DeployRestApiCommand(String name, int port, String databaseName, int forestsPerHost) {
        super();
        this.name = name;
        this.port = port;
        this.databaseName = databaseName;
        this.forestsPerHost = forestsPerHost;
        setExecuteSortOrder(SortOrderConstants.DEPLOY_REST_API_SERVERS);
    }

    @Override
    public void execute(CommandContext context) {
        AppConfig config = context.getAppConfig();
        RestApiManager mgr = new RestApiManager(context.getManageClient());
        mgr.createRestApi(name, buildDefaultRestApiJson(config));
    }

    @Override
    public void undo(CommandContext context) {
        final AppConfig appConfig = context.getAppConfig();
        final ManageClient manageClient = context.getManageClient();

        ServerManager mgr = new ServerManager(manageClient, appConfig.getGroupName());
        if (mgr.exists(name)) {
            context.getAdminManager().invokeActionRequiringRestart(new ActionRequiringRestart() {
                @Override
                public boolean execute() {
                    return deleteRestApi(name, appConfig.getGroupName(), manageClient,
                            deleteModulesDatabase, deleteContentDatabase);
                }
            });
        }
    }

    @Override
    public Integer getUndoSortOrder() {
        return SortOrderConstants.DELETE_REST_API_SERVERS;
    }

    private String buildDefaultRestApiJson(AppConfig config) {
        ObjectMapper m = new ObjectMapper();
        ObjectNode node = m.createObjectNode();
        ObjectNode n = node.putObject("rest-api");
        n.put("name", name);
        n.put("group", config.getGroupName());
        n.put("database", databaseName);
        n.put("modules-database", config.getModulesDatabaseName());
        n.put("port", "%%PORT%%");
        n.put("xdbc-enabled", true);
        n.put("forests-per-host", forestsPerHost);
        n.put("error-format", "json");

        try {
            String json = m.writer(new DefaultPrettyPrinter()).writeValueAsString(node);
            json = json.replace("\"%%PORT%%\"", port.toString());
            return json;
        } catch (JsonProcessingException ex) {
            throw new RuntimeException(ex);
        }
    }

    protected boolean deleteRestApi(String serverName, String groupName, ManageClient manageClient,
            boolean includeModules, boolean includeContent) {
        if (new ServerManager(manageClient, groupName).exists(serverName)) {
            String path = format("%s/v1/rest-apis/%s?", manageClient.getBaseUrl(), serverName);
            if (includeModules) {
                path += "include=modules&";
            }
            if (includeContent) {
                path += "include=content";
            }
            logger.info("Deleting REST API, path: " + path);
            manageClient.getRestTemplate().exchange(path, HttpMethod.DELETE, null, String.class);
            logger.info("Deleted REST API");
            return true;
        } else {
            logger.info(format("Server %s does not exist, not deleting", serverName));
            return false;
        }
    }
}
