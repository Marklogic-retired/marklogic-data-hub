package com.marklogic.spring.batch.hub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.flow.Flow;
import org.springframework.batch.core.annotation.BeforeChunk;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.item.ItemWriter;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FlowWriter extends ResourceManager implements ItemWriter<String> {

    static final public String NAME = "flow";

    private String targetDatabase;
    private String jobId;
    private StringHandle handle;
    private Map<String, Object> options;
    private Map<Long, ChunkContext> chunkContexts = Collections.synchronizedMap(new HashMap<Long, ChunkContext>());
    private String response;

    @BeforeChunk
    public void beforeChunk(ChunkContext chunkContext) {
        this.chunkContexts.put(Thread.currentThread().getId(), chunkContext);
    }

    FlowWriter(DatabaseClient client, String jobId, String targetDatabase, Flow flow, Map<String, Object> options) {
        super();
        client.init(NAME, this);
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
            ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, handle);

            if (resultItr != null && resultItr.hasNext()) {
                ResourceServices.ServiceResult res = resultItr.next();
                response = res.getContent(new StringHandle()).get();
                ChunkContext chunkContext = this.chunkContexts.get(Thread.currentThread().getId());
                chunkContext.setAttribute("flowResponse", response);
            }
        }
        catch(Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}
