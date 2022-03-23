package com.marklogic.hub.central.entities.search.impl;

import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.central.entities.search.Constants;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;
import com.marklogic.rest.util.Fragment;
import org.jdom2.Namespace;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class StepRangeFacetHandlerTest {

    @Test
    public void testStepRangeFacet() {
        String text = "xyz-abc";
        String constraintName = Constants.RAN_STEP_WORD_CONSTRAINT_NAME;
        DocSearchQueryInfo.FacetData facetData = new DocSearchQueryInfo.FacetData();
        facetData.setStringValues(Collections.singletonList(text));
        StepRangeFacetHandler stepRangeFacetHandler = new StepRangeFacetHandler();
        StructuredQueryBuilder queryBuilder = new StructuredQueryBuilder();

        StructuredQueryDefinition queryDefinition = stepRangeFacetHandler.buildQuery(facetData, queryBuilder);
        Fragment fragment = new Fragment(queryDefinition.serialize(), Namespace.getNamespace("sch", "http://marklogic.com/appservices/search"));

        assertEquals(text, fragment.getElementValue("//sch:text"));
        assertEquals(constraintName, fragment.getElementValue("//sch:constraint-name"));
    }
}
