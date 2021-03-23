package com.marklogic.hub.ext.junit5;

import com.marklogic.hub.test.AbstractSimpleHubTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class PrepareDatabaseTest extends AbstractSimpleHubTest {

    @Test
    void test() {
        installProjectInFolder("test-projects/each-artifact-type");

        final int originalStagingCount = getStagingDocCount();
        final int originalFinalCount = getFinalDocCount();
        final int originalJobsCount = getJobsDocCount();

        writeStagingJsonDoc("/staging1.json", "{}", "stagingTestData");
        writeFinalJsonDoc("/final1.json", "{}", "finalTestData");
        writeJobsXmlDoc("/job1.xml", "<test/>", "Jobs");
        writeJobsXmlDoc("/otherDoc.xml", "<test/>", "SomeOtherCollection");

        assertEquals(originalStagingCount + 1, getStagingDocCount());
        assertEquals(originalFinalCount + 1, getFinalDocCount());
        assertEquals(originalJobsCount + 2, getJobsDocCount());

        new HubDatabasePreparer(getHubClient()).prepareDatabasesBeforeTestMethod(null);

        assertEquals(originalFinalCount, getFinalDocCount(),
            "The final1.json doc should have been deleted, but all artifacts left alone");
        assertEquals(originalStagingCount, getStagingDocCount(),
            "The staging1.json doc should have been deleted, but all artifacts left alone");
        assertEquals(originalJobsCount + 1, getJobsDocCount(),
            "The doc in the Jobs collection should have been deleted, but everything else left alone; " +
                "note that provenance data isn't touched here because deleting it either requires " +
                "admin access or a custom amp. Best practice is that if a developer cares about provenance " +
                "data, she should only enable it in the tests that need it, and then use of the aforementioned " +
                "approaches for deleting it afterwards");
    }
}
