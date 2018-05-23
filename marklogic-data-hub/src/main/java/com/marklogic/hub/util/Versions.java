/*
 * Copyright 2012-2018 MarkLogic Corporation
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
package com.marklogic.hub.util;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.HubConfig;

public class Versions extends ResourceManager {
    private static final String NAME = "ml:hubversion";

    DatabaseClient appServicesClient;
    DatabaseClient stagingClient;

    public Versions(HubConfig hubConfig) {
        super();
        this.appServicesClient = hubConfig.newAppServicesClient();
        this.stagingClient = hubConfig.newStagingManageClient();
        this.stagingClient.init(NAME, this);
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

        // 2.0.0 is the version at which we started using this method. It's the
        // default fallback and should not be changed.
        return "2.0.0";
    }

    public String getMarkLogicVersion() {
        // do it this way to avoid needing an admin user
        // vs getAdminManager().getServerVersion() which needs admin :(
        ServerEvaluationCall eval = this.appServicesClient.newServerEval();
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
