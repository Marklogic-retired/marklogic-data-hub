package com.marklogic.hub.nifi;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;

/**
 * Provides convenience methods for clients to generate a NiFi template. Makes life easier on the associated Gradle task
 * and JUnit tests.
 */
public class NifiTemplateGenerator {

    private DatabaseClient databaseClient;

    private final static String URI_QUERY = "import module namespace nifi = 'http://marklogic.com/data-hub/nifi' at '/data-hub/5/nifi/nifi.xqy'; "
        + "declare variable $flow-uri external; "
        + "nifi:build-template($flow-uri)";

    private final static String FLOW_QUERY = "import module namespace nifi = 'http://marklogic.com/data-hub/nifi' at '/data-hub/5/nifi/nifi.xqy'; "
        + "declare variable $flow external; "
        + "nifi:build-template-from-flow($flow)";

    public NifiTemplateGenerator(DatabaseClient databaseClient) {
        this.databaseClient = databaseClient;
    }

    public String generateNiFiTemplate(String flowUri) {
        return databaseClient.newServerEval()
            .xquery(URI_QUERY)
            .addVariable("flow-uri", flowUri)
            .evalAs(String.class);
    }

    public String generateNifiTemplateFromJson(String flowJson) {
        return databaseClient.newServerEval()
            .xquery(FLOW_QUERY)
            .addVariable("flow", new StringHandle(flowJson).withFormat(Format.JSON))
            .evalAs(String.class);
    }

}
