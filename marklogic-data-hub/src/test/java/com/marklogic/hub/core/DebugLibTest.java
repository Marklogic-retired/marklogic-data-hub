package com.marklogic.hub.core;

import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.UUID;

import static org.junit.Assert.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;


@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class DebugLibTest extends HubTestBase {

    private static final String entityName = "bug-516";
    private static final String flowName = "harmonize-go";

    private String errorMessage;
    private boolean runFlowFailed;

    @Autowired
    Scaffolding scaffolding;

    @BeforeEach
    public void setup() {
        basicSetup();

        scaffolding.createFlow(entityName, flowName, FlowType.INPUT, CodeFormat.XQUERY, DataFormat.XML, false);

        installUserModules(getDataHubAdminConfig(), true);
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
        assertEquals(0, getStagingDocCount());

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
        assertEquals(2, getStagingDocCount());
    }
}
