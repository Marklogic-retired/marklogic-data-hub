package com.marklogic.hub.ext.junit5;

import com.marklogic.client.FailedRequestException;
import com.marklogic.client.ForbiddenUserException;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubClient;
import org.springframework.test.context.TestContext;

/**
 * Prepares the databases by clearing all data except for DHF artifacts.
 * <p>
 * Avoids directly clearing the database, as that often requires a couple seconds to complete, which is an unacceptable
 * delay when running tests.
 * <p>
 * For some test classes, it may be desirable to disable this behavior for the scope of the test class. For example,
 * a test class that runs marklogic-unit-test modules, which are likely to have their own database preparation logic,
 * may want this behavior disabled. A public static method is available for doing so, presumably via methods marked
 * with the JUnit5 BeforeAll and AfterAll annotations.
 */
public class HubDatabasePreparer extends LoggingObject implements DatabasePreparer {

    private HubClient hubClient;

    private static boolean enabled = true;

    public HubDatabasePreparer(HubClient hubClient) {
        this.hubClient = hubClient;
    }

    @Override
    public void prepareDatabasesBeforeTestMethod(TestContext testContext) {
        if (!enabled) {
            logger.debug("Not enabled, so will not prepare databases");
            return;
        }

        String query = getQueryForClearingDatabase();

        logger.info("Preparing staging database");
        try {
            hubClient.getStagingClient().newServerEval().javascript(query).evalAs(String.class);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to prepare staging database; cause: " + ex.getMessage(), ex);
        }

        logger.info("Preparing final database");
        try {
            hubClient.getFinalClient().newServerEval().javascript(query).evalAs(String.class);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to prepare final database; cause: " + ex.getMessage(), ex);
        }

        logger.info("Preparing jobs database");
        try {
            hubClient.getJobsClient().newServerEval().javascript("declareUpdate(); xdmp.collectionDelete('Jobs')").evalAs(String.class);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to prepare job database; cause: " + ex.getMessage(), ex);
        }
    }

    protected String getQueryForClearingDatabase() {
        return "declareUpdate(); " +
            "cts.uris('', [], cts.notQuery(cts.collectionQuery([" +
            "'hub-core-artifact', " +
            "'http://marklogic.com/entity-services/models', " +
            "'http://marklogic.com/data-hub/flow', " +
            "'http://marklogic.com/data-hub/mappings', " +
            "'http://marklogic.com/data-hub/step-definition', " +
            "'http://marklogic.com/data-hub/steps'" +
            "]))).toArray().forEach(item => xdmp.documentDelete(item))";
    }

    public static boolean isEnabled() {
        return enabled;
    }

    public static void setEnabled(boolean enabled) {
        HubDatabasePreparer.enabled = enabled;
    }
}
