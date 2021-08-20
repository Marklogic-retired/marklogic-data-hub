package com.marklogic.hub.customdata;

import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.query.FacetResult;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.QueryManager;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.deploy.commands.HubDeployDatabaseCommandFactory;
import com.marklogic.hub.impl.EntityManagerImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ExploreCustomEntityInstancesTest extends AbstractHubCoreTest {

    // Using an alternate convention for entity type collections, which allows us to verify that DHF supports
    // modifying the entityType constraint to match how the data is persisted
    private final static String ENTITY_COLLECTION = "entity-Person";

    @AfterEach
    void afterEach() {
        // Gotta reset the indexes because we changed them during this test
        runAsAdmin();
        applyDatabasePropertiesForTests(getHubConfig());
    }

    @Test
    void test() {
        installProjectInFolder("test-projects/custom-data");
        saveAndDeployIndexesAndQueryOptions();

        runAsDataHubOperator();
        insertPersonBornIn1990();
        insertPersonBornIn1991();

        SearchHandle response = searchWithCriteria("entityType:Person sort:Person_birthYearAscending");
        assertEquals(2, response.getTotalResults(), "The entityType constraint in the options should have been " +
            "modified so that a custom module is used that expects entity instances to be in a collection matching " +
            "the lower-case representation of the entity type name, as opposed to the DHF default of the collection " +
            "being the same value as the entity type name");
        assertEquals("/person1990.json", response.getMatchResults()[0].getUri());
        assertEquals("/person1991.json", response.getMatchResults()[1].getUri());

        FacetResult statusFacet = response.getFacetResult("Person.status");
        assertEquals("Person.status", statusFacet.getName());
        assertEquals(1, statusFacet.getFacetValues().length, "Expecting the status value to be returned; this ensures " +
            "that both the database indexes and the range constraints were modified to conform to the project-specific path " +
            "of /customEnvelope/Person/status/value instead of assuming the ES-specific path");
        assertEquals("Active", statusFacet.getFacetValues()[0].getName());
        assertEquals(2, statusFacet.getFacetValues()[0].getCount());

        response = searchWithCriteria("entityType:Person sort:Person_birthYearDescending");
        assertEquals(2, response.getTotalResults());
        assertEquals("/person1991.json", response.getMatchResults()[0].getUri());
        assertEquals("/person1990.json", response.getMatchResults()[1].getUri());

        assertEquals(1, searchWithCriteria("entityType:Person Jane").getTotalResults());
        assertEquals(0, searchWithCriteria("entityType:Person aTermThatDoesntMatchAnything").getTotalResults());
        assertEquals(0, searchWithCriteria("entityType:Unknown").getTotalResults());
        assertEquals(0, searchWithCriteria("entityType:").getTotalResults());
    }

    private SearchHandle searchWithCriteria(String criteria) {
        QueryManager mgr = getHubClient().getFinalClient().newQueryManager();
        QueryDefinition query = mgr.newStringDefinition("exp-final-entity-options").withCriteria(criteria);
        return mgr.search(query, new SearchHandle());
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
}
