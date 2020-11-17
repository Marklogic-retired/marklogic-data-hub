package com.marklogic.hub.mlcp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.util.MlcpRunner;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class MlcpCopyTest  extends AbstractHubCoreTest {

    @Test
    public void testCopyAsOperator() {
        HubConfigImpl hubConfig = runAsFlowOperator();
        String username = hubConfig.getMlUsername();
        String password = hubConfig.getMlPassword();
        installStagingDoc("/test-doc.json", new DocumentMetadataHandle().withCollections("testMlcpCopy").withPermission(hubConfig.getFlowOperatorRoleName(), DocumentMetadataHandle.Capability.INSERT, DocumentMetadataHandle.Capability.UPDATE), "mlcp-test/test-doc.json");
        ObjectNode mlcpOptions = new ObjectMapper().createObjectNode();
        mlcpOptions.put("mode", "local");
        mlcpOptions.put("command", "copy");
        mlcpOptions.put("input_host", hubConfig.getHost());
        mlcpOptions.put("input_port", hubConfig.getPort(DatabaseKind.STAGING));
        mlcpOptions.put("input_database", hubConfig.getDbName(DatabaseKind.STAGING));
        mlcpOptions.put("input_username", username);
        mlcpOptions.put("input_password", password);
        mlcpOptions.put("output_host", hubConfig.getHost());
        mlcpOptions.put("output_port", hubConfig.getPort(DatabaseKind.FINAL));
        mlcpOptions.put("output_database", hubConfig.getDbName(DatabaseKind.FINAL));
        mlcpOptions.put("output_username", username);
        mlcpOptions.put("output_password", password);
        mlcpOptions.put("collection_filter", "testMlcpCopy");
        MlcpRunner mlcpRunner = new MlcpRunner("com.marklogic.contentpump.ContentPump", hubConfig, mlcpOptions);
        final List<String> exceptionStackTraces = new ArrayList<>();
        mlcpRunner.setUncaughtExceptionHandler((th, ex) ->{
            logger.info("MLCP exception caught! " + ExceptionUtils.getMessage(ex));
            exceptionStackTraces.add(ExceptionUtils.getStackTrace(ex));
        });
        mlcpRunner.start();
        try {
            mlcpRunner.join();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        String processOutput = mlcpRunner.getProcessOutput();
        String message = "MLCP copy failed! Output: " + processOutput;
        if (exceptionStackTraces.size() > 0) {
            message += "\n" + StringUtils.join(exceptionStackTraces.toArray(), ',');
        }
        assertTrue(processOutput.contains("OUTPUT_RECORDS_COMMITTED: 1"), message);
        assertTrue(processOutput.contains("OUTPUT_RECORDS_FAILED: 0"), message);
    }
}
