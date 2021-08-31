package com.marklogic.hub.test;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.MarkLogicIOException;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.io.*;
import com.marklogic.hub.HubClient;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.User;
import com.marklogic.rest.util.Fragment;
import org.w3c.dom.Document;

import java.net.ConnectException;
import java.util.Arrays;
import java.util.function.Consumer;

/**
 * Abstract base class tests that only depend on a HubClient and not a HubProject.
 */
public abstract class AbstractHubClientTest extends TestObject {

    protected abstract HubClient getHubClient();

    protected abstract HubClient doRunAsUser(String username, String password);

    protected final HubClient runAsUser(String username, String password) {
        long start = System.currentTimeMillis();
        HubClient hubClient = doRunAsUser(username, password);
        logger.info("Running as user: " + username + "; switching time: " +
                (System.currentTimeMillis() - start) + "ms");

        return hubClient;
    }

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
            .xquery("cts:uris((), (), cts:not-query(cts:collection-query(('hub-core-artifact', 'hub-template')))) ! xdmp:document-delete(.)")
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
        makeTestUserWithRoles(roles).save();
    }

    /**
     * @param roles
     * @return an un-saved User object for test-data-hub-user with the given roles; the typical intent here is that you
     * want to further modify the User before saving it
     */
    protected User makeTestUserWithRoles(String... roles) {
        User user = new User(new API(getHubClient().getManageClient()), "test-data-hub-user");
        user.setRole(Arrays.asList(roles));
        user.setPassword("password");
        return user;
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
            "\n fn:sum(" +
            "\n  for $host in xdmp:hosts()" +
            "\n  let $task-server-id as xs:unsignedLong := xdmp:host-status($host)//hs:task-server-id" +
            "\n  return fn:count(xdmp:server-status($host, $task-server-id)/ss:request-statuses/*)" +
            "\n )";

        final int maxTries = 100;
        final long sleepPeriod = 200;

        DatabaseClient stagingClient = getHubClient().getStagingClient();

        int taskCount = Integer.parseInt(stagingClient.newServerEval().xquery(query).evalAs(String.class));
        int tries = 0;
        logger.info("Waiting for task server tasks to finish, count: " + taskCount);
        while (taskCount > 0 && tries < maxTries) {
            tries++;
            try {
                Thread.sleep(sleepPeriod);
            } catch (Exception ex) {
                // ignore
            }
            taskCount = Integer.parseInt(stagingClient.newServerEval().xquery(query).evalAs(String.class));
            logger.info("Waiting for task server tasks to finish, count: " + taskCount);
        }
    }

    protected void waitForRebalance(HubClient hubClient, String database){
        String query = "(\n" +
                "  for $forest-id in xdmp:database-forests(xdmp:database('" + database + "'))\n" +
                "  return xdmp:forest-status($forest-id)//*:rebalancing\n" +
                ") = fn:true()";
        waitForQueryToBeTrue(hubClient, query, "Rebalancing " + database + " database");
    }

    protected void waitForQueryToBeTrue(HubClient hubClient, String query, String message){
        boolean currentStatus;
        int attempts = 125;
        boolean previousStatus = false;
        do{
            sleep(200L);
            currentStatus = Boolean.parseBoolean(hubClient.getStagingClient().newServerEval().xquery(query).evalAs(String.class));
            if(currentStatus){
                logger.info(message);
            }
            if(!currentStatus && previousStatus){
                logger.info("Finished: " + message);
                return;
            }
            else{
                previousStatus = currentStatus;
            }
            attempts--;
        }
        while(attempts > 0);
        if(currentStatus){
            logger.warn(message + " is taking more than 25 seconds");
        }
    }

    protected JsonNode getStagingDoc(String uri) {
        return getHubClient().getStagingClient().newJSONDocumentManager().read(uri, new JacksonHandle()).get();
    }


    protected JsonNode getFinalDoc(String uri) {
        return getHubClient().getFinalClient().newJSONDocumentManager().read(uri, new JacksonHandle()).get();
    }

    /**
     *
     * @param uri
     * @return an ml-app-deployer Fragment object, which understands common ML namespace prefixes and has some methods
     * that make assertions easy
     */
    protected Fragment getStagingXmlDoc(String uri) {
        return new Fragment(getHubClient().getStagingClient().newXMLDocumentManager().read(uri, new StringHandle()).get());
    }

    /**
     *
     * @param uri
     * @return an ml-app-deployer Fragment object, which understands common ML namespace prefixes and has some methods
     * that make assertions easy
     */
    protected Fragment getFinalXmlDoc(String uri) {
        return new Fragment(getHubClient().getFinalClient().newXMLDocumentManager().read(uri, new StringHandle()).get());
    }

    protected void writeStagingJsonDoc(String uri, String content, String... collections) {
        writeJsonDoc(getHubClient().getStagingClient(), uri, content, collections);
    }

    protected void writeFinalJsonDoc(String uri, String content, String... collections) {
        writeJsonDoc(getHubClient().getFinalClient(), uri, content, collections);
    }

    protected void writeJsonDoc(DatabaseClient client, String uri, String content, String... collections) {
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        addDefaultPermissions(metadata);
        metadata.getCollections().addAll(collections);
        client.newDocumentManager().write(uri, metadata, new BytesHandle(content.getBytes()).withFormat(Format.JSON));
    }

    protected void writeXmlDoc(DatabaseClient client, String uri, String content, String... collections) {
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        addDefaultPermissions(metadata);
        metadata.getCollections().addAll(collections);
        client.newDocumentManager().write(uri, metadata, new BytesHandle(content.getBytes()).withFormat(Format.XML));
    }

    protected void writeJobsXmlDoc(String uri, String content, String... collections) {
        writeXmlDoc(getHubClient().getJobsClient(), uri, content, collections);
    }

    protected void writeStagingXmlDoc(String uri, String content, String... collections) {
        writeXmlDoc(getHubClient().getStagingClient(), uri, content, collections);
    }

    /**
     * Convenience method for doing something with a WriteBatcher.
     *
     * @param client
     * @param consumer
     */
    protected void doWithWriteBatcher(DatabaseClient client, Consumer<WriteBatcher> consumer) {
        long start = System.currentTimeMillis();
        DataMovementManager mgr = client.newDataMovementManager();
        WriteBatcher writeBatcher = mgr.newWriteBatcher()
            // Reasonable values for good performance
            .withThreadCount(16).withBatchSize(200);
        mgr.startJob(writeBatcher);

        consumer.accept(writeBatcher);

        writeBatcher.flushAndWait();
        writeBatcher.awaitCompletion();
        mgr.stopJob(writeBatcher);
        logger.info("Time spent running WriteBatcher: " + (System.currentTimeMillis() - start));
    }
}
