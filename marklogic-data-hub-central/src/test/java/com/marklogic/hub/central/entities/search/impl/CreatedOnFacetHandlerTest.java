package com.marklogic.hub.central.entities.search.impl;

import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.central.entities.search.Constants;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;
import com.marklogic.rest.util.Fragment;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CreatedOnFacetHandlerTest extends AbstractFacetHandlerTest {

    @Test
    public void testCreatedOnDateRangeFacet() {
        String constraintName = Constants.CREATED_ON_CONSTRAINT_NAME;
        String lowerBound = "2020-06-14";
        String upperBound = "2020-06-17";
        String expectedUpperBound = "2020-06-18";
        DocSearchQueryInfo.FacetData facetData = new DocSearchQueryInfo.FacetData();
        DocSearchQueryInfo.RangeValues rangeValues = new DocSearchQueryInfo.RangeValues();
        rangeValues.setLowerBound(lowerBound);
        rangeValues.setUpperBound(upperBound);
        facetData.setRangeValues(rangeValues);
        CreatedOnFacetHandler createdOnFacetHandler = new CreatedOnFacetHandler();
        StructuredQueryBuilder queryBuilder = new StructuredQueryBuilder();

        StructuredQueryDefinition queryDefinition = createdOnFacetHandler.buildQuery(facetData, queryBuilder);
        Fragment fragment = toFragment(queryDefinition);

        assertEquals(Arrays.asList(constraintName, constraintName), fragment.getElementValues("//search:constraint-name"));
        assertTrue(fragment.getElementValue("//search:value[../search:range-operator='GE']").contains(lowerBound),
                "Expected lower bound to include: " + lowerBound);
        assertTrue(fragment.getElementValue("//search:value[../search:range-operator='LT']").contains(expectedUpperBound),
                "Upper bound is one day more than what was passed in order to include the passed in date as well" +
                        " for comparison. Expected upper bound to include: " + expectedUpperBound);
    }
}
