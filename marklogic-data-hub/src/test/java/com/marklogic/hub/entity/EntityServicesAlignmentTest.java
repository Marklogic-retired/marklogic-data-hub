package com.marklogic.hub.entity;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.expression.PlanBuilder;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.row.RowManager;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.HubModuleManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class EntityServicesAlignmentTest extends HubTestBase {
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();

    @Autowired
    HubProject project;

    @Autowired
    HubConfig hubConfig;

    @BeforeEach
    public void clearDbs() {
        deleteProjectDir();
        basicSetup();
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);
        getDataHub().clearUserModules();
        installHubModules();
        getPropsMgr().deletePropertiesFile();
    }

    private void installEntities() {
        Path orderDir = project.getEntityDir("Order");
        orderDir.toFile().mkdirs();
        assertTrue(orderDir.toFile().exists());
        FileUtil.copy(getResourceStream("es-alignment-test/Order.entity.json"),
            orderDir.resolve("Order.entity.json").toFile());
    }

    private HubModuleManager getPropsMgr() {
        String timestampFile = getHubAdminConfig().getHubProject().getUserModulesDeployTimestampFile();
        return new HubModuleManager(timestampFile);
    }

    @Test
    public void testDeployTDEWithNoEntities() {
        getDataHub().clearDatabase(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);

        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        installUserModules(getHubAdminConfig(), true);

        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));
    }

    @Test
    public void testDeployTDE() throws Exception {
        installEntities();

        getDataHub().clearDatabase(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        installUserModules(getHubAdminConfig(), true);

        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        DatabaseClient finalClient = hubConfig.newFinalClient();

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
            .joinInner(itemPlan, p.on(p.viewCol("Order_purchasedItems","id"),p.viewCol("Item","id")));
        PlanBuilder.ModifyPlan plan = p.fromView("Order", "Order")
            .joinInner(purchasedItemsPlan, p.on(p.viewCol("Order_purchasedItems","purchasedItems_id"),p.viewCol("Item","id")));
        assertEquals(2, rowMgr.resultRows(plan).stream().count());
    }
}
