package com.marklogic.hub.spark.sql.sources.v2.writer;

import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.hub.spark.sql.sources.v2.AbstractSparkConnectorTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

public class WriteJobWithCustomEndpointsTest extends AbstractSparkConnectorTest {

    @BeforeEach
    void installCustomJobEndpoints() {
        GenericDocumentManager mgr = getHubClient().getModulesClient().newDocumentManager();
        DocumentMetadataHandle metadata = new DocumentMetadataHandle()
            .withPermission("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE, DocumentMetadataHandle.Capability.EXECUTE);

        final String path = "/custom-job-endpoints/";
        Stream.of("initializeWrite", "finalizeWrite").forEach(moduleName -> {
            String apiPath = path + moduleName + ".api";
            String scriptPath = path + moduleName + ".sjs";
            mgr.write(apiPath, metadata, new InputStreamHandle(readInputStreamFromClasspath(apiPath)).withFormat(Format.JSON));
            mgr.write(scriptPath, metadata, new InputStreamHandle(readInputStreamFromClasspath(scriptPath)).withFormat(Format.TEXT));
        });
    }

    @Test
    void bothEndpointsAreCustom() {
        initializeDataWriter(newFruitOptions()
            .withInitializeWriteApiPath("/custom-job-endpoints/initializeWrite.api")
            .withFinalizeWriteApiPath("/custom-job-endpoints/finalizeWrite.api")
        );

        verifyCustomInitializeEndpointIsUsed();
        dataSourceWriter.commit(null);
        verifyStatusIsStopOnError();
    }

    @Test
    void customInitializeEndpoint() {
        initializeDataWriter(newFruitOptions()
            .withInitializeWriteApiPath("/custom-job-endpoints/initializeWrite.api")
        );

        verifyCustomInitializeEndpointIsUsed();
        dataSourceWriter.commit(null);
        assertEquals("finished", getJobDocumentStatus());
    }

    @Test
    void customFinalizeEndpoint() {
        initializeDataWriter(newFruitOptions()
            .withFinalizeWriteApiPath("/custom-job-endpoints/finalizeWrite.api")
        );

        assertFalse("customId".equals(getJobDocument().get("job").get("jobId")), "Verifying that the custom initialization endpoint is not used");
        dataSourceWriter.commit(null);
        verifyCustomFinalizeEndpointIsUsed();
    }

    @Test
    void invalidInitializeEndpoint() {
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            initializeDataWriter(newFruitOptions().withInitializeWriteApiPath("/missing.api")));
        assertTrue(ex.getMessage().startsWith("Unable to read custom API module for initializing a job"),
            "Expected friendly error message for when the API module is invalid (in this case, it's not found)");
    }

    @Test
    void invalidFinalizeEndpoint() {
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            initializeDataWriter(newFruitOptions().withFinalizeWriteApiPath("/missing.api")));
        assertTrue(ex.getMessage().startsWith("Unable to read custom API module for finalizing a job"),
            "Expected friendly error message for when the API module is invalid (in this case, it's not found)");
    }

    private void verifyCustomInitializeEndpointIsUsed() {
        assertEquals("customId", getJobDocument().get("job").get("jobId").asText(),
            "The custom initializeWrite endpoint is expected to always use 'customId' as the jobId");
    }

    private void verifyCustomFinalizeEndpointIsUsed() {
        if(canUpdateJobDoc()){
            verifyStatusIsStopOnError();
        }
        else{
            verifyJobDocumentWasNotUpdated(getJobDocumentStatus());
        }
    }

    private void verifyStatusIsStopOnError(){
        assertEquals("stop-on-error", getJobDocumentStatus(),
            "The custom finalizeWrite endpoint is expected to always set 'stop-on-error' as the status. This is done " +
                "so that the jobs.sjs module doesn't see some unrecognized status and then try to update the job " +
                "document, which fails when running this test against DHF 5.2.x.");
    }
}
