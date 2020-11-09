package com.marklogic.hub.spark.sql.sources.v2.writer;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.BytesHandle;
import com.marklogic.client.io.Format;
import com.marklogic.hub.spark.sql.sources.v2.AbstractSparkConnectorTest;
import org.apache.spark.sql.sources.v2.writer.WriterCommitMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class HandleFailedWriteTest extends AbstractSparkConnectorTest {

    @BeforeEach
    void setupCustomIngestionEndpointThatThrowsAnErrorForBanana() {
        installCustomIngestionEndpoint();

        String moduleTextThatCanThrowError = "declareUpdate(); var input; " +
            "let role = 'data-hub-operator'; " +
            "var inputArray; " +
            "if (input instanceof Sequence) { " +
            "  inputArray = input.toArray().map(item => fn.head(xdmp.fromJSON(item))); " +
            "} else { " +
            "  inputArray = [fn.head(xdmp.fromJSON(input))]; " +
            "} " +
            "for (var fruit of inputArray) {" +
            "  if (fruit.fruitName == 'banana') { fn.error(null, 'RESTAPI-SRVEXERR', Sequence.from([400, 'Throwing error because fruitName is banana'])); } " +
            "  else {" +
            "    xdmp.documentInsert('/test/' + fruit.fruitName + '.json', fruit, [xdmp.permission(role, 'read'), xdmp.permission(role, 'update')], 'fruits');" +
            "  }" +
            "}";

        getHubClient().getModulesClient().newDocumentManager().write(CUSTOM_INGESTION_ENDPOINT_PATH,
            new BytesHandle(moduleTextThatCanThrowError.getBytes()).withFormat(Format.TEXT));

    }

    @Test
    void errorDispositionShouldDefaultToSkipCall() {
        initializeDataWriter(newFruitOptions().withIngestApiPath(CUSTOM_INGESTION_API_PATH));

        WriterCommitMessage message = writeRowsAndCommitWithSourceWriter(
            buildRow("apple", "red"),
            buildRow("banana", "yellow"),
            buildRow("carrot", "orange")
        );

        assertTrue(message instanceof AtLeastOneWriteFailedMessage,
            "Because the call to write a banana failed, and because the default error disposition is SKIP_CALL, the " +
                "call to write a carrot after banana should have completed, but a FailedWriteSkipMessage should " +
                "have been returned so that the DataSourceWriter knows that the job finished but with errors");

        verifyJobFinishedWithErrors();
        verifyOneFruitWasWritten();
    }

    private void verifyJobFinishedWithErrors() {
        JsonNode job = getJobDocument();
        String status = job.get("job").get("jobStatus").asText();
        if(canUpdateJobDoc()){
            assertEquals("finished_with_errors", status, "Since the DataSourceWriter received at least one FailedWriteSkipMessage, the job should have a status " +
                "of finished_with_errors");
        }
        else{
            verifyJobDocumentWasNotUpdated(status);
        }
    }

    private void verifyOneFruitWasWritten() {
        assertEquals(1, getFruitCount(), "With a batch size of 2 (as defined in the custom endpoint API file), " +
            "the first batch containing banana should have failed, but the second batch containing only carrot " +
            "should have worked");
    }
}
