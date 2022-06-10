package com.marklogic.hub.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.hubcentral.AllArtifactsProject;
import com.marklogic.hub.deploy.commands.LoadHubArtifactsCommand;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;


public class ClearUserDataTest extends AbstractHubCoreTest {

    private AllArtifactsProject project;

    private final static String CUSTOMER_DOC = "{\n" +
      "\t\"envelope\": {\n" +
      "\t\t\"instance\": {\n" +
      "\t\t\t\"id\": \"10260\",\n" +
      "\t\t\t\"Order\": \"123\"\n" +
      "\t\t},\n" +
      "\t\t\"attachments\": null\n" +
      "\t}\n" +
      "}";

    @BeforeEach
    void beforeEach() {
        runAsAdmin();
        installProjectInFolder("test-projects/all-artifacts");
    }

    @AfterEach
    void loadHubArtifactsInCaseAnythingWentWrongAndTheyreNoLongerThere() {
        runAsAdmin();
        new LoadHubArtifactsCommand(getHubConfig()).execute(null);
    }

    /**
     * Reuses assertions from AllArtifactsProject so we can be sure that all the user artifacts are present after the clear
     * is completed. This is done by verifying the downloaded zip before and after the clear.
     */
    @Test
    void test() {
        if (!isVersionCompatibleWith520Roles()) {
            return;
        }

        runAsDataHubOperator();
        addTestData();

        // Get counts as an admin so we can verify these after the clear
        runAsAdmin();
        int[] documentCountsBeforeClear = getDatabaseCounts();

        // Verify the download first
        runAsTestUserWithRoles("hub-central-downloader");
        project = new AllArtifactsProject(getHubClient());
        project.writeHubCentralFilesToZipFile();
        project.verifyZipArtifacts();

        //Now clear a collection in Final
        runAsTestUserWithRoles("hub-central-clear-user-data");
        new DataHubImpl(getHubClient()).clearUserData("data-hub-FINAL", "Customer");

        runAsAdmin();
        assertEquals(documentCountsBeforeClear[1] - 1, getDocumentCount(getHubClient().getFinalClient()),
        "Expecting final database to have only one document extra.");

        // Now clear all the data
        runAsTestUserWithRoles("hub-central-clear-user-data");
        new DataHubImpl(getHubClient()).clearUserData(null, null);

        // And verify that the artifacts are back
        runAsAdmin();
        int[] documentCountsAfterRestore = getDatabaseCounts();

        assertEquals(documentCountsBeforeClear[0] - 2, documentCountsAfterRestore[0], "There should be two " +
            "fewer documents than before the restore in staging; all the artifacts should be back, but not the 2 test documents we created");
        assertEquals(documentCountsBeforeClear[1] - 3, documentCountsAfterRestore[1], "There should be two " +
          "fewer documents than before the restore in final; all the artifacts should be back, but not the 2 test documents we created");
        assertEquals(documentCountsBeforeClear[2] - 2, documentCountsAfterRestore[2], "There should be two " +
          "fewer documents than before the restore in jobs; all the artifacts should be back, but not the 2 test documents we created");

        assertEquals(0, documentCountsAfterRestore[2], "The jobs database should still be empty, since there was " +
            "nothing in that to restore");

        // And do another download and verify the zip is still correct
        runAsTestUserWithRoles("hub-central-downloader");
        project = new AllArtifactsProject(getHubClient());
        project.writeHubCentralFilesToZipFile();
        project.verifyZipArtifacts();
    }

    @Test
    void testHubCentralUiConfig() throws JsonProcessingException {
        runAsAdmin();
        int[] documentCountsBeforeInstallingConfigFile = getDatabaseCounts();

        runAsDataHubDeveloper();
        String newString = "{\"modeling\":{\"entities\":{\"Customer\":{\"graphX\":-250, \"graphY\":-82}}}}";
        ObjectMapper mapper = new ObjectMapper();
        JsonNode newNode = mapper.readTree(newString);
        JacksonHandle handle = new JacksonHandle().with(newNode);
        DocumentMetadataHandle documentMetadataHandle = new DocumentMetadataHandle()
            .withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ)
            .withPermission("hub-central-entity-model-reader", DocumentMetadataHandle.Capability.UPDATE)
            .withCollections("http://marklogic.com/hub-central/ui-config");
        getHubClient().getFinalClient().newJSONDocumentManager().write("/config/hubCentral.json", documentMetadataHandle, handle);
        getHubClient().getStagingClient().newJSONDocumentManager().write("/config/hubCentral.json", documentMetadataHandle, handle);

        runAsAdmin();
        int[] documentCountsBeforeClear = getDatabaseCounts();

        runAsTestUserWithRoles("hub-central-clear-user-data");
        new DataHubImpl(getHubClient()).clearUserData(null, null);

        runAsAdmin();
        int[] documentCountsAfterRestore = getDatabaseCounts();

        assertEquals(documentCountsBeforeInstallingConfigFile[0] + 1, documentCountsAfterRestore[0]);
        assertEquals(documentCountsBeforeInstallingConfigFile[1] + 1, documentCountsAfterRestore[1]);
        assertEquals(documentCountsBeforeClear[0], documentCountsAfterRestore[0], "All Artifacts including " +
            "/config/hubCentral.json exists after clearing user data in staging database");
        assertEquals(documentCountsBeforeClear[1], documentCountsAfterRestore[1], "All Artifacts including " +
            "/config/hubCentral.json exists after clearing user data in final database");
    }

    @Test
    void asUserWhoCantClearDatabases() {
        if (!isVersionCompatibleWith520Roles()) {
            return;
        }

        runAsTestUserWithRoles("data-hub-developer");
        try {
            new DataHubImpl(getHubClient()).clearUserData(null, null);
            fail("This should have failed because a data-hub-developer does not have the privileges for clearing a database");
        } catch (Exception e) {
            assertTrue(e instanceof HttpClientErrorException);
            HttpClientErrorException ex = (HttpClientErrorException) e;
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode(), "A 403 should have been returned because the user " +
                "does not have a privilege that allows for clearing the database");
        }
    }

    private void addTestData() {
        final DocumentMetadataHandle canReadMetadata = new DocumentMetadataHandle();
        canReadMetadata.getPermissions().add("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);

        final DocumentMetadataHandle cannotReadMetadata = new DocumentMetadataHandle();
        cannotReadMetadata.getPermissions().add("manage-admin", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);

        final StringHandle testContent = new StringHandle("{\"hello\":\"world\"}").withFormat(Format.JSON);

        int[] originalCounts = getDatabaseCounts();
        Stream.of(getHubClient().getStagingClient(), getHubClient().getFinalClient(), getHubClient().getJobsClient()).forEach(client -> {
            JSONDocumentManager mgr = client.newJSONDocumentManager();
            mgr.write("/test/canRead.json", canReadMetadata, testContent);
            mgr.write("/test/cannotRead.json", cannotReadMetadata, testContent);
        });

        int[] newCounts = getDatabaseCounts();
        for (int i = 0; i < newCounts.length; i++) {
            assertEquals(originalCounts[i] + 1, newCounts[i], "Expecting to be able to single just " +
                "1 new document, since 1 of the 2 documents was written with manage-admin permissions which this user cannot set");
        }

        getHubClient().getFinalClient().newJSONDocumentManager().write(
          "/customer/customer1.json",
          new DocumentMetadataHandle()
            .withPermission("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE)
            .withCollections("Customer"),
          new StringHandle(CUSTOMER_DOC).withFormat(Format.JSON));

        assertEquals(originalCounts[1] + 2, getDocumentCount(getHubClient().getFinalClient()),
        "Expecting final to have the new document and the extra customer document.");
    }

    private int[] getDatabaseCounts() {
        int[] counts = new int[3];
        counts[0] = getDocumentCount(getHubClient().getStagingClient());
        counts[1] = getDocumentCount(getHubClient().getFinalClient());
        counts[2] = getDocumentCount(getHubClient().getJobsClient());
        return counts;
    }

}
