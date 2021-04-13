package com.marklogic.hub.flow;

import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.rest.util.Fragment;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class IngestJsonAsXmlTest extends AbstractHubCoreTest {

    /**
     * This replaces jsonToXmlIngestion.sjs, which started to mysteriously fail on the develop branch for reasons we
     * couldn't figure out. The goal of the test is just to verify that a JSON document can be ingested as an XML
     * document with an envelope around it.
     */
    @Test
    void test() {
        installProjectInFolder("test-projects/ingest-test");

        final String flowName = "ingestFlow";
        makeInputFilePathsAbsoluteInFlow(flowName);
        RunFlowResponse response = runFlow(new FlowInputs(flowName, "1"));
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());

        assertEquals(0, getBatchDocCount(), "Running an ingestion step, which involves a REST transform, should never " +
            "write Batch documents because it's not possible to create one Batch doc per actual DMSDK batch; it is " +
            "thus considered ineffective to create a Batch doc for every ingest document");

        // The URI is still written with ".json" by default, since that's the name of the file on disk
        String xml = getHubConfig().newStagingClient().newXMLDocumentManager().read("/xml/data.json", new StringHandle()).get();
        Fragment doc = new Fragment(xml);
        // Just verify a few values
        assertEquals("Asia", doc.getElementValue("/es:envelope/es:instance/Region"));
        assertEquals("12345", doc.getElementValue("/es:envelope/es:instance/_40_SalesID"), "@SalesID should have been " +
            "encoded to be a safe XML element name");
        assertEquals("21761.16", doc.getElementValue("/es:envelope/es:instance/Total_20_Profit"));
    }
}
