/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.impl;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.HubConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class Versions extends ResourceManager {
    private static final String NAME = "ml:hubversion";

    DatabaseClient stagingClient;
    private AppConfig appConfig;

    @Autowired
    private HubConfig hubConfig;

    public Versions() {
        super();
    }

    /**
     * Needed for the Gradle tasks.
     *
     * @param hubConfig HubConfig
     */
    public Versions(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.appConfig = hubConfig.getAppConfig();
    }

    /**
     * Needed for the Gradle tasks.
     *
     * @param appConfig AppConfig
     */
    public Versions(AppConfig appConfig) {
        this.appConfig = appConfig;
    }

    public void setupClient() {
        this.stagingClient = hubConfig.newStagingClient();
        this.stagingClient.init(NAME, this);
    }

    public String getDHFVersion() {
        return (hubConfig != null) ? hubConfig.getDHFVersion() : null;
    }

    public String getHubVersion() {
        try {
            ResourceServices.ServiceResultIterator resultItr = this.getServices().get(new RequestParameters());
            if (resultItr == null || ! resultItr.hasNext()) {
                return null;
            }
            ResourceServices.ServiceResult res = resultItr.next();
            return res.getContent(new StringHandle()).get();
        }
        catch(Exception e) {}

        /* 2.0.0 is the version at which we started using this method. First we'll check the version gradle properties.
         * If the version isn't there, we'll assume 2.0.0
         */
        String dhfVersion = this.getDHFVersion();
        if (dhfVersion == null || "".equals(dhfVersion)) {
            return "2.0.0";
        } else {
            return dhfVersion;
        }
    }

    public String getMarkLogicVersion() {
        if (this.appConfig == null) {
            this.appConfig = hubConfig.getAppConfig();
        }
        // this call specifically needs to access marklogic without a known database
        ServerEvaluationCall eval = appConfig.newAppServicesDatabaseClient(null).newServerEval();
        String xqy = "xdmp:version()";
        EvalResultIterator result = eval.xquery(xqy).eval();
        if (result.hasNext()) {
            return result.next().getString();
        }
        else {
            throw new RuntimeException("Couldn't determine MarkLogic Version");
        }
    }

    public static int compare(String v1, String v2) {
        if(v1 == null || v2 == null) {
            return 1;
        }
        String[] v1Parts = v1.split("\\.");
        String[] v2Parts = v2.split("\\.");
        int length = Math.max(v1Parts.length, v2Parts.length);
        for(int i = 0; i < length; i++) {
            int v1Part = i < v1Parts.length ? Integer.parseInt(v1Parts[i]) : 0;
            int v2Part = i < v2Parts.length ? Integer.parseInt(v2Parts[i]) : 0;

            if(v1Part < v2Part) {
                return -1;
            }

            if(v1Part > v2Part) {
                return 1;
            }
        }
        return 0;
    }
}
