package com.marklogic.hub.cli.client;

import com.beust.jcommander.DynamicParameter;
import com.beust.jcommander.Parameter;
import com.beust.jcommander.Parameters;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Parameters(commandDescription = "Run a flow defined by a flow artifact in a MarkLogic server. " +
    "Parameter names and values are space-delimited - e.g. -host myHost -username myUsername. " +
    "Parameters may also be provided via a file - see https://jcommander.org/#_syntax for an example."
)
public class RunFlowCommand extends CommandLineFlowInputs implements Runnable {

    @Parameter(names = "-host", required = true, description = "The MarkLogic host to connect to")
    private String host;

    @Parameter(names = "-username", description = "The username of the MarkLogic user to connect as")
    private String username;

    @Parameter(names = "-password", password = true, description = "The password for the MarkLogic user specified by '-username'")
    private String password;

    @Parameter(names = "-ssl", description = "If included, a secure connection will be made to each Data Hub app server (no parameter value allowed)")
    private Boolean ssl = false;

    @Parameter(names = "-auth", description = "The authentication method to use when connecting to each Data Hub app server; valid values are basic, digest, and none")
    private String auth;

    @DynamicParameter(
        names = "-P",
        description = "Override any Data Hub property; e.g. -PmlStagingPort=8410 -PmlFinalPort=8411. See https://docs.marklogic.com/datahub/tools/gradle/gradle-properties.html for a full list."
    )
    private Map<String, String> params = new HashMap<>();

    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Override
    public void run() {
        FlowRunnerImpl flowRunner = new FlowRunnerImpl(buildHubConfig().newHubClient());
        Pair<FlowInputs, String> pair = super.buildFlowInputs();
        logger.info(pair.getRight());

        RunFlowResponse response = flowRunner.runFlow(pair.getLeft());
        flowRunner.awaitCompletion();
        logger.info("Output:");
        logger.info(response.toJson());
    }

    protected HubConfigImpl buildHubConfig() {
        final Properties props = new Properties();
        if (host != null) {
            props.setProperty("mlHost", host);
        }
        if (username != null) {
            props.setProperty("mlUsername", username);
        }
        if (password != null) {
            props.setProperty("mlPassword", password);
        }

        if (ssl != null && ssl) {
            props.setProperty("mlStagingSimpleSsl", "true");
            props.setProperty("mlFinalSimpleSsl", "true");
            props.setProperty("mlJobSimpleSsl", "true");
        }

        if (StringUtils.isNotEmpty(auth)) {
            props.setProperty("mlStagingAuth", auth);
            props.setProperty("mlFinalAuth", auth);
            props.setProperty("mlJobAuth", auth);
        }

        if (params != null && !params.isEmpty()) {
            params.keySet().forEach(key -> props.setProperty(key, params.get(key)));
        }

        return HubConfigImpl.withProperties(props);
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

    public Map<String, String> getParams() {
        return params;
    }

    public void setParams(Map<String, String> params) {
        this.params = params;
    }

    public void setSsl(Boolean ssl) {
        this.ssl = ssl;
    }

    public void setAuth(String auth) {
        this.auth = auth;
    }
}
