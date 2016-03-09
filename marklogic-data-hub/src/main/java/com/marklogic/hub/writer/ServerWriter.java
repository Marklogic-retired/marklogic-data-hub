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
package com.marklogic.hub.writer;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.plugin.PluginType;

public class ServerWriter extends AbstractWriter {

    private PluginType type;
    private String module;
    private DatabaseClient client;

    public ServerWriter(PluginType type, String module) {
        this.type = type;
        this.module = module;
    }

    @Override
    public PluginType getType() {
        return this.type;
    }

    public String getModule() {
        return this.module;
    }

    @Override
    public void write(String identifier) {
        WriterModule wm = new WriterModule(client);
        wm.run(identifier, getModule());
    }

    public void setClient(DatabaseClient client) {
        this.client = client;
    }

    @Override
    public void serialize(XMLStreamWriter serializer) throws XMLStreamException {
        serializer.writeStartElement("writer");
        serializer.writeAttribute("type", this.type.toString());
        serializer.writeAttribute("module", this.module);
        serializer.writeEndElement();
    }

    static class WriterModule extends ResourceManager {
        static final public String NAME = "writer";

        public WriterModule(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        public void run(String identifier, String moduleUri) {
            RequestParameters params = new RequestParameters();
            params.add("identifier", identifier);
            params.add("module-uri", moduleUri);
            this.getServices().get(params);
        }
    }
}
