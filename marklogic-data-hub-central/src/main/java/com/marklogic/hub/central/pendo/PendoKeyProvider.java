/*
 * Copyright 2012-2021 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.central.pendo;


import com.marklogic.hub.central.cloud.ParameterSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import static com.marklogic.hub.central.cloud.Constants.PENDO_API_KEY;

@Component
public class PendoKeyProvider {

    @Autowired(required = false)
    private ParameterSource parameterSource;

    private final Environment environment;

    @Autowired
    PendoKeyProvider(Environment environment) {
        this.environment = environment;
    }

    public String getPendoKey() {
        if (!isPendoEnabled() || parameterSource == null) {
            return null;
        }

        return parameterSource.getParameter(PENDO_API_KEY);
    }

    protected boolean isPendoEnabled() {
        return Boolean.parseBoolean(environment.getProperty("hubPendoEnabled", "false"));
    }
}
