package com.marklogic.hub.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployProtectedPathsCommand;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.DeployHubQueryRolesetsCommand;
import com.marklogic.hub.impl.EntityManagerImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.io.File;

import static org.junit.jupiter.api.Assertions.*;

public class GenerateProtectedPathsTest extends AbstractHubCoreTest {

    private final DocumentMetadataHandle documentMetadata = new DocumentMetadataHandle()
        .withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ)
        .withPermission("data-hub-common", DocumentMetadataHandle.Capability.UPDATE);

    private HubClient hubClient;

    @AfterEach
    void afterEach() {
        deleteProtectedPaths();
    }

    @Test
    void test() {
        // Install the project and verify the protected path config files are correct
        installProjectInFolder("test-projects/entity-with-indexes");
        new EntityManagerImpl(getHubConfig()).savePii();
        verifyProjectFiles();

        // Setup some data for testing
        hubClient = getHubClient();
        insertJsonEntity();
        insertNoNamespaceXmlEntity();
        insertNamespacedXmlEntity();

        // Make sure a user can see the data
        runAsDataHubOperator();
        verifyPersonIdIsVisible();

        // Deploy the protected path config
        runAsDataHubDeveloper();
        deployProtectedPathsAndQueryRolesets();

        runAsDataHubOperator();
        verifyPersonIdIsHidden();

        runAsTestUserWithRoles("data-hub-operator", "pii-reader");
        verifyPersonIdIsVisible();
    }

    private void verifyPathWithNamespace(ObjectNode path) {
        assertEquals("/es:envelope/es:instance/opwn:NamespacedPerson/opwn:namespacedPersonId", path.get("path-expression").asText(),
            "The path only supports XML instances; the assumption is that if the user specifies a namespace and prefix, then " +
                "the entity instances will all be XML documents");
        assertEquals("pii-reader", path.get("permission").get("role-name").asText());
        assertEquals("read", path.get("permission").get("capability").asText());
    }

    private void verifyPathWithoutNamespace(ObjectNode path) {
        assertEquals("/(es:envelope|envelope)/(es:instance|instance)/Person/personId", path.get("path-expression").asText(),
            "The path should account for both XML and JSON entities");
        assertEquals("pii-reader", path.get("permission").get("role-name").asText());
        assertEquals("read", path.get("permission").get("capability").asText());
    }

    private void verifyProjectFiles() {
        File pathsDir = getHubConfig().getHubProject().getUserSecurityDir().resolve("protected-paths").toFile();
        assertTrue(pathsDir.exists());

        File pathFile = new File(pathsDir, "01_" + HubConfig.PII_PROTECTED_PATHS_FILE);
        assertTrue(pathFile.exists());
        ObjectNode firstPath = readJsonObject(pathFile);

        pathFile = new File(pathsDir, "02_" + HubConfig.PII_PROTECTED_PATHS_FILE);
        assertTrue(pathFile.exists());
        ObjectNode secondPath = readJsonObject(pathFile);

        // The order in which paths are written to files doesn't matter and seems to vary - at least this test has
        // failed in Jenkins - so we verify that both expected paths shows up
        if (firstPath.get("path-expression").asText().contains("/Person/personId")) {
            verifyPathWithoutNamespace(firstPath);
            verifyPathWithNamespace(secondPath);
        } else {
            verifyPathWithoutNamespace(secondPath);
            verifyPathWithNamespace(firstPath);
        }

        File rolesetsDir = getHubConfig().getHubProject().getUserSecurityDir().resolve("query-rolesets").toFile();
        assertTrue(rolesetsDir.exists());
        File rolesetFile = new File(rolesetsDir, "pii-reader.json");
        assertTrue(rolesetFile.exists());
        ObjectNode roleset = readJsonObject(rolesetFile);
        assertEquals("pii-reader", roleset.get("role-name").get(0).asText());
    }

    private void deployProtectedPathsAndQueryRolesets() {
        CommandContext context = newCommandContext();
        new DeployHubQueryRolesetsCommand().execute(context);
        new DeployProtectedPathsCommand().execute(context);
    }

    private void insertJsonEntity() {
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
        hubClient.getFinalClient().newJSONDocumentManager().write("/fake/Person101.json", documentMetadata,
            new StringHandle(json).withFormat(Format.JSON));
    }

    private void insertNoNamespaceXmlEntity() {
        final String xml = "<envelope xmlns=\"http://marklogic.com/entity-services\">\n" +
            "  <instance>\n" +
            "    <Person xmlns=''>\n" +
            "      <personId>201</personId>\n" +
            "      <name>XML Person</name>\n" +
            "    </Person>\n" +
            "  </instance>\n" +
            "</envelope>";
        hubClient.getFinalClient().newXMLDocumentManager().write("/fake/Person201.xml", documentMetadata,
            new StringHandle(xml).withFormat(Format.XML));
    }

    private void insertNamespacedXmlEntity() {
        final String xml = "<envelope xmlns=\"http://marklogic.com/entity-services\">\n" +
            "  <instance>\n" +
            "    <NamespacedPerson xmlns='org:namespacedPerson'>\n" +
            "      <namespacedPersonId>202</namespacedPersonId>\n" +
            "      <namespacedPersonName>Namespaced XML Person</namespacedPersonName>\n" +
            "    </NamespacedPerson>\n" +
            "  </instance>\n" +
            "</envelope>";
        hubClient.getFinalClient().newXMLDocumentManager().write("/fake/Person202.xml", documentMetadata,
            new StringHandle(xml).withFormat(Format.XML));
    }

    private void verifyPersonIdIsHidden() {
        HubClient client = getHubClient();
        final String message = "personId should be hidden because it's PII-protected and the user " +
            "doesn't have the pii-reader role; content: ";

        JsonNode personDoc = client.getFinalClient().newJSONDocumentManager().read("/fake/Person101.json", new JacksonHandle()).get();
        JsonNode person = personDoc.get("envelope").get("instance").get("Person");
        assertEquals("JSON Person", person.get("name").asText());
        assertFalse(person.has("personId"), message + person.toString());

        String xml = client.getFinalClient().newXMLDocumentManager().read("/fake/Person201.xml", new StringHandle()).get();
        assertTrue(xml.contains("<name>XML Person</name"));
        assertFalse(xml.contains("personId"), message + xml);

        xml = client.getFinalClient().newXMLDocumentManager().read("/fake/Person202.xml", new StringHandle()).get();
        assertTrue(xml.contains("Namespaced XML Person"));
        assertFalse(xml.contains("namespacedPersonId"), message + xml);
    }

    private void verifyPersonIdIsVisible() {
        HubClient client = getHubClient();
        final String message = "personId should be visible because the user has the pii-reader role; content: ";

        JsonNode personDoc = client.getFinalClient().newJSONDocumentManager().read("/fake/Person101.json", new JacksonHandle()).get();
        JsonNode person = personDoc.get("envelope").get("instance").get("Person");
        assertEquals("JSON Person", person.get("name").asText());
        assertTrue(person.has("personId"), message + person.toString());

        String xml = client.getFinalClient().newXMLDocumentManager().read("/fake/Person201.xml", new StringHandle()).get();
        assertTrue(xml.contains("<name>XML Person</name"));
        assertTrue(xml.contains("personId"), message + xml);

        xml = client.getFinalClient().newXMLDocumentManager().read("/fake/Person202.xml", new StringHandle()).get();
        assertTrue(xml.contains("Namespaced XML Person"));
        assertTrue(xml.contains("namespacedPersonId"), message + xml);
    }

}
