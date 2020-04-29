package com.marklogic.hub.impl;

import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.artifact.AllArtifactsProject;
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

    @BeforeEach
    void beforeEach() {
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
        runAsDataHubOperator();
        addTestData();

        // Get counts as an admin so we can verify these after the clear
        runAsAdmin();
        int[] documentCountsBeforeClear = getDatabaseCounts();

        // Verify the download first
        runAsTestUserWithRoles("hub-central-downloader");
        project = new AllArtifactsProject(getHubClient());
        project.downloadProject();
        project.verifyZipEntries();

        // Now clear the data
        runAsTestUserWithRoles("hub-central-clear-user-data");
        new DataHubImpl(getHubClient()).clearUserData();

        // And verify that the artifacts are back
        runAsAdmin();
        int[] documentCountsAfterRestore = getDatabaseCounts();
        for (int i = 0; i < 2; i++) {
            assertEquals(documentCountsBeforeClear[i] - 2, documentCountsAfterRestore[i], "There should be two " +
                "fewer documents than before the restore; all the artifacts should be back, but not the 2 test documents we created");
        }
        assertEquals(0, documentCountsAfterRestore[2], "The jobs database should still be empty, since there was " +
            "nothing in that to restore");

        // And do another download and verify the zip is still correct
        runAsTestUserWithRoles("hub-central-downloader");
        project = new AllArtifactsProject(getHubClient());
        project.downloadProject();
        project.verifyZipEntries();
    }

    @Test
    void asUserWhoCantClearDatabases() {
        runAsDataHubDeveloper();
        applyCurrentUserToManageClient();
        try {
            new DataHubImpl(getHubClient()).clearUserData();
            fail("This should have failed because a data-hub-developer does not have the privileges for clearing a database");
        } catch (Exception e) {
            assertTrue(e instanceof HttpClientErrorException);
            HttpClientErrorException ex = (HttpClientErrorException) e;
            System.out.println(ex.getMessage());
            System.out.println(ex.getResponseBodyAsString());
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
    }

    private int[] getDatabaseCounts() {
        int[] counts = new int[3];
        String query = "cts.estimate(cts.trueQuery())";
        counts[0] = Integer.parseInt(getHubClient().getStagingClient().newServerEval().javascript(query).evalAs(String.class));
        counts[1] = Integer.parseInt(getHubClient().getFinalClient().newServerEval().javascript(query).evalAs(String.class));
        counts[2] = Integer.parseInt(getHubClient().getJobsClient().newServerEval().javascript(query).evalAs(String.class));
        return counts;
    }

}
