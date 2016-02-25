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
package com.marklogic.hub.plugin;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.util.RequestParameters;

public class ServerPlugin extends AbstractPlugin {
    private PluginType type;
    private String module;
    private String destination;
    private DatabaseClient client;

    public ServerPlugin(PluginType type, String module, String destination) {
        this.type = type;
        this.module = module;
        this.destination = destination;
    }

    @Override
    public void run(String identifier) {
        PluginModule tm = new PluginModule(client);
        tm.run(getModule(), getDest(), identifier);
    }

    @Override
    public String getDest() {
        return this.destination;
    }

    @Override
    public PluginType getType() {
        return this.type;
    }

    public String getModule() {
        return this.module;
    }

    public void setClient(DatabaseClient client) {
        this.client = client;
    }

    public void serialize(XMLStreamWriter serializer) throws XMLStreamException {
        serializer.writeStartElement("plugin");
        serializer.writeAttribute("type", this.type.toString());
        serializer.writeAttribute("module", this.module);
        serializer.writeAttribute("dest", this.destination);
        serializer.writeEndElement();
    }

    static class PluginModule extends ResourceManager {
        static final public String NAME = "plugin";

        public PluginModule(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        public void run(String moduleUri, String destination, String identifier) {
            RequestParameters params = new RequestParameters();
            params.add("module-uri", moduleUri);
            params.add("identifier", identifier);
            params.add("destination", destination);

            this.getServices().get(params);
        }
    }
}
