package com.marklogic.hub.dhs.installer.deploy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class CopyQueryOptionsCommandTest extends AbstractHubCoreTest {

    @Test
    void test() throws Exception {
        runAsAdmin();
        // clear user modules to ensure extra options aren't left from other tests
        clearUserModules();

        final String groupName = getHubConfig().getAppConfig().getGroupName();
        final String stagingServerName = getHubConfig().getHttpName(DatabaseKind.STAGING);
        final String jobsServerName = getHubConfig().getHttpName(DatabaseKind.JOB);

        CopyQueryOptionsCommand command = new CopyQueryOptionsCommand(getHubConfig(),
            Arrays.asList(groupName, "testGroup-B", "testGroup-C"),
            Arrays.asList(stagingServerName, "testServer-B", "testServer-C"),
            jobsServerName
        );

        command.execute(newCommandContext());
        ArrayNode uris = (ArrayNode) new ObjectMapper().readTree(command.getScriptResponse());
        // Adding uris to a list so we can check for them in a way that isn't order dependent. Even with URIs sorted, the dynamic group name can change order.
        List<String> urisList = new ArrayList<>();
        uris.forEach((uriNode) -> {
            urisList.add(uriNode.asText());
        });
        assertEquals(12, uris.size(),
            "12 URIs are expected. " +
                "2 URIs are for copying default.xml to data-hub-STAGING in the other 2 groups. " +
                "6 URIs are for copying default.xml to the other 2 servers in all 3 groups. " +
                "2 URIs are for copying jobs.xml to data-hub-JOBS in the other 2 groups. " +
                "2 URIs are for copying traces.xml to data-hub-JOBS in the other 2 groups.");
        assertTrue(urisList.contains("/testGroup-B/data-hub-STAGING/rest-api/options/default.xml"));
        assertTrue(urisList.contains("/testGroup-C/data-hub-STAGING/rest-api/options/default.xml"));
        assertTrue(urisList.contains("/" + groupName + "/testServer-B/rest-api/options/default.xml"));
        assertTrue(urisList.contains("/" + groupName + "/testServer-C/rest-api/options/default.xml"));
        assertTrue(urisList.contains("/testGroup-B/testServer-B/rest-api/options/default.xml"));
        assertTrue(urisList.contains("/testGroup-B/testServer-C/rest-api/options/default.xml"));
        assertTrue(urisList.contains("/testGroup-C/testServer-B/rest-api/options/default.xml"));
        assertTrue(urisList.contains("/testGroup-C/testServer-C/rest-api/options/default.xml"));

        assertTrue(urisList.contains("/testGroup-B/data-hub-JOBS/rest-api/options/jobs.xml"));
        assertTrue(urisList.contains("/testGroup-C/data-hub-JOBS/rest-api/options/jobs.xml"));
        assertTrue(urisList.contains("/testGroup-B/data-hub-JOBS/rest-api/options/traces.xml"));
        assertTrue(urisList.contains("/testGroup-C/data-hub-JOBS/rest-api/options/traces.xml"));
    }
}
