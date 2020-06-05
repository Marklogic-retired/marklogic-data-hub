package com.marklogic.hub.central.entities.search.impl;

import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;
import com.marklogic.rest.util.Fragment;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class EntityPropertyFacetHandlerTest extends AbstractFacetHandlerTest {

    @Test
    public void testStringRangeFacet() {
        String value = "FlowName";
        String constraintName = "createdInFlowRange";
        DocSearchQueryInfo.FacetData facetData = new DocSearchQueryInfo.FacetData();
        facetData.setStringValues(Collections.singletonList(value));
        EntityPropertyFacetHandler entityPropertyFacetHandler = new EntityPropertyFacetHandler(constraintName);
        StructuredQueryBuilder queryBuilder = new StructuredQueryBuilder();

        StructuredQueryDefinition queryDefinition = entityPropertyFacetHandler.buildQuery(facetData, queryBuilder);
        Fragment fragment = toFragment(queryDefinition);

        assertEquals(value, fragment.getElementValue("//search:value"));
        assertEquals(constraintName, fragment.getElementValue("//search:constraint-name"));
        assertEquals(StructuredQueryBuilder.Operator.EQ.toString(), fragment.getElementValue("//search:range-operator"));
    }

    @Test
    public void testNumericRangeFacet() {
        String constraintName = "rangeFacet";
        String lowerBound = "-1";
        String upperBound = "1";
        DocSearchQueryInfo.FacetData facetData = new DocSearchQueryInfo.FacetData();
        facetData.setDataType("int");
        DocSearchQueryInfo.RangeValues rangeValues = new DocSearchQueryInfo.RangeValues();
        rangeValues.setLowerBound(lowerBound);
        rangeValues.setUpperBound(upperBound);
        facetData.setRangeValues(rangeValues);
        EntityPropertyFacetHandler entityPropertyFacetHandler = new EntityPropertyFacetHandler(constraintName);
        StructuredQueryBuilder queryBuilder = new StructuredQueryBuilder();

        StructuredQueryDefinition queryDefinition = entityPropertyFacetHandler.buildQuery(facetData, queryBuilder);
        Fragment fragment = toFragment(queryDefinition);

        assertEquals(Arrays.asList(constraintName, constraintName), fragment.getElementValues("//search:constraint-name"));
        assertEquals(lowerBound, fragment.getElementValue("//search:value[../search:range-operator='GE']"));
        assertEquals(upperBound, fragment.getElementValue("//search:value[../search:range-operator='LE']"));
    }
}
