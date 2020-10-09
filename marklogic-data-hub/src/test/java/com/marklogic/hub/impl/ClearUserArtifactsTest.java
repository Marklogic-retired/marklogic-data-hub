package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.FailedRequestException;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ClearUserArtifactsTest extends AbstractHubCoreTest {
    int initialDbCount;
    @BeforeEach
    void setUp() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        initialDbCount = getDocumentCount(getHubClient().getStagingClient());
        // These 2 projects contain all kinds of user artifacts
        installProjectInFolder("test-projects/download-artifacts");
        ReferenceModelProject project = installReferenceModelProject();
        project.createRawCustomer(1, "Jane");
    }

    @Test
    void clearUserArtifacts() {
        try{
            new DataHubImpl(runAsDataHubOperator()).clearUserArtifacts();
            fail("'data-hub-operator' should not be able delete user artifacts");
        }
        catch (FailedRequestException e){
            //The complete message contains uri of artifact it deletes which could change, so just checking if the exception contains "SEC-PERMDENIED".
            assertTrue(e.getMessage().contains("Local message: failed to POST at /data-hub/5/data-services/artifacts/clearUserArtifacts.sjs: Bad Request. Server Message: SEC-PERMDENIED"));
            logger.info("'data-hub-operator' cannot delete user artifacts");
        }
        new DataHubImpl(runAsDataHubDeveloper()).clearUserArtifacts();

        assertNotNull(getHubClient().getStagingClient().newServerEval().javascript("cts.doc('/customer1.json')").evalAs(JsonNode.class));
        //The staging db will have one additional document  '/customer/1.json'
        assertEquals(initialDbCount , getDocumentCount(getHubClient().getStagingClient()) - 1);
        assertEquals(initialDbCount , getDocumentCount(getHubClient().getFinalClient()));
    }
}
