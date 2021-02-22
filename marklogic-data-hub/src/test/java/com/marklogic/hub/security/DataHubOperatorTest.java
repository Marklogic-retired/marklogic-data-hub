package com.marklogic.hub.security;

import com.marklogic.client.ForbiddenUserException;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawQueryByExampleDefinition;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * This includes most of the privileges inherited by flow-operator-role, as this role is intended to replace that
 * one. It does not yet include the "manage" privilege, as there doesn't appear to be a use case for that yet.
 * <p>
 * XDBC privileges are retained to support mlcp usage when ingesting data.
 * <p>
 * This no longer tests running flows, as FlowRunnerTest and MappingTest will all run as a data-hub-operator if possible.
 */
public class DataHubOperatorTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-operator";
    }

    @Test
    public void task32ReadJobDocuments() {
        assertTrue(roleBeingTested.getRole().contains("data-hub-job-reader"),
            "The data-hub-job-reader role grants access to Job and Batch documents in the jobs database");
    }

    @Test
    void readSchemas() {
        assertTrue(roleBeingTested.getRole().contains("tde-view"),
            "The entity models and generated artifacts in the schema databases are known to have a tde-view/read " +
                "permissions on them. Since they may have no other read permissions, the operator requires this so that " +
                "it can read entity models.");
    }

    @Test
    void testQBE(){
        assumeTrue(isVersionCompatibleWith520Roles());
        writeFinalJsonDoc("doc1.json", "{\"itemPrice\": 10}");
        writeFinalJsonDoc("doc2.json", "{\"itemPrice\": 5}");

        QueryManager queryMgr = runAsDataHubOperator().getFinalClient().newQueryManager();
        String rawJSONQuery = "{ \"$query\": {\n" +
            "    \"$and\": [\n" +
            "        {\"itemPrice\" : { \"$ge\": 6 } },\n" +
            "        {\"itemPrice\" : { \"$le\": 12 } } ],\n" +
            "    \"$filtered\": true\n" +
            "}}";
        StringHandle rawHandle = new StringHandle(rawJSONQuery).withFormat(Format.JSON);
        RawQueryByExampleDefinition querydef = queryMgr.newRawQueryByExampleDefinition(rawHandle);
        SearchHandle resultsHandle = queryMgr.search(querydef, new SearchHandle());
        assertEquals(1, resultsHandle.getTotalResults(), "QBE works for a user with 'data-hub-operator' as he has 'eval-search-string' privilege");

        QueryManager queryManager = runAsTestUserWithRoles("data-hub-common").getFinalClient().newQueryManager();
        assertThrows(ForbiddenUserException.class, ()->queryManager.search(queryManager.newRawQueryByExampleDefinition(rawHandle), new SearchHandle()),
            "QBE doesn't work for a user with 'data-hub-common' as he doesn't have 'eval-search-string' privilege");
    }
}
