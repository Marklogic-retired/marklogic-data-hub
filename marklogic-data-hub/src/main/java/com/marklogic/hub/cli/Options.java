package com.marklogic.hub.cli;

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
        description = "Password of the MarkLogic user that the installer users to connect"
    )
    private String password;

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
}
