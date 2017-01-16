package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;

import java.util.Map;

public class FlowRunner extends ResourceManager {

    static final public String NAME = "flow";

    private DatabaseClient srcClient;
    private String targetDatabase;
    private Flow flow;
    StringHandle handle;

    public FlowRunner(DatabaseClient srcClient, String targetDatabase, Flow flow) {
        super();
        this.flow = flow;
        this.srcClient = srcClient;
        this.targetDatabase = targetDatabase;
        this.srcClient.init(NAME, this);
        handle = new StringHandle(flow.serialize(true));
        handle.setFormat(Format.XML);
    }

    public RunFlowResponse run(String jobId, String[] items) {
        return run(jobId, items, null);
    }

    public RunFlowResponse run(String jobId, String[] items, Map<String, Object> options) {
        RunFlowResponse resp;
        try {
            RequestParameters params = new RequestParameters();
            params.put("job-id", jobId);
            params.put("identifier", items);
            params.put("target-database", targetDatabase);
            if (options != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                params.put("options", objectMapper.writeValueAsString(options));
            }
            ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, handle);
            if (resultItr == null || ! resultItr.hasNext()) {
                resp = new RunFlowResponse();
            }
            ResourceServices.ServiceResult res = resultItr.next();
            StringHandle handle = new StringHandle();
            ObjectMapper objectMapper = new ObjectMapper();
            resp = objectMapper.readValue(res.getContent(handle).get(), RunFlowResponse.class);

        }
        catch(Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
        return resp;
    }
}
