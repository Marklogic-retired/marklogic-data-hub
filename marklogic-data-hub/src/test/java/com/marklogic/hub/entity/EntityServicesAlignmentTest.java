package com.marklogic.hub.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.expression.PlanBuilder;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.row.RowManager;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

public class EntityServicesAlignmentTest extends AbstractHubCoreTest {

    private static final String TDE_COLLECTION = "http://marklogic.com/xdmp/tde";
    ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void beforeEach() {
        runAsFlowDeveloper();
        getDataHub().clearDatabase(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);
        getDataHub().clearDatabase(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
    }

    @Test
    public void testDeployTDEWithNoEntities() {
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, TDE_COLLECTION));
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, TDE_COLLECTION));

        installUserModules(getDataHubAdminConfig(), true);

        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, TDE_COLLECTION));
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, TDE_COLLECTION));
    }

    @Test
    public void testDeployInvalidEntity() {
        String entity = "{\n" +
            "  \"info\": {\n" +
            "    \"title\": \"Customer\",\n" +
            "    \"version\": \"0.0.1\",\n" +
            "    \"baseUri\": \"http://example.org/\""+
            "  },\n" +
            "  \"definitions\": {\n" +
            "    \"Customer\": {\n" +
            "      \"properties\": {\n" +
            "        \"customerId\": {\n" +
            "          \"datatype\": \"integer\"\n" +
            "        },\n" +
            "        \"name\": {\n" +
            "          \"datatype\": \"string\",\n" +
            "          \"collation\": \"http://marklogic.com/collation/codepoint\"\n" +
            "        },\n" +
            "        \"shipping\": {\n" +
            "          \"datatype\": \"array\",\n" +
            "          \"items\": {\n" +
            "            \"$ref\": \"#/definitions/Address\"\n" +
            "          }\n" +
            "        }\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}";
        File entityFile = getHubProject().getHubEntitiesDir().resolve("Customer.entity.json").toFile();
        System.out.println(entity);
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(entityFile,  mapper.readTree(entity));
            installUserArtifacts();
            fail("Cannot insert invalid entity, expect an exception to be thrown");
        } catch (Exception e) {
            logger.info("Caught expected exception due to invalid entity: " + e.getMessage());
        }
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, TDE_COLLECTION));
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, TDE_COLLECTION));
    }

    @Test
    public void testDeployTDE() throws Exception {
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, TDE_COLLECTION));
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, TDE_COLLECTION));

        installProjectInFolder("es-alignment-test");

        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, TDE_COLLECTION));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, TDE_COLLECTION));

        DatabaseClient finalClient = getHubClient().getFinalClient();

        GenericDocumentManager docMgr = finalClient.newDocumentManager();
        DocumentWriteSet writeSet = docMgr.newWriteSet();
        byte[] doc1Bytes = Files.readAllBytes(Paths.get(EntityServicesAlignmentTest.class.getClassLoader()
            .getResource("es-alignment-test/Order.instance.xml").toURI()));
        String doc1Str = new String(doc1Bytes, StandardCharsets.UTF_8);
        writeSet.add("/Order.instance.xml", new StringHandle(doc1Str).withFormat(Format.XML));
        byte[] doc2Bytes = Files.readAllBytes(Paths.get(EntityServicesAlignmentTest.class.getClassLoader()
            .getResource("es-alignment-test/Order.instance.json").toURI()));
        String doc2Str = new String(doc2Bytes, StandardCharsets.UTF_8);
        writeSet.add("/Order.instance.json", new StringHandle(doc2Str).withFormat(Format.JSON));
        docMgr.write(writeSet);
        RowManager rowMgr = finalClient.newRowManager();
        PlanBuilder p = rowMgr.newPlanBuilder();

        PlanBuilder.ModifyPlan itemPlan = p.fromView("Order", "Item");
        PlanBuilder.ModifyPlan purchasedItemsPlan = p.fromView("Order", "Order_purchasedItems")
            .joinInner(itemPlan, p.on(p.viewCol("Order_purchasedItems", "id"), p.viewCol("Item", "id")));
        PlanBuilder.ModifyPlan plan = p.fromView("Order", "Order")
            .joinInner(purchasedItemsPlan, p.on(p.viewCol("Order_purchasedItems", "purchasedItems_id"), p.viewCol("Item", "id")));
        assertEquals(2, rowMgr.resultRows(plan).stream().count());
    }
}
