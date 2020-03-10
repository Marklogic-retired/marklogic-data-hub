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
package com.marklogic.hub.legacy.impl;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.legacy.LegacyTracing;

public class LegacyTracingImpl extends ResourceManager implements LegacyTracing {
    private static final String NAME = "mlTracing";

    public LegacyTracingImpl(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    @Override public void enable() {
        RequestParameters params = new RequestParameters();
        params.add("enable", "true");
        this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
    }

    @Override public void disable() {
        RequestParameters params = new RequestParameters();
        params.add("enable", "false");
        this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
    }

    @Override public boolean isEnabled() {
        RequestParameters params = new RequestParameters();
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return false;
        }
        ServiceResult res = resultItr.next();
        StringHandle handle = new StringHandle();
        String enabled = res.getContent(handle).get();
        return Boolean.parseBoolean(enabled);
    }
}
