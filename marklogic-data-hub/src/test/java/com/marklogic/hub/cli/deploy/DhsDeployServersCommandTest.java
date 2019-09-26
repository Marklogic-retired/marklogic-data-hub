package com.marklogic.hub.cli.deploy;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.mgmt.api.server.Server;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class DhsDeployServersCommandTest {

    @Test
    public void test() throws Exception {
        AppConfig appConfig = new AppConfig();
        appConfig.setIncludeProperties("shape", "size");

        CommandContext context = new CommandContext(appConfig, null, null);

        Server server = new Server();
        server.setServerName("some-server");
        server.setUrlRewriter("some-rewriter");
        server.setErrorHandler("some-handler");
        server.setPort(8123);
        server.setAuthentication("digestbasic");

        final String payload = new DhsDeployServersCommand(null).adjustPayloadBeforeSavingResource(context, null, server.getJson());
        JsonNode node = ObjectMapperFactory.getObjectMapper().readTree(payload);
        assertEquals("some-server", node.get("server-name").asText());
        assertEquals("some-rewriter", node.get("url-rewriter").asText());
        assertEquals("some-handler", node.get("error-handler").asText());

        final String message = "Only server-name, url-rewriter, and error-handler should be retained so no other DHS settings can be overridden";
        assertFalse(node.has("port"), message);
        assertFalse(node.has("authentication"), message);
    }
}
