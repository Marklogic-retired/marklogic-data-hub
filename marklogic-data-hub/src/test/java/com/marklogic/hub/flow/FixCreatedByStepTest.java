package com.marklogic.hub.flow;

import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.test.ReferenceModelProject;
import com.marklogic.hub.util.CreatedByStepFixer;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class FixCreatedByStepTest extends AbstractHubCoreTest {

    private static final String CREATED_BY_STEP = "datahubCreatedByStep";
    private static final String FIXED_COLLECTION = "datahubCreatedByStep-fixed";

    private List<String> customerUris = new ArrayList<>();
    private CreatedByStepFixer createdByStepFixer;
    private String finalDatabaseName;

    @BeforeEach
    void beforeEach() {
        HubClient hubDeveloperClient = getHubClient();

        finalDatabaseName = hubDeveloperClient.getDbName(DatabaseKind.FINAL);

        createdByStepFixer = new CreatedByStepFixer(hubDeveloperClient);
        // Using a batch size to force multiple calls for each forest, just to verify that the Bulk code is working correctly
        createdByStepFixer.setBatchSize(10);
    }

    @Test
    void happyPath() {
        ReferenceModelProject project = installReferenceModelProject();

        // Creating 100 records for a very mild performance test - loading and process takes under a second still, but
        // it at least causes the QueryBatcher in the implementation to do some multi-threading work.
        // Can crank this up for manual performance tests
        long start = System.currentTimeMillis();
        for (int i = 1; i <= 100; i++) {
            project.createRawCustomer(i, "Customer " + i);
            customerUris.add("/echo/customer" + i + ".json");
        }
        logger.info("Insert time: " + (System.currentTimeMillis() - start));

        start = System.currentTimeMillis();
        runFlow(new FlowInputs("echoFlow"));
        logger.info("Flow time: " + (System.currentTimeMillis() - start));

        Pair<Long, String> preview = createdByStepFixer.previewFixingDocuments(finalDatabaseName);
        assertEquals(0, preview.getLeft(), "Since DHFPROD-5380 fixed the bug, datahubCreatedByStep should be correct and have step name as its value");
        assertNull(preview.getRight());
        assertEquals(0, getFinalDocCount(FIXED_COLLECTION));

        revertCreatedByStep();
        preview = createdByStepFixer.previewFixingDocuments(finalDatabaseName);
        assertEquals(customerUris.size(), preview.getLeft(), "datahubCreatedByStep should now have a step definition name as its value, and so we should have 3 documents to fix");
        assertNotNull(preview.getRight());
        assertEquals(0, getFinalDocCount(FIXED_COLLECTION));

        start = System.currentTimeMillis();
        createdByStepFixer.fixInDatabase(finalDatabaseName);
        logger.info("Time to fix: " + (System.currentTimeMillis() - start));

        verifyCreatedByStepIsFixed();
        assertEquals(0, createdByStepFixer.previewFixingDocuments(finalDatabaseName).getLeft(),
            "datahubCreatedByStep should be fixed again, which means we have no documents left to fix");
        assertEquals(customerUris.size(), getFinalDocCount(FIXED_COLLECTION));
    }

    @Test
    void noProvenanceDataExists() {
        ReferenceModelProject project = installReferenceModelProject();
        project.createRawCustomer(1, "Customer One");
        customerUris = Arrays.asList("/echo/customer1.json");

        runFlow(new FlowInputs("echoFlow"));

        revertCreatedByStep();

        runAsAdmin();
        getHubClient().getJobsClient().newServerEval().xquery("xdmp:collection-delete('http://marklogic.com/provenance-services/record')").evalAs(String.class);

        runAsDataHubDeveloper();
        createdByStepFixer.fixInDatabase(finalDatabaseName);

        DocumentMetadataHandle metadata = getHubClient().getFinalClient().newDocumentManager().readMetadata(customerUris.get(0), new DocumentMetadataHandle());
        assertEquals("echoStep", metadata.getMetadataValues().get(CREATED_BY_STEP),
            "When no wasInfluencedBy triple exists - likely because provenance data was either disabled when the step was run, " +
                "or deleted afterwards - then the metadata value cannot be fixed");
        assertEquals(0, getFinalDocCount(FIXED_COLLECTION));
    }

    /**
     * In order to test the fix process, we need to adjust the correct data to be like what it was
     * before DHFPROD-5380 was fixed.
     */
    private void revertCreatedByStep() {
        GenericDocumentManager mgr = getHubClient().getFinalClient().newDocumentManager();
        customerUris.forEach(uri -> {
            DocumentMetadataHandle metadata = mgr.readMetadata(uri, new DocumentMetadataHandle());
            assertEquals("runEchoStep", metadata.getMetadataValues().get(CREATED_BY_STEP),
                "Verifying the correct value is in place before we revert");
            metadata.getMetadataValues().add(CREATED_BY_STEP, "echoStep");
            mgr.write(uri, metadata, null);

            metadata = mgr.readMetadata(uri, new DocumentMetadataHandle());
            assertEquals("echoStep", metadata.getMetadataValues().get(CREATED_BY_STEP), "Just verifying the update worked");
        });
    }

    private void verifyCreatedByStepIsFixed() {
        GenericDocumentManager mgr = getHubClient().getFinalClient().newDocumentManager();
        customerUris.forEach(uri -> {
            DocumentMetadataHandle metadata = mgr.readMetadata(uri, new DocumentMetadataHandle());
            assertEquals("runEchoStep", metadata.getMetadataValues().get(CREATED_BY_STEP),
                "The fix script should have found the triple that identifies the step name that last modified the document, " +
                    "and that should now be the value of datahubCreatedByStep");
        });
    }
}
