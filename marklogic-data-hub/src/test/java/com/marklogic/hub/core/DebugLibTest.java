package com.marklogic.hub.core;

import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.UUID;

import static org.junit.Assert.assertFalse;

public class DebugLibTest extends HubTestBase {

    private static final String entityName = "bug-516";
    private static final String flowName = "harmonize-go";

    private String errorMessage;
    private boolean runFlowFailed;

    @Before
    public void setup() {
        basicSetup();

        Scaffolding scaffolding = Scaffolding.create(PROJECT_PATH, stagingClient);
        scaffolding.createFlow(entityName, flowName, FlowType.INPUT, CodeFormat.XQUERY, DataFormat.XML);

        installUserModules(getHubConfig(), true);
    }

    // testing https://github.com/marklogic/marklogic-data-hub/issues/516
    // when debugging is enable the debug-lib explodes if http post body is multi-part
    @Test
    public void testBug516WithDebugging() {
        enableDebugging();
        run516();
    }

    // testing https://github.com/marklogic/marklogic-data-hub/issues/516
    // when debugging is enable the debug-lib explodes if http post body is multi-part
    @Test
    public void testBug516WithoutDebugging() {
        disableDebugging();
        run516();
    }

    private void run516() {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME);
        Assert.assertEquals(0, getStagingDocCount());

        ServerTransform runFlow = new ServerTransform("ml:inputFlow");
        runFlow.addParameter("entity-name", entityName);
        runFlow.addParameter("flow-name", flowName);
        runFlow.addParameter("job-id", UUID.randomUUID().toString());
        DataMovementManager dataMovementManager = stagingClient.newDataMovementManager();
        runFlowFailed = false;
        WriteBatcher batcher = dataMovementManager.newWriteBatcher();
        batcher
            .withBatchSize(10)
            .withThreadCount(4)
            .withTransform(runFlow)
            .onBatchFailure((batch, failure) -> {
                errorMessage = failure.getMessage();
                runFlowFailed = true;
            });
        dataMovementManager.startJob(batcher);

        batcher.add("/employee1.xml", new StringHandle(getResource("flow-manager-test/input/employee1.xml")).withFormat(Format.XML));
        batcher.add("/employee2.xml", new StringHandle(getResource("flow-manager-test/input/employee2.xml")).withFormat(Format.XML));
        batcher.flushAndWait();

        assertFalse(errorMessage, runFlowFailed);
        Assert.assertEquals(2, getStagingDocCount());
    }
}
