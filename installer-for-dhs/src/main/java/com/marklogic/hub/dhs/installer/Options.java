package com.marklogic.hub.dhs.installer;

import com.beust.jcommander.DynamicParameter;
import com.beust.jcommander.Parameter;

import java.util.HashMap;
import java.util.Map;

/**
 * Defines command line options applicable to most/all commands.
 */
public class Options {

    @Parameter(
        names = {"--path"},
        required = true,
        description = "Path to a directory into which a DHF project will be initialized (if necessary)"
    )
    private String projectPath;

    @Parameter(
        names = {"--host"},
        description = "Host that the installer should connect; defaults to 'localhost'"
    )
    private String host = "localhost";

    @Parameter(
        names = {"--username"},
        required = true,
        description = "MarkLogic user that the installer should use to connect"
    )
    private String username;

    @Parameter(
        names = {"--password"},
        required = true,
        password = true,
        description = "Password of the MarkLogic user that the installer users to connect"
    )
    private String password;

    @Parameter(
        names = {"--disableSsl"},
        description = "Include this argument to disable SSL usage when connecting to MarkLogic (do not include a value for it)"
    )
    private boolean disableSsl;

    @Parameter(
        names = {"--groups"},
        description = "Comma-delimited list of group names that REST options should be copied to, and for which granular " +
            "privileges should be created for scheduled tasks"
    )
    private String groupNames = "Evaluator,Curator,Analyzer,Operator";

    @Parameter(
        names = {"--servers"},
        description = "Comma-delimited list of server names. Search options are expected to be loaded into the first server, and then they " +
            "will be copied to the appropriate locations for each of the other servers combined with each of the groups defined by --groups."
    )
    private String serverNames = "data-hub-STAGING,data-hub-FINAL,data-hub-ANALYTICS,data-hub-ANALYTICS-REST,data-hub-OPERATION,data-hub-OPERATION-REST";

    @DynamicParameter(
        names = "-P",
        description = "Use this argument to include any property supported by DHF; e.g. -PmlHost=somehost"
    )
    private Map<String, String> params = new HashMap<>();

    public Map<String, String> getParams() {
        return params;
    }

    public void setParams(Map<String, String> params) {
        this.params = params;
    }

    public String getProjectPath() {
        return projectPath;
    }

    public void setProjectPath(String projectPath) {
        this.projectPath = projectPath;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isDisableSsl() {
        return disableSsl;
    }

    public void setDisableSsl(boolean disableSsl) {
        this.disableSsl = disableSsl;
    }

    public String getGroupNames() {
        return groupNames;
    }

    public void setGroupNames(String groupNames) {
        this.groupNames = groupNames;
    }

    public String getServerNames() {
        return serverNames;
    }

    public void setServerNames(String serverNames) {
        this.serverNames = serverNames;
    }
}
