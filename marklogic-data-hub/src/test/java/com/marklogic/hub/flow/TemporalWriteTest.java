package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.temporal.DeployTemporalAxesCommand;
import com.marklogic.appdeployer.command.temporal.DeployTemporalCollectionsCommand;
import com.marklogic.client.dataservices.InputCaller;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.*;

import java.util.ArrayList;
import java.util.List;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TemporalWriteTest extends AbstractHubCoreTest {

    @BeforeEach
    void setUp() {
        // In theory, a data-hub-developer should be able to deploy these temporal resources. But when run in the
        // full suite, this test sometimes fails, presumably due to changes made by a previous test to the databases.
        // Since the purpose of this test is to verify that temporal documents can be written as an operator and not
        // to verify that a developer can deploy these things (we have other tests for that), admin is used here
        runAsAdmin();
        installProjectInFolder("test-projects/temporal-test");
        addFieldAndIndexes();
        CommandContext context = newCommandContext();
        new DeployTemporalAxesCommand().execute(context);
        new DeployTemporalCollectionsCommand().execute(context);

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("testTemporal");
        meta.getPermissions().add("data-hub-common", READ, UPDATE, EXECUTE);
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode sourceNode = mapper.createObjectNode();
        sourceNode.put("content", "v1-content");
        getHubClient().getStagingClient().newJSONDocumentManager().write("/test.json", meta, new JacksonHandle(sourceNode));
    }

    @AfterEach
    void tearDown(){
        runAsAdmin();
        removeIndexesAndFields();
        new DatabaseManager(getHubConfig().getManageClient()).clearDatabase(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
    }

    @Test
    void writeTemporalFile() {
        final String flowName = "temporal-test";
        runAsDataHubOperator();
        runFlow(new FlowInputs(flowName));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "temporal/test"));
        String updateTemporalDoc = "var temporal = require('/MarkLogic/temporal.xqy');\n" +
            "var root ={'envelope':{'headers':{}, 'triples':[], 'instance':{'content':'v2-content'}, 'attachments':null}};\n" +
            "declareUpdate();\n" +
            "temporal.documentInsert('temporal/test', '/temporal/ingestion/test.json', root, {permissions : [xdmp.permission('data-hub-common', 'read'),xdmp.permission('data-hub-common', 'update')]});";

        try{
            runAsDataHubOperator().getStagingClient().newServerEval().javascript(updateTemporalDoc).eval();
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
            runAsDataHubOperator().getStagingClient().newServerEval().javascript(deleteTemporalDoc).eval();
        }
        catch (Exception e){
            logger.error("Document deletion failed: ", e);
            Assertions.fail("dh-operator should be able to delete the document");
        }
    }

    @Test
    void ingestDocWithTemporalCollection() {
        String collections = "fruits,stuff,temporal/test";
        ObjectNode endpointConstants = objectMapper.createObjectNode();
        endpointConstants.put("uriprefix", "/bulkJavaTest/");
        endpointConstants.put("collections", collections);

        /**
         * Because the endpoint and the Spark connector must work on 5.2.x, the endpoint cannot rely on hub-temporal.sjs,
         * which does not exist in 5.2.x. So this test depends on the user having the temporal-admin role, which is the
         * only way that temporal documents can be inserted by a DHF user prior to 5.2.x.
         */
        runAsTestUserWithRoles("data-hub-operator", "temporal-admin");

        InputCaller<String> endpoint = InputCaller.on(
            getHubClient().getStagingClient(),
            getHubClient().getModulesClient().newTextDocumentManager()
                .read("/marklogic-data-hub-spark-connector/writeRecords.api", new StringHandle()),
            new StringHandle().withFormat(Format.JSON)
        );
        InputCaller.BulkInputCaller<String> bulkInputCaller = endpoint.bulkCaller(endpoint.newCallContext()
            .withEndpointConstants(new JacksonHandle(endpointConstants)));

        List<String> input = new ArrayList<>();
        input.add("{\"fruitName\":\"pineapple\", \"fruitColor\":\"green\"}");

        input.forEach(bulkInputCaller::accept);
        bulkInputCaller.awaitCompletion();

        DocumentMetadataHandle metadata = getDocumentMetadata();
        assertEquals(collections.split(",").length + 2, metadata.getCollections().size(), "documents inserted via temporal collection has 2 new collections 'latest and uri'");
        assertTrue(metadata.getCollections().contains("fruits"));
        assertTrue(metadata.getCollections().contains("stuff"));
        assertTrue(metadata.getCollections().contains("temporal/test"));
        assertTrue(metadata.getCollections().contains("latest"), "As the document is in Lastest collection, temporal/test was recognized as a temporal collection and document was invserted via temporal insert");


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
        getHubConfig().newStagingClient().newServerEval().javascript(indexesDeletion).eval();
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
        new DatabaseManager(getHubConfig().getManageClient()).save(newNode.toString());
    }

    private DocumentMetadataHandle getDocumentMetadata() {
        String[] uris = getHubClient().getStagingClient().newServerEval()
            .javascript("cts.uris(null, null, cts.collectionQuery('fruits'))")
            .evalAs(String.class).split("\n");
        assertTrue(uris.length > 0, "Expected at least one fruit URI, found zero");
        return getHubClient().getStagingClient().newDocumentManager().readMetadata(uris[0], new DocumentMetadataHandle());
    }


}
