package com.marklogic.hub.cli.command;

import com.beust.jcommander.Parameters;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.cli.Options;
import com.marklogic.mgmt.resource.security.RoleManager;
import com.marklogic.mgmt.resource.security.UserManager;
import com.marklogic.rest.util.ResourcesFragment;
import org.springframework.context.ApplicationContext;

import java.util.Properties;
import java.util.Set;

@Parameters(commandDescription = "Verify a DHF installation in a DHS environment")
public class VerifyDhfInDhsCommand extends AbstractVerifyCommand {

    private static final String CURATOR = "Curator";
    private static final String EVALUATOR = "Evaluator";

    @Override
    public void run(ApplicationContext context, Options options) {
        // TODO This is hacky, need a better mechanism for building these properties post 5.0.2
        Properties props = new InstallIntoDhsCommand().buildDefaultProjectProperties();
        initializeProject(context, options, props);

        long start = System.currentTimeMillis();

        verifyDhfRolesNotCreated();
        verifyDhfUsersNotCreated();
        verifyPrivileges();
        verifyAmps();

        verifyStagingDatabase();
        verifyFinalDatabase();
        verifyJobDatabase();

        verifyTriggers();

        verifyStagingServers();
        verifyFinalServers();
        verifyJobServers();

        verifyModules();
        verifyArtifacts();

        logger.info("Time to verify: " + (System.currentTimeMillis() - start));
    }

    private void verifyDhfUsersNotCreated() {
        ResourcesFragment users = new UserManager(hubConfig.getManageClient()).getAsXml();
        for (String user : getDhfUserNames()) {
            verify(!users.resourceExists(user), "Expected DHF user to not be created since DHS manages users: " + user);
        }
    }

    private void verifyDhfRolesNotCreated() {
        ResourcesFragment roles = new RoleManager(hubConfig.getManageClient()).getAsXml();
        for (String role : getDhfRoleNames()) {
            verify(!roles.resourceExists(role), "Expected DHF role to not be created since DHS provides its own roles: " + role);
        }
    }

    private void verifyStagingServers() {
        verifyStagingServer(CURATOR);
        verifyStagingServer(EVALUATOR);
    }

    private void verifyFinalServers() {
        verifyFinalServer(CURATOR);
        verifyFinalServer(EVALUATOR);
    }

    private void verifyJobServers() {
        verifyJobServer(CURATOR);
        verifyJobServer(EVALUATOR);
    }

    private void verifyModules() {
        final int finalPort = hubConfig.getPort(DatabaseKind.FINAL);
        hubConfig.setPort(DatabaseKind.FINAL, hubConfig.getManageConfig().getPort());
        DatabaseClient client = hubConfig.newModulesDbClient();

        try {
            GenericDocumentManager documentManager = client.newDocumentManager();

            DocumentMetadataHandle metadata = documentManager.readMetadata("/com.marklogic.hub/config.sjs", new DocumentMetadataHandle());
            DocumentMetadataHandle.DocumentPermissions perms = metadata.getPermissions();

            Set<DocumentMetadataHandle.Capability> capabilities = perms.get("flowDeveloper");
            verify(capabilities.contains(DocumentMetadataHandle.Capability.READ), "Flow developer should be able to read modules");
            verify(capabilities.contains(DocumentMetadataHandle.Capability.INSERT), "Flow developer should be able to insert modules");
            verify(capabilities.contains(DocumentMetadataHandle.Capability.EXECUTE), "Flow developer should be able to execute modules");

            capabilities = perms.get("flowOperator");
            verify(capabilities.contains(DocumentMetadataHandle.Capability.READ), "Flow operator should be able to read modules");
            verify(capabilities.contains(DocumentMetadataHandle.Capability.INSERT), "Flow operator should be able to insert modules");
            verify(capabilities.contains(DocumentMetadataHandle.Capability.EXECUTE), "Flow operator should be able to execute modules");


            verifyOptionsExist(documentManager,
                "/Evaluator/data-hub-JOBS/rest-api/options/jobs.xml",
                "/Evaluator/data-hub-JOBS/rest-api/options/traces.xml",
                "/Evaluator/data-hub-STAGING/rest-api/options/default.xml",
                "/Evaluator/data-hub-FINAL/rest-api/options/default.xml",
                "/Curator/data-hub-FINAL/rest-api/options/default.xml",
                "/Curator/data-hub-JOBS/rest-api/options/jobs.xml",
                "/Curator/data-hub-JOBS/rest-api/options/traces.xml",
                "/Curator/data-hub-STAGING/rest-api/options/default.xml",
                "/Analyzer/data-hub-ANALYTICS/rest-api/options/default.xml",
                "/Analyzer/data-hub-ANALYTICS-REST/rest-api/options/default.xml",
                "/Operator/data-hub-OPERATION/rest-api/options/default.xml",
                "/Operator/data-hub-OPERATION-REST/rest-api/options/default.xml",
                "/Evaluator/data-hub-ANALYTICS/rest-api/options/default.xml",
                "/Evaluator/data-hub-OPERATION/rest-api/options/default.xml"
            );
        } finally {
            hubConfig.setPort(DatabaseKind.FINAL, finalPort);
            client.release();
        }
    }

    protected void verifyOptionsExist(GenericDocumentManager documentManager, String... expectedOptions) {
        for (String options : expectedOptions) {
            try {
                verify(documentManager.exists(options) != null, "Expected options module to exist: " + options);
            } catch (FailedRequestException ex) {
                throw new RuntimeException("Unable to find options module: " + options);
            }
        }
    }

    /**
     * This uses the Manage port to examine the final and staging databases so that it doesn't matter what group
     * the host is set to.
     */
    protected void verifyArtifacts() {
        final int finalPort = hubConfig.getPort(DatabaseKind.FINAL);
        final int stagingPort = hubConfig.getPort(DatabaseKind.STAGING);
        try {
            hubConfig.setPort(DatabaseKind.STAGING, hubConfig.getManageConfig().getPort());
            hubConfig.setPort(DatabaseKind.FINAL, hubConfig.getManageConfig().getPort());
            super.verifyArtifacts();
        } finally {
            hubConfig.setPort(DatabaseKind.STAGING, stagingPort);
            hubConfig.setPort(DatabaseKind.FINAL, finalPort);
        }
    }
}
