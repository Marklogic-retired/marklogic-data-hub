package com.marklogic.hub;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.runners.CollectorRunner;

public class FlowManager {

    private static int DEFAULT_BATCH_SIZE = 100;

    private int batchSize = DEFAULT_BATCH_SIZE;
    private DatabaseClient client = null;

    public FlowManager(DatabaseClient client) {
        this.client = client;
    }

    public int getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(int batchSize) {
        this.batchSize = batchSize;
    }

    public void startFlow(Flow flow) {

        CollectorRunner c = new CollectorRunner(client, flow.collector.module);
        c.run(batchSize, flow.collector.options,
                uris -> {
                    // run a transformer for each uri
                });
    }
}
