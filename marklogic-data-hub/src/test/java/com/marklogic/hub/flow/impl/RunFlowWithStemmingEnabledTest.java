package com.marklogic.hub.flow.impl;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

public class RunFlowWithStemmingEnabledTest extends AbstractHubCoreTest {

    /*
     https://bugtrack.marklogic.com/54003
     When stemmed search is set to "advanced", fetching legacy mappings (and/or step definition) fails and hence running
     testFlow would fail. After that if db is reindexed, fetching of artifacts succeeds. In order to apply the fix for
     bug 54003 in server, "Reindex JSON language property” trace event has to be added and the test should be run on
     nightly servers. With the fix applied, the flow will fail after reindexing as well as queries requires 'lang=zxx'
     to be included so as to fetch artifacts.
     */
    @Test
    void runFlowWithStemmingSearch() {
        assumeTrue(new MarkLogicVersion(getHubConfig().getManageClient()).getMajor() >= 10);
        try {
            enableAdvancedStemming(true);
            installProjectInFolder("flow-runner-test");

            RunFlowResponse resp = runFlow(new FlowInputs("testFlow"));
            assertEquals(JobStatus.STOP_ON_ERROR.toString(), resp.getJobStatus().toLowerCase());

            reindexDatabase();

            resp = runFlow(new FlowInputs("testFlow"));
            assertEquals(JobStatus.FINISHED.toString(), resp.getJobStatus().toLowerCase());
        }
        finally {
            enableAdvancedStemming(false);
        }
    }

    private void reindexDatabase(){
        DatabaseManager dbManager = new DatabaseManager(runAsAdmin().getManageClient());
        dbManager.reindexDatabase(getHubClient().getDbName(DatabaseKind.STAGING));
        logger.info("Starting to reindex staging database");
        waitForReindex(getHubClient(), HubConfig.DEFAULT_STAGING_NAME);
    }

    private void enableAdvancedStemming(boolean stemming){
        runAsDataHubDeveloper();
        Database db = new Database(new API(getHubClient().getManageClient()), getHubClient().getDbName(DatabaseKind.STAGING));;
        if(stemming){
            db.setStemmedSearches("advanced");
        }
        else {
            db.setStemmedSearches("off");
        }
        db.save();
    }
}
