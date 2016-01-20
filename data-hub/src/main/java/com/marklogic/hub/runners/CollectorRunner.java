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
package com.marklogic.hub.runners;

import java.util.ArrayList;
import java.util.function.Consumer;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonDatabindHandle;
import com.marklogic.client.util.RequestParameters;

public class CollectorRunner extends ResourceManager {

    static final public String NAME = "collector";
    private String collectorName;

    public CollectorRunner(DatabaseClient client) {
        this(client, null);
    }

    public CollectorRunner(DatabaseClient client, String collectorName) {
        super();
        client.init(NAME, this);
        this.collectorName = collectorName;
    }

    public int getEstimate(Object options) {
        JacksonDatabindHandle<Object> optionsHandle = null;
        optionsHandle = new JacksonDatabindHandle<Object>(options);
        optionsHandle.getMapper().disableDefaultTyping();
        optionsHandle.setFormat(Format.JSON);

        // get the estimate
        RequestParameters params = new RequestParameters();
        params.add("name", collectorName);
        params.add("method", "estimate");
        ServiceResultIterator resultItr = this.getServices().post(params, optionsHandle);

        if (resultItr == null || ! resultItr.hasNext()) {
            throw new Error();
        }

        ServiceResult res = resultItr.next();
        JacksonDatabindHandle<Integer> handle = new JacksonDatabindHandle<Integer>(new Integer(0));
        handle.getMapper().disableDefaultTyping();
        return res.getContent(handle).get();
    }

//    public ArrayList<String> run(int batchSize, String flowName) {
//        return this.run(batchSize, null, flowName);
//    }

//    public ArrayList<String> run(int batchSize, Object options) {
//        return this.run(batchSize, options, null);
//    }

    public void run(int batchSize, Object options, Consumer<ArrayList<String>> runner) {

        int estimate = getEstimate(options);

        int batchCount = (int) Math.ceil((double)estimate / (double)batchSize);
        for (int page = 1; page <= batchCount; page++) {
            // add the collectorName as a parameter
            RequestParameters params = new RequestParameters();
            if (null != collectorName) {
                params.add("name", collectorName);
            }

            int start = ((page - 1) * batchSize) + 1;
            params.add("method", "collect");
            params.add("limit", new Integer(batchSize).toString());
            params.add("start", new Integer(start).toString());

            ServiceResultIterator resultItr = null;
            // turn the options into JSON
            if (null != options) {
                JacksonDatabindHandle<Object> optionsHandle = null;
                optionsHandle = new JacksonDatabindHandle<Object>(options);
                optionsHandle.getMapper().disableDefaultTyping();
                optionsHandle.setFormat(Format.JSON);
                resultItr = this.getServices().post(params, optionsHandle);
            }
            else {
                resultItr = this.getServices().get(params);
            }


            if (resultItr == null || ! resultItr.hasNext()) {
                return;
            }

            ServiceResult res = resultItr.next();
            JacksonDatabindHandle<ArrayList<String>> handle = new JacksonDatabindHandle<ArrayList<String>>(new ArrayList<String>());
            handle.getMapper().disableDefaultTyping();
            ArrayList<String> uris = res.getContent(handle).get();
            runner.accept(uris);
        }
    }

    public class EmptyCollectorOptions {
        public String flowName;
        public EmptyCollectorOptions(String flowName) {
            this.flowName = flowName;
        }
    }
}
