package com.marklogic.spring.batch.hub;

import java.util.List;

import org.springframework.batch.item.ItemWriter;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.Transaction;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.flow.Flow;

public class FlowWriter extends ResourceManager  implements ItemWriter<String> {

    static final public String NAME = "flow";

    private DatabaseClient client;
    private Flow flow;

    public FlowWriter(DatabaseClient client, Flow flow) {
        super();
        this.flow = flow;
        this.client = client;
        this.client.init(NAME, this);
    }

    @Override
    public void write(List<? extends String> items) throws Exception {

        Transaction transaction = null;
        try {
            transaction = client.openTransaction();
            for (String id: items) {
                RequestParameters params = new RequestParameters();
                params.add("identifier", id);

                StringHandle handle = new StringHandle(flow.serialize(true));
                handle.setFormat(Format.XML);
                this.getServices().post(params, handle, transaction);
            }
            transaction.commit();
        }
        catch(Exception e) {
          if (transaction != null) {
              transaction.rollback();
          }
          throw e;
      }
    }
}
