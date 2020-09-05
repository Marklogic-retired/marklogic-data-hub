package com.marklogic.hub.core;

import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

import static org.junit.Assert.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class DebugLibTest extends AbstractHubCoreTest {

    private static final String entityName = "bug-516";
    private static final String flowName = "harmonize-go";

    private String errorMessage;
    private boolean runFlowFailed;

    @Autowired
    Scaffolding scaffolding;

    @BeforeEach
    public void setup() {
        scaffolding.createLegacyFlow(entityName, flowName, FlowType.INPUT, CodeFormat.XQUERY, DataFormat.XML, false);

        installUserModules(runAsFlowDeveloper(), true);
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
        final int currentCount = getStagingDocCount();

        ServerTransform runFlow = new ServerTransform("mlInputFlow");
        runFlow.addParameter("entity-name", entityName);
        runFlow.addParameter("flow-name", flowName);
        runFlow.addParameter("job-id", UUID.randomUUID().toString());

        DataMovementManager dataMovementManager = getHubClient().getStagingClient().newDataMovementManager();

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
        assertEquals(currentCount + 2, getStagingDocCount());
    }
}
