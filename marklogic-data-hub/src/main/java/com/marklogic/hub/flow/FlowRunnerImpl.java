package com.marklogic.hub.flow;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.flow.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class FlowRunnerImpl {

    private static final int DEFAULT_BATCH_SIZE = 100;
    private static final int DEFAULT_THREAD_COUNT = 4;
    private static final int MAX_FAILED_BATCHES = 10;
    private Flow flow;
    private int batchSize = DEFAULT_BATCH_SIZE;
    private int threadCount = DEFAULT_THREAD_COUNT;
    private DatabaseClient sourceClient;
    private String sourceDatabase;
    private Map<String, Object> options;
    private boolean stopOnFailure = false;

    private List<LegacyFlowItemCompleteListener> flowItemCompleteListeners = new ArrayList<>();
    private List<LegacyFlowItemFailureListener> flowItemFailureListeners = new ArrayList<>();
    private List<LegacyFlowStatusListener> flowStatusListeners = new ArrayList<>();
    private List<LegacyFlowFinishedListener> flowFinishedListeners = new ArrayList<>();

    private HubConfig hubConfig;
    private Thread runningThread = null;

    public FlowRunnerImpl(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.sourceClient = hubConfig.newStagingClient();
        this.sourceDatabase = hubConfig.getDbName(DatabaseKind.STAGING);
    }

}
