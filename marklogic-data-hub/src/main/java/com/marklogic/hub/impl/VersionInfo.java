package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.dataservices.SystemService;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * This is intended to replace some of the Versions class with a HubClient-friendly and non-Spring-dependent way of
 * accessing version data.
 */
public class VersionInfo {

    private String hubVersion;
    private String markLogicVersion;
    private String clusterName;

    public static VersionInfo newVersionInfo(HubClient hubClient) {
        JsonNode json = SystemService.on(hubClient.getStagingClient()).getVersions();
        return new VersionInfo(
            json.get("hubVersion").asText(),
            json.get("markLogicVersion").asText(),
            json.get("clusterName").asText()
        );
    }

    private VersionInfo(String hubVersion, String markLogicVersion, String clusterName) {
        this.hubVersion = hubVersion;
        this.markLogicVersion = markLogicVersion;
        this.clusterName = clusterName;
    }

    public String getHubVersion() {
        return hubVersion;
    }

    public String getMarkLogicVersion() {
        return markLogicVersion;
    }

    public String getClusterName() {
        return clusterName;
    }

    /**
     * @return the version of the build containing this class
     */
    public static String getBuildVersion() {
        Properties properties = new Properties();
        try (InputStream inputStream = VersionInfo.class.getClassLoader().getResourceAsStream("version.properties")) {
            properties.load(inputStream);
        } catch (IOException e) {
            throw new RuntimeException("Unable to get library version from version.properties, cause: " + e.getMessage(), e);
        }

        String version = properties.getProperty("version");
        return "${project.version}".equals(version) ? "5.4-SNAPSHOT" : version;
    }
}
