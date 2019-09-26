package com.marklogic.hub.cli.command;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.mgmt.api.security.Amp;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.resource.security.AmpManager;
import com.marklogic.mgmt.resource.security.PrivilegeManager;
import com.marklogic.mgmt.resource.triggers.TriggerManager;
import com.marklogic.rest.util.Fragment;
import com.marklogic.rest.util.ResourcesFragment;
import org.springframework.util.Assert;

/**
 * Contains verifications that are common to either a local or DHS installation of DHF.
 */
public abstract class AbstractVerifyCommand extends AbstractInstallerCommand {

    protected String[] getDhfRoleNames() {
        return new String[]{"flow-developer-role", "flow-operator-role", "data-hub-admin-role"};
    }

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
        // For amps - just spot-checking a couple of them
        AmpManager ampManager = new AmpManager(hubConfig.getManageClient());
        Amp firstAmp = new Amp();
        firstAmp.setLocalName("map-to-xml");
        firstAmp.setModulesDatabase(hubConfig.getAppConfig().getModulesDatabaseName());
        firstAmp.setDocumentUri("/com.marklogic.smart-mastering/survivorship/merging/base.xqy");
        firstAmp.setNamespace("http://marklogic.com/smart-mastering/survivorship/merging");
        Amp lastAmp = new Amp();
        lastAmp.setLocalName("construct-type");
        lastAmp.setDocumentUri("/com.marklogic.smart-mastering/survivorship/merging/base.xqy");
        lastAmp.setModulesDatabase(hubConfig.getAppConfig().getModulesDatabaseName());
        lastAmp.setNamespace("http://marklogic.com/smart-mastering/survivorship/merging");
        for (Amp amp : new Amp[]{firstAmp, lastAmp}) {
            verify(ampManager.ampExists(amp.getJson()), "Expected amp to have been created: " + amp.getJson());
        }
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
                "ml-dh-entity-validate-create", "ml-dh-entity-validate-modify"}) {
                verify(triggers.resourceExists(trigger), "Expected trigger to be created in " + triggersDatabaseName + ": " + trigger);
            }
        }
    }

    protected void verifyStagingServer(String groupName) {
        final String version = getServerMajorVersion();
        verifyRewriterAndErrorHandler(new ServerManager(hubConfig.getManageClient(), groupName).getPropertiesAsXml("data-hub-STAGING"),
            format("/data-hub/5/rest-api/rewriter/%s-rewriter.xml", version),
            "/MarkLogic/rest-api/error-handler.xqy"
        );
    }

    protected void verifyFinalServer(String groupName) {
        verifyRewriterAndErrorHandler(new ServerManager(hubConfig.getManageClient(), groupName).getPropertiesAsXml("data-hub-FINAL"),
            "/MarkLogic/rest-api/rewriter.xml",
            "/MarkLogic/rest-api/error-handler.xqy"
        );
    }

    protected void verifyJobServer(String groupName) {
        final String version = getServerMajorVersion();
        verifyRewriterAndErrorHandler(new ServerManager(hubConfig.getManageClient(), groupName).getPropertiesAsXml("data-hub-JOBS"),
            format("/data-hub/5/tracing/%s-tracing-rewriter.xml", version),
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
