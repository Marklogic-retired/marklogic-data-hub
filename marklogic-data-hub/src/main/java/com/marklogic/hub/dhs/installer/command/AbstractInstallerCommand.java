package com.marklogic.hub.dhs.installer.command;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.dhs.installer.InstallerCommand;
import com.marklogic.hub.dhs.installer.Options;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.Versions;
import com.marklogic.hub.impl.Versions.MarkLogicVersion;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.web.client.HttpClientErrorException;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Properties;

public abstract class AbstractInstallerCommand extends LoggingObject implements InstallerCommand {

    protected HubConfigImpl hubConfig;
    protected String serverVersion;

    /**
     * The intended use case is that an installer command can be run from any directory, which means we need to first
     * initialize a DHF project (specifically, generating the gradle.properties file) and then refresh HubConfig based
     * on those properties and anything a client passed in via JVM props. This allows for all of the DHF properties to
     * be read in and used for connecting to a DHF instance.
     *
     * @param options
     */
    protected File initializeProject(ApplicationContext context, Options options, Properties props) {
        this.hubConfig = context.getBean(HubConfigImpl.class);

        final File projectDir = new File(options.getProjectPath());

        logger.info("Initializing DHF into project directory: " + projectDir);

        hubConfig.createProject(projectDir.getAbsolutePath());
        hubConfig.initHubProject();

        Map<String, String> params = options.getParams();
        if (params != null) {
            for (String key : params.keySet()) {
                props.setProperty(key, params.get(key));
            }
        }

        props.setProperty("mlHost", options.getHost());
        props.setProperty("mlUsername", options.getUsername());
        props.setProperty("mlPassword", options.getPassword());

        logger.info(format("Will connect to host '%s' as user '%s'", options.getHost(), options.getUsername()));

        hubConfig.loadConfigurationFromProperties(props, true);

        verifyUserCanAuthenticate();

        return projectDir;
    }

    protected void verifyUserCanAuthenticate() {
        try {
            String json = hubConfig.getManageClient().getJson("/manage/v2");
            JsonNode node = ObjectMapperFactory.getObjectMapper().readTree(json);
            serverVersion = node.iterator().next().get("version").asText();
            logger.info("Target MarkLogic instance has version: " + serverVersion);
        } catch (HttpClientErrorException e) {
            throw new RuntimeException("Unable to authenticate. Please verify that your inputs for '--username' and '--password " +
                "correspond to a valid MarkLogic user that access the REST Management API.");
        } catch (IOException ie) {
            throw new RuntimeException("Unable to read JSON response from MarkLogic to verify that user can authenticate: " + ie.getMessage());
        }
    }

    // TODO Some duplication between this and the logic in DeployHubOtherServersCommand
    protected String getServerMajorVersion() {
        try {
            return serverVersion != null ? serverVersion.replaceAll("([^.]+)\\..*", "$1") : "9";
        } catch (Exception ex) {
            logger.warn("Unable to determine the server version; cause: " + ex.getMessage());
            logger.warn("Will use 9 as a fallback");
            return "9";
        }
    }

    protected ObjectNode canInstallDhs(){
        Versions versions = new Versions(hubConfig);
        String installedHubVersion = null;
        try{
            installedHubVersion = versions.getInstalledVersion();
        }
        catch (Exception e){
            logger.info("Data Hub is not installed yet");
        }

        MarkLogicVersion mlVersion = versions.getMLVersion(serverVersion);
        return canInstallDhs(installedHubVersion, mlVersion);
    }

    protected ObjectNode canInstallDhs(String installedHubVersion, MarkLogicVersion mlVersion){
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode node = mapper.createObjectNode();
        if(installedHubVersion != null && Character.getNumericValue(installedHubVersion.charAt(0)) < 5){
            node.put("canBeInstalled", false);
            node.put("message", "DHF cannot be upgraded when the major version of the existing DHF instance is 4");
        }
        else {
            if(mlVersion.getMajor() > 10 || (mlVersion.getMajor().equals(10) && mlVersion.getMinor() >= 300)){
                node.put("canBeInstalled", true);
            }
            else {
                node.put("canBeInstalled", false);
                node.put("message", "DHF 5.3.0 and higher require MarkLogic 10.0-3 or higher for the use of granular privileges");
            }
        }
        return node;
    }
}
