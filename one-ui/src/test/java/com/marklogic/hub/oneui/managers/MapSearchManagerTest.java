package com.marklogic.hub.oneui.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.oneui.AbstractOneUiTest;
import com.marklogic.hub.oneui.models.SJSSearchQuery;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class MapSearchManagerTest extends AbstractOneUiTest {

    @Autowired
    MapSearchManager mapSearchManager;

    @BeforeEach
    void before() {
        addStagingDoc("input/employee2.json", "/employee2.json", "UrisOnly");
    }

    @Test
    void sjsSearchUrisOnly() {
        sjsSearch(true);
    }

    @Test
    void sjsSearchWithDoc() {
        sjsSearch(false);
    }

    private void sjsSearch(boolean urisOnly) {
        SJSSearchQuery query = new SJSSearchQuery();
        query.database = hubConfig.getDbName(DatabaseKind.STAGING);
        query.sourceQuery = "cts.collectionQuery('UrisOnly')";
        query.count = 1;
        query.urisOnly = urisOnly;
        JsonNode resp = mapSearchManager.sjsSearch(query).get(0);
        String uri = resp.get("uri").asText();
        Assertions.assertEquals("/employee2.json", uri);

        if (urisOnly) {
            Assertions.assertNull(resp.get("docs"));
        } else {
            Assertions.assertNotNull(resp.get("docs"));
        }
    }
}
