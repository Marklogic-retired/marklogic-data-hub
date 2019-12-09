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
package com.marklogic.hub.legacy.validate.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.legacy.validate.EntitiesValidator;

public class EntitiesValidatorImpl extends ResourceManager implements EntitiesValidator {
    private static final String NAME = "ml:validate";

    public EntitiesValidatorImpl(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    @Override public JsonNode validateAll() {
        ResourceServices.ServiceResultIterator resultItr = this.getServices().get(new RequestParameters());
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ResourceServices.ServiceResult res = resultItr.next();
        return res.getContent(new JacksonHandle()).get();
    }

    @Override public JsonNode validate(String entity, String flow, String plugin, String type, String content) {
        RequestParameters params = new RequestParameters();
        params.add("entity", entity);
        params.add("flow", flow);
        params.add("plugin", plugin);
        params.add("type", type);
        StringHandle handle = new StringHandle(content);
        handle.setFormat(Format.TEXT);
        ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, handle );
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ResourceServices.ServiceResult res = resultItr.next();
        return res.getContent(new JacksonHandle()).get();
    }
}
