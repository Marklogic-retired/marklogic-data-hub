package com.marklogic.hub.oneui.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.oneui.Application;
import com.marklogic.hub.oneui.TestHelper;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.models.SJSSearchQuery;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.EXECUTE;
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.READ;
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.UPDATE;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {Application.class})
class MapSearchManagerTest {
    @Autowired
    private MapSearchManager mapSearchManager;
    @Autowired
    private HubConfigSession hubConfigSession;
    @Autowired
    TestHelper testHelper;

    @BeforeEach
    void before() {
        testHelper.authenticateSession();
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("UrisOnly");
        meta.getPermissions().add("data-hub-developer", READ, UPDATE, EXECUTE);
       testHelper.addStagingDoc("/employee2.json", meta, "input/employee2.json");
    }

    @AfterEach
    void after() {
        testHelper.clearDatabases(hubConfigSession.getDbName(DatabaseKind.STAGING));
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
        query.database = hubConfigSession.getDbName(DatabaseKind.STAGING);
        query.sourceQuery = "cts.collectionQuery('UrisOnly')";
        query.count = 1;
        query.urisOnly = urisOnly;
        JsonNode resp = mapSearchManager.sjsSearch(query).get(0);
        String uri =resp.get("uri").asText();
        Assertions.assertEquals("/employee2.json", uri);

        if(urisOnly){
            Assertions.assertNull(resp.get("docs"));
        }
        else {
            Assertions.assertNotNull(resp.get("docs"));
        }
    }
}
