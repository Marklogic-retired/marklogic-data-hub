/*
 * Copyright (c)2005-2012 Mark Logic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * The use of the Apache License does not indicate that this project is
 * affiliated with the Apache Software Foundation.
 */
package com.marklogic.hub.runners;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonDatabindHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;

public class TransformerRunner extends ResourceManager {

    static final public String NAME = "transformer";

    private String transformerName;
    public String inputIdentifier;

    public TransformerRunner(DatabaseClient client) {
        this(client, null);
    }

    public TransformerRunner(DatabaseClient client, String transformerName) {
        super();
        client.init(NAME, this);

        this.transformerName = transformerName;
    }

    public String run(String identifier, Object options) {
        RequestParameters params = new RequestParameters();
        if (null != transformerName) {
            params.add("name", transformerName);
        }

        params.add("id", identifier);

        ServiceResultIterator resultItr = null;
        if (null != options) {
            JacksonDatabindHandle<Object> optionsHandle = new JacksonDatabindHandle<Object>(options);
            optionsHandle.getMapper().disableDefaultTyping();
            optionsHandle.setFormat(Format.JSON);
            resultItr = this.getServices().post(params, optionsHandle);
        }
        else {
            resultItr = this.getServices().get(params);
        }

        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }

        ServiceResult res = resultItr.next();
        return res.getContent(new StringHandle()).get();
    }
}
