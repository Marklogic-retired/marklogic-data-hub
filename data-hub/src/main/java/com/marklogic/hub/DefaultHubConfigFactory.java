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
            c.setName(prop);
        }

        prop = getProperty("mlHost");
        if (prop != null) {
            logger.info("App host: " + prop);
            c.setHost(prop);
        }

        prop = getProperty("mlPort");
        if (prop != null) {
            logger.info("App REST port: " + prop);
            c.setPort(Integer.parseInt(prop));
        }

        prop = getProperty("mlAdminUsername");
        if (prop != null) {
            logger.info("REST admin username: " + prop);
            c.setAdminUsername(prop);
        } else if (mlUsername != null) {
            logger.info("REST admin username: " + mlUsername);
            c.setAdminUsername(mlUsername);
        }

        prop = getProperty("mlAdminPassword");
        if (prop != null) {
            c.setAdminPassword(prop);
        }
        else if (mlPassword != null) {
            c.setAdminPassword(mlPassword);
        }

        prop = getProperty("hubModulesPath");
        if (prop != null) {
            c.setModulesPath(prop);
        }
        return c;
    }

}
