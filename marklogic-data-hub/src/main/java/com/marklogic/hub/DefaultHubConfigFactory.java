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

import com.marklogic.mgmt.util.PropertySource;
import com.marklogic.mgmt.util.PropertySourceFactory;

public class DefaultHubConfigFactory extends PropertySourceFactory {

    public DefaultHubConfigFactory() {
        super();
    };

    public DefaultHubConfigFactory(PropertySource propertySource) {
        super(propertySource);
    }

    public HubConfig newHubConfig() {
        HubConfig c = new HubConfig();

        String prop = null;
        String mlUsername = getProperty("mlUsername");
        String mlPassword = getProperty("mlPassword");

        prop = getProperty("mlAppName");
        if (prop != null) {
            logger.info("App name: " + prop);
            c.name = prop;
        }

        prop = getProperty("mlHost");
        if (prop != null) {
            logger.info("App host: " + prop);
            c.host = prop;
        }

        prop = getProperty("mlStagingDbName");
        if (prop != null) {
            logger.info("mlStagingDbName: " + prop);
            c.stagingDbName = prop;
        }

        prop = getProperty("mlStagingAppserverName");
        if (prop != null) {
            logger.info("mlStagingAppserverName: " + prop);
            c.stagingHttpName = prop;
        }

        prop = getProperty("mlStagingPort");
        if (prop != null) {
            logger.info("Staging App REST port: " + prop);
            c.stagingPort = Integer.parseInt(prop);
        }

        prop = getProperty("mlStagingForestsPerHost");
        if (prop != null) {
            logger.info("Staging Forests Per Host: " + prop);
            c.stagingForestsPerHost = Integer.parseInt(prop);
        }

        prop = getProperty("mlFinalDbName");
        if (prop != null) {
            logger.info("mlFinalDbName: " + prop);
            c.finalDbName = prop;
        }

        prop = getProperty("mlFinalAppserverName");
        if (prop != null) {
            logger.info("mlFinalAppserverName: " + prop);
            c.finalHttpName = prop;
        }

        prop = getProperty("mlFinalPort");
        if (prop != null) {
            logger.info("Final App REST port: " + prop);
            c.finalPort = Integer.parseInt(prop);
        }

        prop = getProperty("mlFinalForestsPerHost");
        if (prop != null) {
            logger.info("Final Forests Per Host: " + prop);
            c.finalForestsPerHost = Integer.parseInt(prop);
        }

        prop = getProperty("mlTraceDbName");
        if (prop != null) {
            logger.info("mlTraceDbName: " + prop);
            c.tracingDbName = prop;
        }

        prop = getProperty("mlTraceAppserverName");
        if (prop != null) {
            logger.info("mlTraceAppserverName: " + prop);
            c.tracingHttpName = prop;
        }

        prop = getProperty("mlTracePort");
        if (prop != null) {
            logger.info("Trace App REST port: " + prop);
            c.tracePort = Integer.parseInt(prop);
        }

        prop = getProperty("mlTraceForestsPerHost");
        if (prop != null) {
            logger.info("Trace Forests Per Host: " + prop);
            c.tracingForestsPerHost = Integer.parseInt(prop);
        }

        prop = getProperty("mlModulesDbName");
        if (prop != null) {
            logger.info("mlModulesDbName: " + prop);
            c.modulesDbName = prop;
        }

        prop = getProperty("mlTriggersDbName");
        if (prop != null) {
            logger.info("mlTriggersDbName: " + prop);
            c.triggersDbName = prop;
        }

        prop = getProperty("mlSchemasDbName");
        if (prop != null) {
            logger.info("mlSchemasDbName: " + prop);
            c.schemasDbName = prop;
        }

        prop = getProperty("mlAdminUsername");
        if (prop != null) {
            logger.info("REST admin username: " + prop);
            c.adminUsername = prop;
        } else if (mlUsername != null) {
            logger.info("REST admin username: " + mlUsername);
            c.adminUsername = mlUsername;
        }

        prop = getProperty("mlAdminPassword");
        if (prop != null) {
            c.adminPassword = prop;
        }
        else if (mlPassword != null) {
            c.adminPassword = mlPassword;
        }

        prop = getProperty("hubModulesPath");
        if (prop != null) {
            c.modulesPath = prop;
        }
        else {
            c.modulesPath = "./plugins";
        }
        logger.info("Hub Plugins Path: " + c.modulesPath);

        prop = getProperty("mlAuth");
        if (prop != null) {
            logger.info("mlAuth: " + prop);
            c.authMethod = prop;
        }

        return c;
    }

}
