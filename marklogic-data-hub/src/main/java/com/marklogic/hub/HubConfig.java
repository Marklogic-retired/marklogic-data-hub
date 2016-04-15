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

    public static final String DEFAULT_STAGING_NAME = "data-hub-STAGING";
    public static final String DEFAULT_FINAL_NAME = "data-hub-FINAL";
    public static final String DEFAULT_TRACING_NAME = "data-hub-TRACING";
    public static final String DEFAULT_MODULES_DB_NAME = "data-hub-MODULES";
    public static final String DEFAULT_TRIGGERS_DB_NAME = "data-hub-TRIGGERS";
    public static final String DEFAULT_SCHEMAS_DB_NAME = "data-hub-SCHEMAS";

    public static final Integer DEFAULT_STAGING_PORT = 8010;
    public static final Integer DEFAULT_FINAL_PORT = 8011;
    public static final Integer DEFAULT_TRACE_PORT = 8012;

    public static final String DEFAULT_APP_NAME = "my-data-hub";
    public static final String DEFAULT_MODULES_PATH = "src/data-hub";

    public static final String DEFAULT_AUTH_METHOD = "digest";

    public static final Integer DEFAULT_FORESTS_PER_HOST = 4;

    public String name = DEFAULT_APP_NAME;

    public String adminUsername = DEFAULT_USERNAME;
    public String adminPassword = DEFAULT_PASSWORD;

    public String host = DEFAULT_HOST;

    public String stagingDbName = DEFAULT_STAGING_NAME;
    public String stagingHttpName = DEFAULT_STAGING_NAME;
    public int stagingForestsPerHost = DEFAULT_FORESTS_PER_HOST;
    public Integer stagingPort = DEFAULT_STAGING_PORT;

    public String finalDbName = DEFAULT_FINAL_NAME;
    public String finalHttpName = DEFAULT_FINAL_NAME;
    public int finalForestsPerHost = DEFAULT_FORESTS_PER_HOST;
    public Integer finalPort = DEFAULT_FINAL_PORT;

    public String tracingDbName = DEFAULT_TRACING_NAME;
    public String tracingHttpName = DEFAULT_TRACING_NAME;
    public int tracingForestsPerHost = 1;
    public Integer tracePort = DEFAULT_TRACE_PORT;

    public String modulesDbName = DEFAULT_MODULES_DB_NAME;
    public String triggersDbName = DEFAULT_TRIGGERS_DB_NAME;
    public String schemasDbName = DEFAULT_SCHEMAS_DB_NAME;

    public String authMethod = DEFAULT_AUTH_METHOD;

    public String modulesPath;

    public HubConfig() {
        this(DEFAULT_MODULES_PATH);
    }

    public HubConfig(String modulesPath) {
        this.modulesPath = modulesPath;
    }
}
