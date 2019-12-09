package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.web.WebApplication;
import com.marklogic.hub.web.model.SJSSearchQuery;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*;
@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {WebApplication.class, ApplicationConfig.class})
class SearchServiceTest extends AbstractServiceTest {
    @Autowired
    private SearchService searchService;

    @BeforeEach
    void before() {
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("UrisOnly");
        meta.getPermissions().add(getDataHubAdminConfig().getFlowOperatorRoleName(), READ, UPDATE, EXECUTE);
        installStagingDoc("/employee2.json", meta, "integration-test-data/input/input-2.json");
    }

    @AfterEach
    void after() {
        clearDatabases(adminHubConfig.getDbName(DatabaseKind.STAGING));
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
        query.database = adminHubConfig.getDbName(DatabaseKind.STAGING);
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
