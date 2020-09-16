package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.web.AbstractWebTest;
import com.marklogic.hub.web.model.SJSSearchQuery;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*;

class SearchServiceTest extends AbstractWebTest {

    SearchService searchService;

    @BeforeEach
    void before() {
        searchService = new SearchService(getHubConfig());
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("UrisOnly");
        meta.getPermissions().add(getHubConfig().getFlowOperatorRoleName(), READ, UPDATE, EXECUTE);
        installStagingDoc("/employee2.json", meta, "integration-test-data/input/input-2.json");
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
        query.database = getHubClient().getDbName(DatabaseKind.STAGING);
        query.sourceQuery = "cts.collectionQuery('UrisOnly')";
        query.count = 1;
        query.urisOnly = urisOnly;
        JsonNode resp = searchService.sjsSearch(query).get(0);
        String uri =resp.get("uri").asText();
        Assertions.assertTrue(uri.equals("/employee2.json"));

        if(urisOnly){
            Assertions.assertTrue(resp.get("docs") == null);
        }
        else {
            Assertions.assertTrue(resp.get("docs") != null);
        }
    }
}
