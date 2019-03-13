/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.web.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.sun.jersey.api.client.ClientHandlerException;

public class HubStatsService extends ResourceManager{
    private static final String NAME = "ml:hubstats";

    private RequestParameters params = new RequestParameters();

    public HubStatsService(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    public String getStats() {
        try {
            ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
            if (resultItr == null || ! resultItr.hasNext()) {
                return "{}";
            }
            ResourceServices.ServiceResult res = resultItr.next();
            StringHandle handle = new StringHandle();
            return res.getContent(handle).get();
        }
        catch(ClientHandlerException e) {
        }
        return "{}";
    }

}
