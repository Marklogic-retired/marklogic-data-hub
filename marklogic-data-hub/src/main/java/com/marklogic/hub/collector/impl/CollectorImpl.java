package com.marklogic.hub.collector.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubDatabase;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.DiskQueue;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.xcc.*;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import java.util.Map;
import java.util.Properties;

public class CollectorImpl implements Collector {
    private DatabaseClient client = null;
    private HubConfig hubConfig = null;
    private CodeFormat codeFormat;

    private String module;

    public CollectorImpl() {}

    public CollectorImpl(String module, CodeFormat codeFormat) {
        this.module = module;
        this.codeFormat = codeFormat;
    }


    @Override
    public void setHubConfig(HubConfig config) { this.hubConfig = config; }

    @Override
    public HubConfig getHubConfig() {
        return hubConfig;
    }

    @Override
    public void setClient(DatabaseClient client) {
        this.client = client;
    }

    @Override
    public DatabaseClient getClient() {
        return this.client;
    }

    @Override
    public CodeFormat getCodeFormat() {
        return codeFormat;
    }

    @Override
    public String getModule() {
        return this.module;
    }

    @Override
    public void serialize(XMLStreamWriter serializer) throws XMLStreamException {
        serializer.writeStartElement("collector");
        serializer.writeAttribute("code-format", codeFormat.toString());
        serializer.writeAttribute("module", this.module);
        serializer.writeEndElement();
    }

    @Override
    public void toProperties(Properties properties) {
        properties.setProperty("collectorCodeFormat", codeFormat.toString());
        properties.setProperty("collectorModule", this.module);
    }

    @Override
    public DiskQueue<String> run(String jobId, String entity, String flow, int threadCount, Map<String, Object> options) {
        try {
            ContentSource cs = ContentSourceFactory.newContentSource(client.getHost(), client.getPort(), hubConfig.getUsername(), hubConfig.getPassword(), client.getDatabase());
            Session activeSession = cs.newSession();
            RequestOptions requestOptions = new RequestOptions();
            requestOptions.setCacheResult(false);
            ModuleInvoke moduleInvoke = activeSession.newModuleInvoke("/com.marklogic.hub/endpoints/collector.xqy", requestOptions);
            moduleInvoke.setNewStringVariable("job-id", jobId);
            moduleInvoke.setNewStringVariable("entity-name", entity);
            moduleInvoke.setNewStringVariable("flow-name", flow);
            if (options != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                moduleInvoke.setNewStringVariable("options", objectMapper.writeValueAsString(options));
            }

            DiskQueue<String> results = new DiskQueue<>(5000);
            ResultSequence res = activeSession.submitRequest(moduleInvoke);
            Integer.parseInt(res.next().getItem().asString());
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
