package com.marklogic.hub.spark.sql.sources.v2.writer;

import com.marklogic.hub.spark.sql.sources.v2.AbstractSparkConnectorTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class HandleAbortedWriterTest extends AbstractSparkConnectorTest {

    @Test
    void dataWriterIsAborted() {
        initializeDataWriter(newFruitOptions());
        assertEquals("started", getJobDocumentStatus());

        hubDataWriter.write(buildRow("apple", "red"));
        hubDataWriter.abort();
        logger.info("This test is only verifying that abort doesn't throw an error. It is expected to interrupt " +
            "the BulkInputCaller, but it's not clear what impact that has - as of Java Client 5.3.0, it's possible to " +
            "keep using the caller by calling accept and awaitCompletion on it.");

        assertEquals("started", getJobDocumentStatus(), "Aborting the DataWriter won't impact the job document; it's " +
            "still on the DataSourceWriter to take care of updating the job doc");
    }

    @Test
    void dataSourceWriterIsAborted() {
        initializeDataWriter(newFruitOptions());
        assertEquals("started", getJobDocumentStatus());

        writeRows(buildRow("apple", "red"), buildRow("blueberry", "blue"));
        assertEquals(2, getFruitCount(), "Just verifying the two fruits were written");

        dataSourceWriter.abort(null);
        if(canUpdateJobDoc()){
            assertEquals("canceled", getJobDocumentStatus(), "If the DataSourceWriter is aborted for any reason, the job " +
                "document should have a status of 'canceled'. Note that this does not imply whether any writes failed. " +
                "But that is a limitation of the JobStatus class in DHF.");
        }
        else{
            verifyJobDocumentWasNotUpdated(getJobDocumentStatus());
        }

    }
}
