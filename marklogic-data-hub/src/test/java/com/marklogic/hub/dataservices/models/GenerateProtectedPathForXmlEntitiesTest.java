package com.marklogic.hub.dataservices.models;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployProtectedPathsCommand;
import com.marklogic.appdeployer.command.security.DeployQueryRolesetsCommand;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.EntityManagerImpl;
import org.junit.jupiter.api.Test;

import java.io.File;

import static org.junit.jupiter.api.Assertions.*;

public class GenerateProtectedPathForXmlEntitiesTest extends AbstractHubCoreTest {

    @Test
    void test() {
        installProjectInFolder("test-projects/entity-with-indexes");
        new EntityManagerImpl(getHubConfig()).savePii();

        File pathsDir = getHubConfig().getHubProject().getUserSecurityDir().resolve("protected-paths").toFile();
        assertTrue(pathsDir.exists());
        File pathFile = new File(pathsDir, "01_" + HubConfig.PII_PROTECTED_PATHS_FILE);
        assertTrue(pathFile.exists());
        ObjectNode path = readJsonObject(pathFile);
        assertEquals("/*:envelope//*:instance//*:Person/*:personId", path.get("path-expression").asText(),
            "The path should account for both XML and JSON entities");
        assertEquals("pii-reader", path.get("permission").get("role-name").asText());
        assertEquals("read", path.get("permission").get("capability").asText());

        // Verify that the path works on XML and JSON
        runAsFlowDeveloper();
        deployProtectedPathsAndQueryRolesets();
        insertJsonAndXmlEntities();

        runAsDataHubOperator();
        verifyPersonIdIsHidden();
    }

    private void deployProtectedPathsAndQueryRolesets() {
        AppConfig appConfig = getHubConfig().getAppConfig();
        CommandContext context = newCommandContext();
        boolean originalCmaSetting = appConfig.getCmaConfig().isCombineRequests();
        try {
            appConfig.getCmaConfig().setCombineRequests(false);
            new DeployQueryRolesetsCommand().execute(context);
            new DeployProtectedPathsCommand().execute(context);
        } finally {
            appConfig.getCmaConfig().setCombineRequests(originalCmaSetting);
        }
    }

    private void insertJsonAndXmlEntities() {
        HubClient client = getHubClient();
        DocumentMetadataHandle metadata = new DocumentMetadataHandle()
            .withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ)
            .withPermission("data-hub-common", DocumentMetadataHandle.Capability.UPDATE);

        final String json = "{\n" +
            "  \"envelope\": {\n" +
            "    \"instance\": {\n" +
            "      \"Person\": {\n" +
            "        \"personId\": 101,\n" +
            "        \"name\": \"JSON Person\"\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}";
        client.getFinalClient().newJSONDocumentManager().write("/fake/Person101.json", metadata,
            new StringHandle(json).withFormat(Format.JSON));

        final String xml = "<envelope xmlns=\"http://marklogic.com/entity-services\">\n" +
            "  <instance>\n" +
            "    <Person xmlns=\"\">\n" +
            "      <personId>201</personId>\n" +
            "      <name>XML Person</name>\n" +
            "    </Person>\n" +
            "  </instance>\n" +
            "</envelope>";
        client.getFinalClient().newXMLDocumentManager().write("/fake/Person201.xml", metadata,
            new StringHandle(xml).withFormat(Format.XML));
    }

    private void verifyPersonIdIsHidden() {
        HubClient client = getHubClient();
        final String message = "personId should be hidden because it's PII-protected and the user " +
            "doesn't have the pii-reader role";

        JsonNode personDoc = client.getFinalClient().newJSONDocumentManager().read("/fake/Person101.json", new JacksonHandle()).get();
        JsonNode person = personDoc.get("envelope").get("instance").get("Person");
        assertEquals("JSON Person", person.get("name").asText());
        assertFalse(person.has("personId"), message);

        String xml = client.getFinalClient().newXMLDocumentManager().read("/fake/Person201.xml", new StringHandle()).get();
        assertTrue(xml.contains("<name>XML Person</name"));
        assertFalse(xml.contains("personId"), message);
    }
}
