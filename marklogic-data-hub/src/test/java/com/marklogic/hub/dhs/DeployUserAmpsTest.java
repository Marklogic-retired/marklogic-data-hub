package com.marklogic.hub.dhs;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.DocumentManager;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Amp;
import com.marklogic.mgmt.resource.security.AmpManager;
import com.marklogic.mgmt.resource.security.RoleManager;
import com.marklogic.rest.util.ResourcesFragment;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.READ;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;


public class DeployUserAmpsTest extends AbstractHubCoreTest {

    HubClient operatorHubClient;
    HubClient adminHubClient;

    @BeforeEach
    void checkIfTestsCanBeRun() {
        MarkLogicVersion mlVersion = new MarkLogicVersion(getHubClient().getManageClient());
        assumeTrue((mlVersion.isNightly() && mlVersion.getMajor() >= 10) ||
                (mlVersion.getMajor() > 10) || (mlVersion.getMajor() == 10 && mlVersion.getMinor() >= 404)
        );
        if (operatorHubClient == null || adminHubClient == null) {
            operatorHubClient = runAsDataHubOperator();
            adminHubClient = runAsAdmin();
        }
    }

    @Test
    void createAmpWithInheritableRole() {
        writeTestModuleAndDocs();

        //query returns null in the absence of the amp
        assertFalse(fetchPiiData().hasNext());

        ResourcesFragment amps;
        try{
            //POST request
            writeAmpFileToProjectAndDeploy(HubConfig.DEFAULT_MODULES_DB_NAME, "pii-reader");
            amps = new AmpManager(runAsDataHubSecurityAdmin().getManageClient()).getAsXml();

            assertTrue(amps.resourceExists("getPiiData"));
            JacksonHandle jacksonHandle = new JacksonHandle();
            fetchPiiData().next().get(jacksonHandle);
            assertEquals("123-456-7890", jacksonHandle.get().get("ssn").asText(), "data-hub-operator should be " +
                "able to read the document since the amp has been created");


            API api =  new API(runAsAdmin().getManageClient());
            Amp amp = api.amp("getPiiData", "","/ampTest/testModule.sjs",HubConfig.DEFAULT_MODULES_DB_NAME );
            List<String> ampRoles = amp.getRole();
            Assertions.assertEquals(1, ampRoles.size());
            Assertions.assertEquals("pii-reader", ampRoles.get(0));

            //PUT request - shouldn't fail
            writeAmpFileToProjectAndDeploy(HubConfig.DEFAULT_MODULES_DB_NAME,"data-hub-developer", "pii-reader");
            api =  new API(runAsAdmin().getManageClient());
            amp = api.amp("getPiiData", "","/ampTest/testModule.sjs",HubConfig.DEFAULT_MODULES_DB_NAME );
            ampRoles = amp.getRole();
            // If server version > 10.0-4.4, PUT request should succeed, will log an error msg in case of 10.0-4.4, will fail otherwise
            MarkLogicVersion mlVersion = new MarkLogicVersion(getHubClient().getManageClient());
            if(mlVersion.isNightly() || mlVersion.getMinor() > 404){
                Collections.sort(ampRoles);
                Assertions.assertEquals(2, ampRoles.size());
                Assertions.assertEquals("data-hub-developer", ampRoles.get(0));
                Assertions.assertEquals("pii-reader", ampRoles.get(1));
            }
            else {
                //no change in the amp in case server is 10.0-4.4
                Assertions.assertEquals(1, ampRoles.size());
                Assertions.assertEquals("pii-reader", ampRoles.get(0));
            }

            /* POST/PUT request as data-hub-developer will fail in all versions as the user doesn't have "get-amp"
               privilege to first get the amps
            */
            try{
                runAsDataHubDeveloper();
                deployProject();
                Assertions.fail("'data-hub-developer' should not be able to deploy amps");
            }
            catch (Exception e){
                logger.error("'data-hub-developer' cannot deploy amps;cause: " + e.getMessage());
            }
        }
        finally {
            runAsDataHubSecurityAdmin().getManageClient().delete("/manage/v2/amps/getPiiData?namespace=&document-uri=/ampTest/testModule.sjs&modules-database=data-hub-MODULES");
            amps = new AmpManager(runAsDataHubSecurityAdmin().getManageClient()).getAsXml();
            assertFalse(amps.resourceExists("getPiiData"));
        }
    }

    @Test
    void createAmpWithCustomRole(){
        writeTestModuleAndDocs();
        //query returns null in the absence of the amp
        assertFalse(fetchPiiData().hasNext());

        //create custom role having "data-hub-developer/operator" as "data-hub-security-admin"
        ObjectNode roleNode = objectMapper.createObjectNode();
        roleNode.put("role-name", "test-custom-role");
        roleNode.set("role", objectMapper.createArrayNode().add("data-hub-developer").add("pii-reader"));
        writePayLoadToFileAndDeploy(getHubConfig().getUserSecurityDir().resolve("roles"), "customRole.json", roleNode);
        ResourcesFragment amps;
        try {
            writeAmpFileToProjectAndDeploy(HubConfig.DEFAULT_MODULES_DB_NAME,"test-custom-role");
            amps = new AmpManager(runAsDataHubSecurityAdmin().getManageClient()).getAsXml();

            assertTrue(amps.resourceExists("getPiiData"));
            JacksonHandle jacksonHandle = new JacksonHandle();
            fetchPiiData().next().get(jacksonHandle);
            assertEquals("123-456-7890", jacksonHandle.get().get("ssn").asText(), "data-hub-operator should be " +
                "able to read the document since the amp has been created");
        }
        finally {
            runAsDataHubSecurityAdmin().getManageClient().delete("/manage/v2/amps/getPiiData?namespace=&document-uri=/ampTest/testModule.sjs&modules-database=data-hub-MODULES");
            amps = new AmpManager(runAsDataHubSecurityAdmin().getManageClient()).getAsXml();
            assertFalse(amps.resourceExists("getPiiData"));
            new RoleManager(runAsAdmin().getManageClient()).delete(roleNode.toString());
        }
    }

    @Test
    void createAmpWithAdminRole() {
        try{
            writeAmpFileToProjectAndDeploy(HubConfig.DEFAULT_MODULES_DB_NAME, "qconsole-user");
            Assertions.fail("Users should not be able to create amp that assumes 'admin' role");
        }
        catch (Exception e){
            logger.error("Amp creation expected to fail as 'admin' role cannot be assumed by it");
        }
    }

    @Test
    void createAmpForModulesDbModule() {
        try{
            writeAmpFileToProjectAndDeploy("Modules", "data-hub-developer");
            Assertions.fail("Users should not be able to create amp for a module in db other than 'data-hub-MODULES'");
        }
        catch (Exception e){
            logger.error("Amp creation expected to fail as it points to a module in 'Modules' db");
        }
    }

    @Test
    void createAmpForFileSystemModule() {
        try{
            writeAmpFileToProjectAndDeploy("", "data-hub-developer");
            Assertions.fail("Users should not be able to create amp for a module in filesystem");
        }
        catch (Exception e){
            logger.error("Amp creation expected to fail as it points to a module in filesystem");
        }
    }

    private void writeAmpFileToProjectAndDeploy(String dbName, String ... roleNames) {
        writePayLoadToFileAndDeploy(getHubConfig().getUserSecurityDir().resolve("amps"), "getPiiData.json", getAmpNode(dbName, roleNames));
    }

    private ObjectNode getAmpNode(String dbName, String ... roleNames){
        ObjectNode ampNode = objectMapper.createObjectNode();
        ampNode.put("local-name", "getPiiData");
        ampNode.put("document-uri", "/ampTest/testModule.sjs");
        ampNode.put("modules-database", dbName);
        ArrayNode roleNode = objectMapper.createArrayNode();
        for(String roleName: roleNames){
            roleNode.add(roleName);
        }
        ampNode.set("role", roleNode);
        return ampNode;
    }

    private void writePayLoadToFileAndDeploy (Path path, String fileName, ObjectNode payload) {
        if(!path.toFile().exists()){
            path.toFile().mkdirs();
        }
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(path.resolve(fileName).toFile(), payload);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        runAsDataHubSecurityAdmin();
        deployProject();
    }

    private void deployProject() {
        new DhsDeployer().deployAsSecurityAdmin(getHubConfig());
    }

    private EvalResultIterator fetchPiiData(){
        return  operatorHubClient.getStagingClient().newServerEval().javascript("const ampMod = require('/ampTest/testModule.sjs');\n" +
            "ampMod.getPiiData();").eval();
    }

    private void writeTestModuleAndDocs(){
        DocumentManager moduleDocManager = adminHubClient.getModulesClient().newDocumentManager();
        DocumentWriteSet writeSet = moduleDocManager.newWriteSet();
        StringHandle handle =  new StringHandle("'use strict';\n" +
            "module.exports.getPiiData = module.amp(\n" +
            "  function getPiiData() {\n" +
            "    return cts.doc('/pii/test.json');\n" +
            "  }\n" +
            ");");
        handle.setFormat(Format.TEXT);
        writeSet.add("/ampTest/testModule.sjs", buildMetadataWithModulePermissions(), handle);
        moduleDocManager.write(writeSet);

        handle = new StringHandle("{\"ssn\": \"123-456-7890\"}");
        handle.setFormat(Format.JSON);
        DocumentMetadataHandle permissions = new DocumentMetadataHandle()
            .withPermission("pii-reader", DocumentMetadataHandle.Capability.UPDATE,READ);
        DocumentManager adminDocManager = adminHubClient.getStagingClient().newDocumentManager();
        writeSet = adminDocManager.newWriteSet();
        writeSet.add("/pii/test.json", permissions, handle);
        adminDocManager.write(writeSet);
    }
}
