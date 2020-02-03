package com.marklogic.hub.dhs.installer.deploy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class CopyQueryOptionsCommandTest extends HubTestBase {

    @Test
    void test() throws Exception {
        runAsAdmin();
        try {
            final String groupName = adminHubConfig.getAppConfig().getGroupName();
            final String stagingServerName = adminHubConfig.getHttpName(DatabaseKind.STAGING);
            final String jobsServerName = adminHubConfig.getHttpName(DatabaseKind.JOB);

            CopyQueryOptionsCommand command = new CopyQueryOptionsCommand(adminHubConfig,
                Arrays.asList(groupName, "testGroup-B", "testGroup-C"),
                Arrays.asList(stagingServerName, "testServer-B", "testServer-C"),
                jobsServerName
            );

            command.execute(new CommandContext(adminHubConfig.getAppConfig(), null, null));
            ArrayNode uris = (ArrayNode) new ObjectMapper().readTree(command.getScriptResponse());

            int index = 0;
            assertEquals("/testGroup-B/data-hub-STAGING/rest-api/options/default.xml", uris.get(index++).asText());
            assertEquals("/testGroup-C/data-hub-STAGING/rest-api/options/default.xml", uris.get(index++).asText());
            assertEquals("/" + groupName + "/testServer-B/rest-api/options/default.xml", uris.get(index++).asText());
            assertEquals("/" + groupName + "/testServer-C/rest-api/options/default.xml", uris.get(index++).asText());
            assertEquals("/testGroup-B/testServer-B/rest-api/options/default.xml", uris.get(index++).asText());
            assertEquals("/testGroup-B/testServer-C/rest-api/options/default.xml", uris.get(index++).asText());
            assertEquals("/testGroup-C/testServer-B/rest-api/options/default.xml", uris.get(index++).asText());
            assertEquals("/testGroup-C/testServer-C/rest-api/options/default.xml", uris.get(index++).asText());

            assertEquals("/testGroup-B/data-hub-STAGING/rest-api/options/exp-default.xml", uris.get(index++).asText());
            assertEquals("/testGroup-C/data-hub-STAGING/rest-api/options/exp-default.xml", uris.get(index++).asText());
            assertEquals("/" + groupName + "/testServer-B/rest-api/options/exp-default.xml", uris.get(index++).asText());
            assertEquals("/" + groupName + "/testServer-C/rest-api/options/exp-default.xml", uris.get(index++).asText());
            assertEquals("/testGroup-B/testServer-B/rest-api/options/exp-default.xml", uris.get(index++).asText());
            assertEquals("/testGroup-B/testServer-C/rest-api/options/exp-default.xml", uris.get(index++).asText());
            assertEquals("/testGroup-C/testServer-B/rest-api/options/exp-default.xml", uris.get(index++).asText());
            assertEquals("/testGroup-C/testServer-C/rest-api/options/exp-default.xml", uris.get(index++).asText());

            assertEquals("/testGroup-B/data-hub-JOBS/rest-api/options/jobs.xml", uris.get(index++).asText());
            assertEquals("/testGroup-C/data-hub-JOBS/rest-api/options/jobs.xml", uris.get(index++).asText());
            assertEquals("/testGroup-B/data-hub-JOBS/rest-api/options/traces.xml", uris.get(index++).asText());
            assertEquals("/testGroup-C/data-hub-JOBS/rest-api/options/traces.xml", uris.get(index++).asText());

            assertEquals(20, uris.size(),
                "20 URIs are expected. " +
                    "2 URIs are for copying default.xml to data-hub-STAGING in the other 2 groups. " +
                    "6 URIs are for copying default.xml to the other 2 servers in all 3 groups. " +
                    "8 URIs are for copying exp-default.xml in the same fashion as default.xml. " +
                    "2 URIs are for copying jobs.xml to data-hub-JOBS in the other 2 groups. " +
                    "2 URIs are for copying traces.xml to data-hub-JOBS in the other 2 groups.");
        } finally {
            getDataHubAdminConfig();
        }
    }
}
