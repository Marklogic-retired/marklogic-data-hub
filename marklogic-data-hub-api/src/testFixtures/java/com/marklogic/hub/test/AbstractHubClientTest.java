package com.marklogic.hub.test;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.MarkLogicIOException;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubClient;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.User;

import java.net.ConnectException;
import java.util.Arrays;

/**
 * Abstract base class for all Data Hub tests. Intended to provide a set of reusable methods for all tests.
 */
public abstract class AbstractHubClientTest extends TestObject {

    protected abstract HubClient getHubClient();

    protected abstract HubClient runAsUser(String username, String password);

    protected void resetDatabases() {
        // Admin is needed to clear out provenance data
        runAsAdmin();

        HubClient client = getHubClient();
        // Running these with primitive retry support, as if a connection cannot be made to ML, this is typically the first thing that will fail
        clearDatabase(client.getStagingClient());
        clearDatabase(client.getFinalClient());
        clearDatabase(client.getJobsClient());
    }

    protected void clearDatabase(DatabaseClient client) {
        retryIfNecessary(() -> client.newServerEval()
            .xquery("cts:uris((), (), cts:not-query(cts:collection-query('hub-core-artifact'))) ! xdmp:document-delete(.)")
            .evalAs(String.class));
    }

    /**
     * Adding this to handle some intermittent connection failures that occur when Jenkins runs the tests.
     *
     * @param r
     */
    protected void retryIfNecessary(Runnable r) {
        int tries = 10;
        long timeToWait = 1000;
        for (int i = 1; i <= tries; i++) {
            try {
                r.run();
                break;
            } catch (MarkLogicIOException ex) {
                if (ex.getCause() instanceof ConnectException) {
                    if (i >= tries) {
                        throw ex;
                    }
                    logger.warn("Caught ConnectException: " + ex.getMessage());
                    sleep(timeToWait);
                    logger.warn("Retrying, attempt: " + (i + 1) + " out of " + tries);
                } else {
                    throw ex;
                }
            }
        }
    }

    protected HubClient runAsDataHubDeveloper() {
        return runAsUser("test-data-hub-developer", "password");
    }

    protected HubClient runAsDataHubSecurityAdmin() {
        return runAsUser("test-data-hub-security-admin", "password");
    }

    protected HubClient runAsDataHubOperator() {
        return runAsUser("test-data-hub-operator", "password");
    }

    protected HubClient runAsAdmin() {
        return runAsUser("test-admin-for-data-hub-tests", "password");
    }

    protected HubClient runAsTestUser() {
        return runAsUser("test-data-hub-user", "password");
    }

    protected HubClient runAsTestUserWithRoles(String... roles) {
        setTestUserRoles(roles);
        return runAsTestUser();
    }

    /**
     * Each test is free to modify the roles on this user so it can be used for any purpose. Such tests should not
     * make any assumptions about what roles this user does have entering into the test.
     *
     * @param roles
     */
    protected void setTestUserRoles(String... roles) {
        runAsAdmin();

        User user = new User(new API(getHubClient().getManageClient()), "test-data-hub-user");
        user.setRole(Arrays.asList(roles));
        user.setPassword("password");
        user.save();
    }

    /**
     * Use this anytime a test needs to wait for things that run on the ML task server - generally, post-commit triggers
     * - to finish, without resorting to arbitrary Thread.sleep calls that don't always work and often require more
     * waiting than necessary.
     */
    protected void waitForTasksToFinish() {
        String query = "xquery version '1.0-ml';" +
            "\n declare namespace ss = 'http://marklogic.com/xdmp/status/server';" +
            "\n declare namespace hs = 'http://marklogic.com/xdmp/status/host';" +
            "\n let $task-server-id as xs:unsignedLong := xdmp:host-status(xdmp:host())//hs:task-server-id" +
            "\n return fn:count(xdmp:server-status(xdmp:host(), $task-server-id)/ss:request-statuses/*)";

        final int maxTries = 100;
        final long sleepPeriod = 200;

        DatabaseClient stagingClient = getHubClient().getStagingClient();

        int taskCount = Integer.parseInt(stagingClient.newServerEval().xquery(query).evalAs(String.class));
        int tries = 0;
        logger.debug("Waiting for task server tasks to finish, count: " + taskCount);
        while (taskCount > 0 && tries < maxTries) {
            tries++;
            try {
                Thread.sleep(sleepPeriod);
            } catch (Exception ex) {
                // ignore
            }
            taskCount = Integer.parseInt(stagingClient.newServerEval().xquery(query).evalAs(String.class));
            logger.debug("Waiting for task server tasks to finish, count: " + taskCount);
        }

        // Hack for cluster tests - if there's more than one host, wait a couple more seconds. Sigh.
        String secondHost = stagingClient.newServerEval().xquery("xdmp:hosts()[2]").evalAs(String.class);
        if (secondHost != null && secondHost.trim().length() > 0) {
            sleep(2000);
        }
    }

    protected JsonNode getStagingDoc(String uri) {
        return getHubClient().getStagingClient().newJSONDocumentManager().read(uri, new JacksonHandle()).get();
    }

    protected JsonNode getFinalDoc(String uri) {
        return getHubClient().getFinalClient().newJSONDocumentManager().read(uri, new JacksonHandle()).get();
    }
}
