package com.marklogic.hub.dhs.installer.command;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.resource.security.AmpManager;
import com.marklogic.mgmt.resource.security.PrivilegeManager;
import com.marklogic.mgmt.resource.triggers.TriggerManager;
import com.marklogic.rest.util.Fragment;
import com.marklogic.rest.util.ResourcesFragment;
import org.springframework.util.Assert;

import java.util.List;
import java.util.stream.Stream;

/**
 * Contains verifications that are common to either a local or DHS installation of DHF.
 */
public abstract class AbstractVerifyCommand extends AbstractInstallerCommand {

    protected String[] getDhfUserNames() {
        return new String[]{"flow-developer", "flow-operator"};
    }

    protected void verifyPrivileges() {
        ResourcesFragment privileges = new PrivilegeManager(hubConfig.getManageClient()).getAsXml();
        for (String privilege : new String[]{"dhf-internal-data-hub", "dhf-internal-entities",
            "dhf-internal-mappings", "dhf-internal-trace-ui"}) {
            verify(privileges.resourceExists(privilege), "Expected privilege to have been created: " + privilege);
        }
    }

    protected void verifyAmps() {
        AmpManager ampManager = new AmpManager(hubConfig.getManageClient());
        List<String> ampNames = ampManager.getAsXml().getListItemNameRefs();
        Stream.of("updateJob", "map-to-xml", "construct-type", "locked-uris", "post-bulk-documents",
            "do-refresh-extension-metadata", "xdmp-add-response-header", "xdmp-add-response-header").forEach(name -> {
            verify(ampNames.contains(name), "Expected amp to have been created: " + name);
        });
    }

    protected void verifyJobDatabase() {
        Fragment db = new DatabaseManager(hubConfig.getManageClient()).getPropertiesAsXml("data-hub-JOBS");

        verifyLexiconsAndTripleIndexAreEnabled(db);

        final String[] expectedLocalNames = {"jobId", "jobName", "flow", "startTime",
            "endTime", "timeStarted", "timeEnded", "status", "entityName", "flowName", "flowType"};
        for (String name : expectedLocalNames) {
            verify(
                db.elementExists(format("/node()/m:range-element-indexes/m:range-element-index[m:localname = '%s']", name)),
                "Expected range element index to have been created with name: " + name
            );
        }

        final String[] expectedPathIndexes = {"/trace/hasError", "/trace/flowType", "/trace/jobId",
            "/trace/traceId", "/trace/identifier", "/trace/created"};
        for (String path : expectedPathIndexes) {
            verify(
                db.elementExists(format("/node()/m:range-path-indexes/m:range-path-index[m:path-expression = '%s']", path)),
                "Expected range path index to have been created with path: " + path
            );
        }

        verifyDatahubCreatedOnFieldExists(db);
    }

    protected void verifyStagingDatabase() {
        Fragment db = new DatabaseManager(hubConfig.getManageClient()).getPropertiesAsXml("data-hub-STAGING");
        verifyLexiconsAndTripleIndexAreEnabled(db);
        verifyDatahubCreatedOnFieldExists(db);
        verifyDatahubCreatedByFieldsExist(db);
    }

    protected void verifyFinalDatabase() {
        Fragment db = new DatabaseManager(hubConfig.getManageClient()).getPropertiesAsXml("data-hub-FINAL");
        verifyLexiconsAndTripleIndexAreEnabled(db);
        verifyDatahubCreatedOnFieldExists(db);
        verifyDatahubCreatedByFieldsExist(db);
    }

    protected void verifyDatahubCreatedByFieldsExist(Fragment db) {
        final String dbName = db.getElementValue("/node()/m:database-name");
        verify(db.elementExists("/node()/m:fields/m:field[m:field-name = 'datahubCreatedByJob']"),
            format("Expected field to have been created on database '%s' with name: datahubCreatedByJob", dbName));
        verify(db.elementExists("/node()/m:fields/m:field[m:field-name = 'datahubCreatedByStep']"),
            format("Expected field to have been created on database '%s' with name: datahubCreatedByStep", dbName));
    }

    protected void verifyLexiconsAndTripleIndexAreEnabled(Fragment db) {
        final String dbName = db.getElementValue("/node()/m:database-name");
        verify(db.elementExists("/node()/m:collection-lexicon[. = 'true']"),
            format("Expecting the collection lexicon to be enabled on database '%s'", dbName));
        verify(db.elementExists("/node()/m:uri-lexicon[. = 'true']"),
            format("Expecting the URI lexicon to be enabled on database '%s'", dbName));
        verify(db.elementExists("/node()/m:triple-index[. = 'true']"),
            format("Expecting the triple index to be enabled on database '%s'", dbName));
    }

    protected void verifyDatahubCreatedOnFieldExists(Fragment db) {
        final String dbName = db.getElementValue("/node()/m:database-name");
        verify(db.elementExists("/node()/m:fields/m:field[m:field-name = 'datahubCreatedOn']"),
            format("Expected field to have been created on database '%s' with name: datahubCreatedOn", dbName));
        verify(db.elementExists("/node()/m:range-field-indexes/m:range-field-index[m:field-name = 'datahubCreatedOn']"),
            format("Expected range field index to have been created on database '%s' with name: datahubCreatedOn", dbName));
    }

    protected void verifyTriggers() {
        for (String triggersDatabaseName : new String[]{"data-hub-final-TRIGGERS", "data-hub-staging-TRIGGERS"}) {
            ResourcesFragment triggers = new TriggerManager(hubConfig.getManageClient(), triggersDatabaseName).getAsXml();
            for (String trigger : new String[]{"ml-dh-entity-create", "ml-dh-entity-delete", "ml-dh-entity-modify",
                "ml-dh-entity-validate-create", "ml-dh-entity-validate-modify",
                    "ml-dh-draft-entity-validate-create", "ml-dh-draft-entity-validate-modify"}) {
                verify(triggers.resourceExists(trigger), "Expected trigger to be created in " + triggersDatabaseName + ": " + trigger);
            }
        }
    }

    protected void verifyStagingServer(String groupName) {
        verifyRewriterAndErrorHandler(new ServerManager(hubConfig.getManageClient(), groupName).getPropertiesAsXml("data-hub-STAGING"),
            "/data-hub/5/rest-api/staging-rewriter.xml",
            "/MarkLogic/rest-api/error-handler.xqy"
        );
    }

    protected void verifyFinalServer(String groupName) {
        verifyRewriterAndErrorHandler(new ServerManager(hubConfig.getManageClient(), groupName).getPropertiesAsXml("data-hub-FINAL"),
            "/MarkLogic/rest-api/rewriter.xml",
            "/MarkLogic/rest-api/error-handler.xqy"
        );
    }

    protected void verifyRewriterAndErrorHandler(Fragment server, String rewriter, String errorHandler) {
        final String serverName = server.getElementValue("/node()/m:server-name");
        verify(
            server.elementExists(format("/node()[m:error-handler = '%s']", errorHandler)),
            format("Expected server '%s' to use error handler: %s", serverName, errorHandler)
        );
        verify(
            server.elementExists(format("/node()[m:url-rewriter = '%s']", rewriter)),
            format("Expected server '%s' to use rewriter: %s", serverName, rewriter)
        );
    }

    protected void verifyArtifacts() {
        verifyArtifacts(hubConfig.newStagingClient());
        verifyArtifacts(hubConfig.newFinalClient());
    }

    protected void verifyArtifacts(DatabaseClient client) {
        final String dbName = client.getDatabase();
        try {
            GenericDocumentManager mgr = client.newDocumentManager();

            final String[] expectedUris = new String[]{"/flows/default-ingestion.flow.json", "/flows/default-map-and-master.flow.json",
                "/flows/default-mapping.flow.json", "/flows/default-mastering.flow.json",
                "/step-definitions/ingestion/marklogic/default-ingestion.step.json",
                "/step-definitions/mapping/marklogic/default-mapping.step.json",
                "/step-definitions/mastering/marklogic/default-mastering.step.json"};
            for (String uri : expectedUris) {
                verify(mgr.exists(uri) != null, format("Expected URI '%s' to be in database '%s'", uri, dbName));
            }
        } finally {
            client.release();
        }
    }

    protected void verify(boolean expression, String message) {
        Assert.isTrue(expression, message);
        logger.info("Verified: " + message);
    }
}
