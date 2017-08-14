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
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.plugin.PluginType;
import com.marklogic.xcc.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import java.util.Map;

public class ServerCollector extends AbstractCollector {

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());
    private DatabaseClient client = null;
    private HubConfig hubConfig = null;

    private String module;

    public ServerCollector(PluginType type, String module) {
        super(type);
        this.module = module;
    }

    public void setHubConfig(HubConfig config) { this.hubConfig = config; }

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
    public DiskQueue<String> run(String jobId, int threadCount, Map<String, Object> options) {
        try {
            ContentSource cs = ContentSourceFactory.newContentSource(client.getHost(), client.getPort(), hubConfig.getUsername(), hubConfig.getPassword(), client.getDatabase());
            Session activeSession = cs.newSession();
            RequestOptions requestOptions = new RequestOptions();
            requestOptions.setCacheResult(false);
            ModuleInvoke moduleInvoke = activeSession.newModuleInvoke("/com.marklogic.hub/endpoints/collector.xqy", requestOptions);
            moduleInvoke.setNewStringVariable("job-id", jobId);
            moduleInvoke.setNewStringVariable("module-uri", getModule());
            if (options != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                moduleInvoke.setNewStringVariable("options", objectMapper.writeValueAsString(options));
            }

            DiskQueue<String> results = new DiskQueue<>(5000);
            ResultSequence res = activeSession.submitRequest(moduleInvoke);
            int count = Integer.parseInt(res.next().getItem().asString());
            while (res != null && res.hasNext()) {
                results.add(res.next().asString());
            }
            return results;
        }
        catch(Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}
