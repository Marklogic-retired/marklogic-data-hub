/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.hub;

public class HubConfig {

    public static final String DEFAULT_USERNAME = "admin";
    public static final String DEFAULT_PASSWORD = "admin";
    public static final String DEFAULT_HOST = "localhost";
    public static final Integer DEFAULT_STAGING_PORT = 8010;
    public static final Integer DEFAULT_FINAL_PORT = 8011;
    public static final String DEFAULT_APP_NAME = "my-data-hub";
    public final static String DEFAULT_MODULES_PATH = "src/data-hub";
    public static final String DEFAULT_AUTH_METHOD = "digest";

    private String name = DEFAULT_APP_NAME;
    private String adminUsername = DEFAULT_USERNAME;
    private String adminPassword = DEFAULT_PASSWORD;
    private String host = DEFAULT_HOST;
    private Integer stagingPort = DEFAULT_STAGING_PORT;
    private Integer finalPort = DEFAULT_FINAL_PORT;
    private String authMethod = DEFAULT_AUTH_METHOD;

    private String modulesPath;

    public HubConfig() {
        this(DEFAULT_MODULES_PATH);
    }

    public HubConfig(String modulesPath) {
        this.modulesPath = modulesPath;
    }

    /**
     * @return the name of the application, which is then used to generate app server and database names unless those
     *         are set via their respective properties
     */
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the host that clients using this class will connect to
     */
    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    /**
     * @return the name of a MarkLogic user with the rest-admin role who can then load modules via a REST API server
     */
    public String getAdminUsername() {
        return adminUsername;
    }

    public void setAdminUsername(String username) {
        this.adminUsername = username;
    }

    /**
     * @return the password for the user identified by {@code restAdminUsername}
     */
    public String getAdminPassword() {
        return adminPassword;
    }

    public void setAdminPassword(String password) {
        this.adminPassword = password;
    }

    /**
     * @return the port of the Staging REST API server used for loading modules
     */
    public Integer getStagingPort() {
        return stagingPort;
    }

    public void setStagingPort(Integer port) {
        this.stagingPort = port;
    }

    /**
     * @return the port of the Final REST API server used for loading modules
     */
    public Integer getFinalPort() {
        return finalPort;
    }

    public void setFinalPort(Integer port) {
        this.finalPort = port;
    }

    public String getModulesPath() {
        return this.modulesPath;
    }

    public void setModulesPath(String modulesPath) {
        this.modulesPath = modulesPath;
    }

    public String getAuthMethod() {
        return this.authMethod;
    }

    public void setAuthMethod(String authMethod) {
        this.authMethod = authMethod;
    }
}
