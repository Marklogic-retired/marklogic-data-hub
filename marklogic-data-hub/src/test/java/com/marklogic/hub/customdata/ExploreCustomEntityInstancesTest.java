package com.marklogic.hub.customdata;

import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.QueryManager;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ExploreCustomEntityInstancesTest extends AbstractHubCoreTest {

    @Test
    void test() {
        installProjectInFolder("test-projects/custom-data", true);

        // Using an alternate convention for entity type collections, which allows us to verify that DHF supports
        // modifying the entityType constraint to match how the data is persisted
        final String entityCollection = "entity-Person";
        writeFinalJsonDoc("/person1.json", "{\n" +
            "  \"customEnvelope\": {\n" +
            "    \"Person\": {\n" +
            "      \"name\": {\n" +
            "        \"value\": \"Jane\",\n" +
            "        \"confirmed\": true\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}", entityCollection);

        SearchHandle response = searchWithCriteria("entityType:Person");
        assertEquals(1, response.getTotalResults(), "The entityType constraint in the options should have been " +
            "modified so that a custom module is used that expects entity instances to be in a collection matching " +
            "the lower-case representation of the entity type name, as opposed to the DHF default of the collection " +
            "being the same value as the entity type name");
        assertEquals("/person1.json", response.getMatchResults()[0].getUri());

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

}
