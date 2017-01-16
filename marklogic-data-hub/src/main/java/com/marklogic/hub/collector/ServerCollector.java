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
package com.marklogic.hub.collector;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.JacksonDatabindHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.plugin.PluginType;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import java.util.Map;
import java.util.Vector;

public class ServerCollector extends AbstractCollector {

    private DatabaseClient client = null;
    private String module;

    public ServerCollector(PluginType type, String module) {
        super(type);
        this.module = module;
    }

    public DatabaseClient getClient() {
        return this.client;
    }

    public void setClient(DatabaseClient client) {
        this.client = client;
    }

    public String getModule() {
        return this.module;
    }

    @Override
    public void serialize(XMLStreamWriter serializer) throws XMLStreamException {
        serializer.writeStartElement("collector");
        serializer.writeAttribute("type", getType().toString());
        serializer.writeAttribute("module", this.module);
        serializer.writeEndElement();

    }

    @Override
    public Vector<String> run(Map<String, Object> options) {
        CollectorModule cm = new CollectorModule(client);
        return cm.run(getModule(), options);
    }

    static class CollectorModule extends ResourceManager {
        static final public String NAME = "collector";

        public CollectorModule(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        public Vector<String> run(String moduleUri, Map<String, Object> options) {
            try {
                RequestParameters params = new RequestParameters();
                params.add("module-uri", moduleUri);

                if (options != null) {
                    ObjectMapper objectMapper = new ObjectMapper();
                    params.put("options", objectMapper.writeValueAsString(options));
                }

                ServiceResultIterator resultItr;

                resultItr = this.getServices().get(params);

                if (resultItr == null || !resultItr.hasNext()) {
                    return null;
                }

                ServiceResult res = resultItr.next();
                JacksonDatabindHandle<Vector<String>> handle = new JacksonDatabindHandle<>(new Vector<String>());
                handle.getMapper().disableDefaultTyping();
                return res.getContent(handle).get();
            }
            catch(Exception e) {
                e.printStackTrace();
                throw new RuntimeException(e);
            }
        }
    }
}
