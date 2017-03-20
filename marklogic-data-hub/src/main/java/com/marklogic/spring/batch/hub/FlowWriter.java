package com.marklogic.spring.batch.hub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.flow.Flow;
import org.springframework.batch.item.ItemWriter;

import java.util.List;
import java.util.Map;

public class FlowWriter extends ResourceManager  implements ItemWriter<String> {

    static final public String NAME = "flow";

    private DatabaseClient client;
    private String targetDatabase;
    private Flow flow;
    Long jobId;
    StringHandle handle;
    Map<String, Object> options;

    public FlowWriter(DatabaseClient client, long jobId, String targetDatabase, Flow flow, Map<String, Object> options) {
        super();
        this.flow = flow;
        this.client = client;
        this.client.init(NAME, this);
        this.targetDatabase = targetDatabase;
        this.jobId = jobId;
        this.options = options;
        handle = new StringHandle(flow.serialize(true));
        handle.setFormat(Format.XML);
    }

    @Override
    public void write(List<? extends String> items) {

        try {
            RequestParameters params = new RequestParameters();
            params.put("job-id", jobId.toString());
            params.put("identifier", items.toArray(new String[items.size()]));
            params.put("target-database", targetDatabase);
            if (options != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                params.put("options", objectMapper.writeValueAsString(options));
            }
            this.getServices().post(params, handle);
        }
        catch(Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}
