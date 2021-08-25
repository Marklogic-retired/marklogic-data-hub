package com.marklogic.hub.central.entities.search;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.entities.search.models.SearchQuery;
import com.marklogic.hub.deploy.commands.HubDeployDatabaseCommandFactory;
import com.marklogic.hub.impl.EntityManagerImpl;
import com.marklogic.junit5.XmlNode;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.rest.util.Fragment;
import org.jdom2.Namespace;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

public class ExploreCustomEntityInstancesTest extends AbstractHubCentralTest {

    // Using an alternate convention for entity type collections, which allows us to verify that DHF supports
    // modifying the entityType constraint to match how the data is persisted
    private final static String ENTITY_COLLECTION = "entity-Person";

    @AfterEach
    void afterEach() {
        // Gotta reset the indexes because we changed them during this test
        runAsAdmin();
        applyDatabasePropertiesForTests(getHubConfig());

        // And need to reload all of the OOTB extension modules so as not to impact subsequent tests
        installHubModules();
    }

    @Test
    void test() {
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/custom-data");

        saveAndDeployIndexesAndQueryOptions();
        verifySearchOptionsWereModified();
        verifyDatabaseIndexesWereModified();

        runAsDataHubOperator();
        insertPersonBornIn1990();
        insertPersonBornIn1991();

        verifyPersonSearchResults();
        verifyPersonsSortedByBirthYearDescending();
        assertEquals(1, search(new SearchQuery("Person").withSearchText("Jane")).get("total").asInt());
        assertEquals(0, search(new SearchQuery("Person").withSearchText("aTermThatDoesntMatchAnything")).get("total").asInt());
    }

    private void verifyPersonSearchResults() {
        ObjectNode response = search(new SearchQuery("Person"));
        ArrayNode results = (ArrayNode) response.get("results");

        assertEquals(2, response.get("total").asInt(), "The entityType constraint in the options should have been " +
            "modified so that a custom module is used that expects entity instances to be in a collection matching " +
            "the lower-case representation of the entity type name, as opposed to the DHF default of the collection " +
            "being the same value as the entity type name");
        assertEquals("/person1990.json", results.get(0).get("uri").asText());
        assertEquals("/person1991.json", results.get(1).get("uri").asText());

        // Verify an entity-specific facet
        JsonNode statusFacet = response.get("facets").get("Person.status");
        assertNotNull(statusFacet, "Expecting Person.status facet to exist; response: " + response.toPrettyString());
        assertEquals(1, statusFacet.get("facetValues").size(), "Expecting the status value to be returned; this ensures " +
            "that both the database indexes and the range constraints were modified to conform to the project-specific path " +
            "of /customEnvelope/Person/status/value instead of assuming the ES-specific path");
        assertEquals("Active", statusFacet.get("facetValues").get(0).get("name").asText());
        assertEquals(2, statusFacet.get("facetValues").get(0).get("count").asInt(), "Expecting a count of 2 since each of " +
            "the 2 persons has a status of 'Active'");

        // Verify entity-specific property values
        ArrayNode entityProps = (ArrayNode) results.get(0).get("entityProperties");
        assertEquals(3, entityProps.size(), "Expecting name, status, and birthYear properties, since those are the 3 " +
            "properties defined in the model");
        assertEquals("Jane", entityProps.get(0).get("propertyValue").asText());
        assertEquals("Active", entityProps.get(1).get("propertyValue").asText());
        assertEquals("1990", entityProps.get(2).get("propertyValue").asText());

        entityProps = (ArrayNode) results.get(1).get("entityProperties");
        assertEquals(3, entityProps.size());
        assertEquals("Janet", entityProps.get(0).get("propertyValue").asText());
        assertEquals("Active", entityProps.get(1).get("propertyValue").asText());
        assertEquals("1991", entityProps.get(2).get("propertyValue").asText());
    }

    private void verifyPersonsSortedByBirthYearDescending() {
        ObjectNode response = search(new SearchQuery("Person").addSortOrder("birthYear", "descending"));
        assertEquals(2, response.get("total").asInt());
        assertEquals("/person1991.json", response.get("results").get(0).get("uri").asText());
        assertEquals("/person1990.json", response.get("results").get(1).get("uri").asText());
    }

    private ObjectNode search(SearchQuery query) {
        return readJsonObject(new EntitySearchManager(getHubClient(), "final").search(query).get());
    }

    private void insertPersonBornIn1990() {
        writeFinalJsonDoc("/person1990.json", "{\n" +
            "  \"customEnvelope\": {\n" +
            "    \"Person\": {\n" +
            "      \"name\": {\n" +
            "        \"value\": \"Jane\",\n" +
            "        \"confirmed\": true\n" +
            "      },\n" +
            "      \"status\": {\n" +
            "        \"value\": \"Active\"\n" +
            "      },\n" +
            "      \"birthYear\": {\n" +
            "        \"value\": \"1990\"\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}", ENTITY_COLLECTION);
    }

    private void insertPersonBornIn1991() {
        writeFinalJsonDoc("/person1991.json", "{\n" +
            "  \"customEnvelope\": {\n" +
            "    \"Person\": {\n" +
            "      \"name\": {\n" +
            "        \"value\": \"Janet\",\n" +
            "        \"confirmed\": true\n" +
            "      },\n" +
            "      \"status\": {\n" +
            "        \"value\": \"Active\"\n" +
            "      },\n" +
            "      \"birthYear\": {\n" +
            "        \"value\": \"1991\"\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}", ENTITY_COLLECTION);
    }

    private void saveAndDeployIndexesAndQueryOptions() {
        EntityManager mgr = new EntityManagerImpl(getHubConfig());
        mgr.saveDbIndexes();

        runAsAdmin();
        DeployOtherDatabasesCommand command = new DeployOtherDatabasesCommand();
        command.setResourceFilenamesIncludePattern(Pattern.compile("final-database.json"));
        command.setDeployDatabaseCommandFactory(new HubDeployDatabaseCommandFactory(getHubConfig()));
        command.execute(newCommandContext());

        mgr.deployQueryOptions();
    }

    private void verifySearchOptionsWereModified() {
        String xml = getHubClient().getFinalClient().newServerConfigManager().newQueryOptionsManager()
            .readOptions("exp-final-entity-options", new StringHandle()).get();
        XmlNode options = new XmlNode(xml, Namespace.getNamespace("s", "http://marklogic.com/appservices/search"));

        assertEquals("/custom-data-modules/my-entity-type-constraint.xqy",
            options.getAttributeValue("/s:options/s:constraint[@name = 'entityType']/s:custom/s:parse", "at"));
        assertEquals("/customEnvelope/Person/birthYear/value",
            options.getElementValue("/s:options/s:operator/s:state[@name = 'Person_birthYearAscending']/s:sort-order/s:path-index"));
        assertEquals("/customEnvelope/Person/birthYear/value",
            options.getElementValue("/s:options/s:operator/s:state[@name = 'Person_birthYearDescending']/s:sort-order/s:path-index"));
        assertEquals("/customEnvelope/Person/status/value",
            options.getElementValue("/s:options/s:constraint[@name = 'Person.status']/s:range/s:path-index"));
    }

    private void verifyDatabaseIndexesWereModified() {
        Fragment config = new DatabaseManager(getHubClient().getManageClient()).getPropertiesAsXml(getHubClient().getDbName(DatabaseKind.FINAL));
        assertTrue(config.elementExists("/m:database-properties/m:range-path-indexes/" +
                "m:range-path-index[m:path-expression = '/customEnvelope/Person/status/value']"),
            "The index for a facetable=true property should have been modified to match the custom data format");
        assertTrue(config.elementExists("/m:database-properties/m:range-path-indexes/" +
                "m:range-path-index[m:path-expression = '/customEnvelope/Person/birthYear/value']"),
            "The index for a sortable=true property should have been modified to match the custom data format");
    }
}
