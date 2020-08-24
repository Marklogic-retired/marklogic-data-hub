package com.marklogic.hub.deploy.commands;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DeployHubOtherServersCommandTest extends AbstractHubCoreTest {

    @Test
    void verifyRewriterOnTestApp() {
        String serverVersion = getServerVersion();

        ObjectNode props = readJsonObject(new ServerManager(getHubConfig().getManageClient())
            .getPropertiesAsJson(getHubConfig().getDbName(DatabaseKind.STAGING)));
        String rewriter = props.get("url-rewriter").asText();

        if (serverVersion.startsWith("9")) {
            assertEquals("/data-hub/5/rest-api/rewriter/9-rewriter.xml", rewriter,
                "Expected 9-rewriter.xml to be used based on server version starting with 9: " + serverVersion);
        } else {
            assertEquals("/data-hub/5/rest-api/rewriter/10-rewriter.xml", rewriter,
                "Expected 10-rewriter.xml to be used because server version does not start with 9: " + serverVersion);
        }
    }

    @Test
    void addServerVersionToCustomTokens() {
        String serverVersion = getServerVersion();

        DeployHubOtherServersCommand command = new DeployHubOtherServersCommand(getHubConfig());
        CommandContext context = newCommandContext();
        command.addServerVersionToCustomTokens(context);

        String tokenValue = context.getAppConfig().getCustomTokens().get("%%mlServerVersion%%");
        assertTrue(serverVersion.startsWith(tokenValue), "Expected the token value to be at the start of the " +
            "version reported by ML; server version: " + serverVersion + "; token: " + tokenValue +
            "; this token is then used to correctly set the rewriter on the staging app server");
    }

    private String getServerVersion() {
        JsonNode node = readJsonObject(getHubConfig().getManageClient().getJson("/manage/v2"));
        return node.iterator().next().get("version").asText();
    }
}
