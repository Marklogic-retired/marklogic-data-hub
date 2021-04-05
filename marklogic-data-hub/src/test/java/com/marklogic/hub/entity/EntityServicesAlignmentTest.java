package com.marklogic.hub.entity;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.expression.PlanBuilder;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.row.RowManager;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.FinishHubDeploymentCommand;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class EntityServicesAlignmentTest extends AbstractHubCoreTest {

    private static final String TDE_COLLECTION = "http://marklogic.com/xdmp/tde";

    @BeforeEach
    public void deployTemplates() {
        new FinishHubDeploymentCommand(getHubConfig()).execute(newCommandContext());
    }

    @Test
    public void testDeployTDEWithNoEntities() {
        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, TDE_COLLECTION), "The hub default jobs TDE exists");
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, TDE_COLLECTION), "The hub default jobs TDE exists");

        installUserModules(getHubConfig(), true);

        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, TDE_COLLECTION), "The hub default jobs TDE exists");
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, TDE_COLLECTION), "The hub default jobs TDE exists");
    }

    @Test
    public void testDeployTDE() throws Exception {
        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, TDE_COLLECTION), "The hub default jobs TDE exists");
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, TDE_COLLECTION), "The hub default jobs TDE exists");

        installProjectInFolder("es-alignment-test");

        assertEquals(2, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, TDE_COLLECTION), "The hub default jobs TDE exists");
        assertEquals(2, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, TDE_COLLECTION), "The hub default jobs TDE exists");


        runAsFlowOperator();
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
