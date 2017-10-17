package com.marklogic.hub.collector.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.DiskQueue;
import com.marklogic.hub.flow.CodeFormat;

import java.util.Map;

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
    public DiskQueue<String> run(String jobId, String entity, String flow, int threadCount, Map<String, Object> options) {
        try {
            ServerEvaluationCall evaluationCall = client
                .newServerEval()
                .modulePath("/com.marklogic.hub/endpoints/collector.xqy")
                .addVariable("job-id", jobId)
                .addVariable("entity-name", entity)
                .addVariable("flow-name", flow);
            if (options != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                evaluationCall.addVariable("options", objectMapper.writeValueAsString(options));
            }

            DiskQueue<String> results = new DiskQueue<>(5000);
            EvalResultIterator res = evaluationCall.eval();
            Integer.parseInt(res.next().getString());
            while (res != null && res.hasNext()) {
                results.add(res.next().getString());
            }
            return results;
        }
        catch(Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}
