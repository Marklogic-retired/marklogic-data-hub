package com.marklogic.hub.cli;

import com.beust.jcommander.DynamicParameter;
import com.beust.jcommander.Parameter;

import java.util.HashMap;
import java.util.Map;

public class Options {

    @Parameter(
        names = {"-p", "--path"},
        required = true,
        description = "Path to a directory into which a DHF project will be initialized (if necessary)"
    )
    private String projectPath;

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
}
