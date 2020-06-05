package com.marklogic.hub.central.entities.search.impl;

import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.central.entities.search.Constants;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;
import com.marklogic.rest.util.Fragment;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CollectionFacetHandlerTest extends AbstractFacetHandlerTest {

    @Test
    public void testCollectionFacet() {
        String uri = "myCollection";
        String constraintName = Constants.COLLECTION_CONSTRAINT_NAME;
        DocSearchQueryInfo.FacetData facetData = new DocSearchQueryInfo.FacetData();
        facetData.setStringValues(Collections.singletonList(uri));
        CollectionFacetHandler collectionFacetHandler = new CollectionFacetHandler();
        StructuredQueryBuilder queryBuilder = new StructuredQueryBuilder();

        StructuredQueryDefinition queryDefinition = collectionFacetHandler.buildQuery(facetData, queryBuilder);
        Fragment fragment = toFragment(queryDefinition);

        assertEquals(uri, fragment.getElementValue("//search:uri"));
        assertEquals(constraintName, fragment.getElementValue("//search:constraint-name"));
    }
}
