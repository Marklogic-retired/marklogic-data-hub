package com.marklogic.hub.deploy.commands;


import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.BytesHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*;
import static org.junit.jupiter.api.Assertions.*;

public class GenerateFunctionMetadataCommandTest extends AbstractHubCoreTest {

    @Autowired
    GenerateFunctionMetadataCommand generateFunctionMetadataCommand;

    @BeforeEach
    public void writeTestMappingFunctionLibraryToModulesDatabase() {
        GenericDocumentManager modMgr = getHubClient().getModulesClient().newDocumentManager();
        DocumentWriteSet writeSet = modMgr.newWriteSet();
        StringHandle handle = new StringHandle("'use strict';\n" +
            "\n" +
            "function testModule(pattern, value) {\n" +
            "  return xdmp.parseDateTime(pattern, value);\n" +
            "}\n" +
            "\n" +
            "module.exports = {\n" +
            "  testModule: testModule\n" +
            "};");
        handle.setFormat(Format.TEXT);
        DocumentMetadataHandle permissions = new DocumentMetadataHandle()
            .withPermission("data-hub-module-reader", DocumentMetadataHandle.Capability.EXECUTE, UPDATE, READ);
        writeSet.add("/custom-modules/mapping-functions/testModule.sjs", permissions, handle);
        modMgr.write(writeSet);
    }

    @Test
    public void sortOrder() {
        int metadataOrder = new GenerateFunctionMetadataCommand().getExecuteSortOrder();
        int userModulesOrder = new LoadUserModulesCommand().getExecuteSortOrder();
        assertTrue(metadataOrder > userModulesOrder,
            "Function metadata should be generated after user modules are loaded");
    }

    @Test
    void testMetaDataGeneration() {
        generateFunctionMetadataCommand.execute(newCommandContext());

        String uri = "/custom-modules/mapping-functions/testModule.xml.xslt";
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        BytesHandle handle = getHubClient().getModulesClient().newDocumentManager().read(uri, metadata, new BytesHandle());
        assertNotEquals(0, handle.get().length);
        DocumentMetadataHandle.DocumentPermissions permissions = metadata.getPermissions();
        assertTrue(permissions.get("data-hub-module-reader").contains(READ));
        assertTrue(permissions.get("data-hub-module-reader").contains(EXECUTE));
        assertTrue(permissions.get("data-hub-module-writer").contains(UPDATE));
    }

    @Test
    void updateModule() {
        installReferenceModelProject().createRawCustomer(2, "CustomerTwo");

        // Run the flow first to make sure it succeeds
        RunFlowResponse response = runFlow(new FlowInputs("simpleMapping", "1"));
        assertEquals(1, response.getStepResponses().get("1").getSuccessfulEvents());

        // Now generate function metadata. If the mapping transforms aren't re-generated as well, then
        // the flow will fail. So we'll then run the flow to make sure it still succeeds.
        new GenerateFunctionMetadataCommand(getHubConfig()).generateFunctionMetadata();
        response = runFlow(new FlowInputs("simpleMapping", "1"));
        assertEquals("finished", response.getJobStatus());
        assertEquals(1, response.getStepResponses().get("1").getSuccessfulEvents());
    }
}

