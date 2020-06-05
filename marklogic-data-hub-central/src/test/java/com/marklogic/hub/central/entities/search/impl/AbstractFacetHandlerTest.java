package com.marklogic.hub.central.entities.search.impl;

import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.rest.util.Fragment;
import org.jdom2.Namespace;

public class AbstractFacetHandlerTest {

    protected Fragment toFragment(StructuredQueryDefinition structuredQueryDefinition) {
        return new Fragment(structuredQueryDefinition.serialize(),
                Namespace.getNamespace("search", "http://marklogic.com/appservices/search"));
    }
}
