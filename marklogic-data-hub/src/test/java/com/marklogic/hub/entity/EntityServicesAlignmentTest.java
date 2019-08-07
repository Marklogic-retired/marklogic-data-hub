package com.marklogic.hub.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.expression.PlanBuilder;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.row.RowManager;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.HubModuleManager;
import org.junit.jupiter.api.Assumptions;
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
import java.util.HashMap;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*;
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

    private void installInvalidEntities(GenericDocumentManager docMgr) {
        HashMap<String, String> entities = new HashMap<>();
        entities.put("/entities/bug38858.entity.json","es-alignment-test/invalid/bug38858.json");
        entities.put("/entities/invalid-bad-datatype.entity.json","es-alignment-test/invalid/invalid-bad-datatype.json");
        entities.put("/entities/invalid-bug38353.entity.json","es-alignment-test/invalid/invalid-bug38353.json");
        entities.put("/entities/invalid-bug40766.entity.json","es-alignment-test/invalid/invalid-bug40766.json");
        entities.put("/entities/invalid-bug40904.entity.json","es-alignment-test/invalid/invalid-bug40904.json");
        entities.put("/entities/invalid-bug43212.entity.json","es-alignment-test/invalid/invalid-bug43212.json");
        entities.put("/entities/invalid-casesensitive-datatype.entity.json","es-alignment-test/invalid/invalid-casesensitive-datatype.json");
        entities.put("/entities/invalid-datatype-ref-together.entity.json","es-alignment-test/invalid/invalid-datatype-ref-together.json");
        entities.put("/entities/invalid-db-prop-rangeindex.entity.json","es-alignment-test/invalid/invalid-db-prop-rangeindex.json");
        entities.put("/entities/invalid-definitions-empty.entity.json","es-alignment-test/invalid/invalid-definitions-empty.json");
        entities.put("/entities/invalid-info-notobject.entity.json","es-alignment-test/invalid/invalid-info-notobject.json");
        entities.put("/entities/invalid-missing-datatype.entity.json","es-alignment-test/invalid/invalid-missing-datatype.json");
        entities.put("/entities/invalid-missing-definitions.entity.json","es-alignment-test/invalid/invalid-missing-definitions.json");
        entities.put("/entities/invalid-missing-info.entity.json","es-alignment-test/invalid/invalid-missing-info.json");
        entities.put("/entities/invalid-missing-title.entity.json","es-alignment-test/invalid/invalid-missing-title.json");
        entities.put("/entities/invalid-missing-version.entity.json","es-alignment-test/invalid/invalid-missing-version.json");
        entities.put("/entities/invalid-multiple-pkey.entity.json","es-alignment-test/invalid/invalid-multiple-pkey.json");
        entities.put("/entities/invalid-no-prefix.entity.json","es-alignment-test/invalid/invalid-no-prefix.json");
        entities.put("/entities/invalid-no-uri.entity.json","es-alignment-test/invalid/invalid-no-uri.json");
        entities.put("/entities/invalid-primary-key-as-ref.entity.json","es-alignment-test/invalid/invalid-primary-key-as-ref.json");
        entities.put("/entities/invalid-range-index.entity.json","es-alignment-test/invalid/invalid-range-index.json");
        entities.put("/entities/invalid-required.entity.json","es-alignment-test/invalid/invalid-required.json");
        entities.put("/entities/invalid-same-nsURI.entity.json","es-alignment-test/invalid/invalid-same-nsURI.json");
        entities.put("/entities/invalid-same-prefix.entity.json","es-alignment-test/invalid/invalid-same-prefix.json");
        entities.put("/entities/invalid-title-whiteSpace.entity.json","es-alignment-test/invalid/invalid-title-whiteSpace.json");
        entities.put("/entities/invalid-uri.entity.json","es-alignment-test/invalid/invalid-uri.json");
        entities.put("/entities/no-primary-required.entity.json","es-alignment-test/invalid/no-primary-required.json");
        entities.put("/entities/no-primary-yes-required.entity.json","es-alignment-test/invalid/no-primary-yes-required.json");

        DocumentWriteSet writeSet = docMgr.newWriteSet();
        entities.forEach((String path, String localPath) -> {
            System.out.println("VERIFYING ENTITY: "+ path.toUpperCase());
            InputStreamHandle handle = new InputStreamHandle(HubTestBase.class.getClassLoader().getResourceAsStream(localPath));
            DocumentMetadataHandle meta = new DocumentMetadataHandle()
                .withPermission(getDataHubAdminConfig().getFlowOperatorRoleName(), DocumentMetadataHandle.Capability.EXECUTE, UPDATE, READ)
                .withCollections("http://marklogic.com/entity-services/models");
            writeSet.add(path, meta, handle);

            try{
                docMgr.write(writeSet);
            } catch (FailedRequestException e) {
                System.out.println(e.getMessage());
            }
            writeSet.clear();
        });

    }

    private HubModuleManager getPropsMgr() {
        String timestampFile = getDataHubAdminConfig().getHubProject().getUserModulesDeployTimestampFile();
        return new HubModuleManager(timestampFile);
    }

    @Test
    public void testValidateBaseUri() {
        Assumptions.assumeFalse(getDataHubAdminConfig().getIsProvisionedEnvironment());
        String schema = "xdmp:unquote('{type: \"object\", properties: {\"baseUri\":{type:\"string\", " +
                                                                    "format:\"uri\"}}, required: [\"baseUri\"]}')";
        String mode = "'strict'";
        String[] results = new String[5];
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode testInfos = mapper.createObjectNode();
        testInfos.put("1","object-node{'title': 'entity'}");
        testInfos.put("2","object-node{'baseUri': 'http:/example'}");
        testInfos.put("3","object-node{'baseUri': 'http//example'}");
        testInfos.put("4","object-node{'baseUri': 'http://example'}");
        testInfos.put("5","object-node{'baseUri': 'htt://example'}");

        for(int i=1;i<=testInfos.size();i++) {
            String j = Integer.toString(i);
            String query = "xdmp:json-validate-node(" + testInfos.get(j).asText() + "," + schema + "," + mode + ")";
            try {
                EvalResultIterator resultIter = stagingClient.newServerEval().xquery(query).eval();
                if (resultIter.hasNext()) {
                    results[i-1] = resultIter.next().getString();
                }
            } catch (FailedRequestException e) {
                results[i-1] = e.getMessage();
            }
        }

        assertTrue(results[0].contains("XDMP-JSVALIDATEMISSING: Missing property: Required baseUri property not found"),"Expected Missing property, got "+results[0]);
        assertTrue(results[1].contains("XDMP-JSVALIDATEINVFORMAT: Invalid node value: Node value is not valid per format uri"),"Expected Invalid node value, got "+results[1]);
        assertTrue(results[2].contains("XDMP-JSVALIDATEINVFORMAT: Invalid node value: Node value is not valid per format uri"),"Expected Invalid node value, got "+results[2]);
        assertTrue(results[3].contains("{\"baseUri\":\"http://example\"}"),"Expected {\"baseUri\":\"http://example\"}, got "+results[3]);
        assertTrue(results[4].contains("{\"baseUri\":\"htt://example\"}"),"Expected {\"baseUri\":\"htt://example\"}, got "+results[4]);

    }

    @Test
    public void testInvalidEntity() {
        Assumptions.assumeFalse(getDataHubAdminConfig().getIsProvisionedEnvironment());

        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());

        installInvalidEntities(stagingDocMgr);
        installInvalidEntities(finalDocMgr);

        assertEquals(2, getStagingDocCount());
        assertEquals(2, getFinalDocCount());

    }

    @Test
    public void testDeployTDEWithNoEntities() {
        getDataHub().clearDatabase(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);
        getDataHub().clearDatabase(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);

        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        installUserModules(getDataHubAdminConfig(), true);

        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));
    }

    @Test
    public void testDeployTDE() throws Exception {
        Assumptions.assumeFalse(getDataHubAdminConfig().getIsProvisionedEnvironment());
        installEntities();

        getDataHub().clearDatabase(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        getDataHub().clearDatabase(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        installUserModules(getDataHubAdminConfig(), true);

        // Adding sleep to give the server enough time to act on triggers in both staging and final databases.
        Thread.sleep(1000);

        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

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
