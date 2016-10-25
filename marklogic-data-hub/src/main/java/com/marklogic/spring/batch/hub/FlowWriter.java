package com.marklogic.spring.batch.hub;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.flow.Flow;
import org.springframework.batch.item.ItemWriter;

import java.util.List;

public class FlowWriter extends ResourceManager  implements ItemWriter<String> {

    static final public String NAME = "flow";

    private DatabaseClient client;
    private Flow flow;
    StringHandle handle;

    public FlowWriter(DatabaseClient client, Flow flow) {
        super();
        this.flow = flow;
        this.client = client;
        this.client.init(NAME, this);
        handle = new StringHandle(flow.serialize(true));
        handle.setFormat(Format.XML);
    }

    @Override
    public void write(List<? extends String> items) {

        try {
            RequestParameters params = new RequestParameters();
            params.put("identifier", items.toArray(new String[items.size()]));
            this.getServices().post(params, handle);
        }
        catch(Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
