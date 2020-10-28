package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.temporal.DeployTemporalAxesCommand;
import com.marklogic.appdeployer.command.temporal.DeployTemporalCollectionsCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class TemporalWriteTest extends HubTestBase {
    private  FlowRunner flowRunner;

    @BeforeEach
    void setUp() {
        runAsDataHubDeveloper();
        clearStagingFinalAndJobDatabases();
        installHubArtifacts(runAsDataHubDeveloper(), true);
        installProjectInFolder("test-projects/temporal-test");
        addFieldAndIndexes();
        new SimpleAppDeployer(new DeployTemporalAxesCommand(), new DeployTemporalCollectionsCommand())
            .deploy(adminHubConfig.getAppConfig());
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("testTemporal");
        meta.getPermissions().add("data-hub-operator", READ, UPDATE, EXECUTE);
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode sourceNode = mapper.createObjectNode();
        sourceNode.put("content", "v1-content");
        stagingClient.newJSONDocumentManager().write("/test.json", meta, new JacksonHandle(sourceNode));
    }

    @AfterEach
    void tearDown(){
        removeIndexesAndFields();
        new DatabaseManager(runAsAdmin().getManageClient()).clearDatabase(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
    }

    @Test
    void writeTemporalFile() {
        flowRunner = new FlowRunnerImpl(runAsDataHubOperator());
        final String flowName = "temporal-test";
        flowRunner.runFlow(new FlowInputs(flowName));
        flowRunner.awaitCompletion();
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "temporal/test"));
        String updateTemporalDoc = "var temporal = require('/MarkLogic/temporal.xqy');\n" +
            "var root ={'envelope':{'headers':{}, 'triples':[], 'instance':{'content':'v2-content'}, 'attachments':null}};\n" +
            "declareUpdate();\n" +
            "temporal.documentInsert('temporal/test', '/temporal/ingestion/test.json', root, {permissions : [xdmp.permission('data-hub-operator', 'read'),xdmp.permission('data-hub-operator', 'update')]});";

        try{
            runAsDataHubOperator().newStagingClient().newServerEval().javascript(updateTemporalDoc).eval();
        }
        catch (Exception e){
            logger.error("Document update failed: ", e);
            Assertions.fail("After the step is run, a temporal document should have been created and it's update should not fail. " +
                "If it's not a temporal document, temporal update would fail");
        }

        String deleteTemporalDoc = "var temporal = require('/MarkLogic/temporal.xqy');\n" +
            "declareUpdate();\n" +
            "temporal.documentDelete('temporal/test', '/temporal/ingestion/test.json');";

        try{
            runAsDataHubOperator().newStagingClient().newServerEval().javascript(deleteTemporalDoc).eval();
        }
        catch (Exception e){
            logger.error("Document deletion failed: ", e);
            Assertions.fail("dh-operator should be able to delete the document");
        }
    }

    private void removeIndexesAndFields() {
        String indexesDeletion = "  const admin = require('/MarkLogic/admin.xqy');\n" +
            "        var config = admin.getConfiguration();\n" +
            "        var dbid = xdmp.database('data-hub-STAGING');\n" +
            "        var rangespec1 = admin.databaseRangeFieldIndex('dateTime', 'systemStart', '', fn.false());\n" +
            "        var rangespec2 = admin.databaseRangeFieldIndex('dateTime', 'systemEnd', '', fn.false());\n" +
            "        config = admin.databaseDeleteRangeFieldIndex(config, dbid, rangespec1);\n" +
            "        config = admin.databaseDeleteRangeFieldIndex(config, dbid, rangespec2);\n" +
            "        config = admin.databaseDeleteField(config, dbid, 'systemStart');\n" +
            "        config = admin.databaseDeleteField(config, dbid, 'systemEnd');\n" +
            "        admin.saveConfigurationWithoutRestart(config);";
        runAsAdmin().newStagingClient().newServerEval().javascript(indexesDeletion).eval();
    }

    private void addFieldAndIndexes() {
        ObjectNode db = getDatabaseProperties("data-hub-STAGING");

        ObjectNode newNode = ObjectMapperFactory.getObjectMapper().createObjectNode();
        newNode.put("database-name", "data-hub-STAGING");
        newNode.set("field", db.get("field"));

        Object field = newNode.get("field");
        ObjectNode systemStart = ((ArrayNode) field).addObject();
        systemStart.put("field-name", "systemStart");
        systemStart.put("metadata", true);
        ObjectNode systemEnd = ((ArrayNode) field).addObject();
        systemEnd.put("field-name", "systemEnd");
        systemEnd.put("metadata", true);


        ArrayNode indexes;
        if (db.has("range-field-index")) {
            indexes = (ArrayNode) db.get("range-field-index");
            newNode.set("range-field-index", indexes);
        } else {
            indexes = newNode.putArray("range-field-index");
        }
        ObjectNode systemStartIndex = indexes.addObject();
        systemStartIndex.put("scalar-type", "dateTime");
        systemStartIndex.put("field-name", "systemStart");
        systemStartIndex.put("invalid-values", "reject");
        systemStartIndex.put("range-value-positions", false);

        ObjectNode systemEndIndex = indexes.addObject();
        systemEndIndex.put("scalar-type", "dateTime");
        systemEndIndex.put("field-name", "systemEnd");
        systemEndIndex.put("invalid-values", "reject");
        systemEndIndex.put("range-value-positions", false);
        new DatabaseManager(adminHubConfig.getManageClient()).save(newNode.toString());
    }
}
