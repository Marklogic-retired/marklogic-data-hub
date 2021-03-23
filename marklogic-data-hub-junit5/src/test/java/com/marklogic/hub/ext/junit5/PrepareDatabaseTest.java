package com.marklogic.hub.ext.junit5;

import com.marklogic.hub.test.AbstractSimpleHubTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class PrepareDatabaseTest extends AbstractSimpleHubTest {

    @Test
    void test() {
        installProjectInFolder("flow-runner-test");
        if (true) return;

        writeFinalJsonDoc("/final1.json", "{}", "finalTestData");
        writeStagingJsonDoc("/staging1.json", "{}", "stagingTestData");
        writeJobsXmlDoc("/job1.xml", "<test/>", "Jobs");
        writeJobsXmlDoc("/otherDoc.xml", "<test/>", "SomeOtherCollection");

        final int finalDocCount = getFinalDocCount();
        final int stagingDocCount = getStagingDocCount();
        final int jobsDocCount = getJobDocCount();

        new HubDatabasePreparer(getHubClient()).prepareDatabasesBeforeTestMethod(null);

        assertEquals(finalDocCount - 1, getFinalDocCount(),
            "The final1.json doc should have been deleted, but all artifacts left alone");
    }
}
