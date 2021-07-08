package com.marklogic.hub.impl;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

class ClearUserSchemasTest extends AbstractHubCoreTest {

    @BeforeEach
    void setUp() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        installReferenceModelProject();
    }

    @Test
    void clearUserSchemas() {
        try{
            runAsDataHubOperator();
            new DataHubImpl(getHubConfig()).clearUserSchemas();
            fail("'data-hub-operator' should not be able delete user schemas");
        }
        catch (FailedRequestException e){
            assertTrue(e.getMessage().contains("Permission denied"));
            logger.info("'data-hub-operator' cannot delete user schemas");
        }
        runAsDataHubDeveloper();
        assertEquals(2, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/entity-services/models"));
        assertEquals(2, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/entity-services/models"));

        new DataHubImpl(getHubConfig()).clearUserSchemas();

        DatabaseClient stagingSchemasClient = getClientByName(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
        DatabaseClient finalSchemasClient = getClientByName(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);

        assertEquals(0 , getDocumentCount(stagingSchemasClient));
        assertEquals(0 , getDocumentCount(finalSchemasClient));
    }
}
