package com.marklogic.hub.deploy.commands;


import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.bootstrap.Installer;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.Versions;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.READ;
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.UPDATE;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class GenerateFunctionMetadataCommandTest extends HubTestBase {

    @Autowired
    private HubConfigImpl hubConfig;

    @Autowired
    private Versions versions;

    @Autowired
    private GenerateFunctionMetadataCommand generateFunctionMetadataCommand;

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().deleteProjectDir();
    }

    @BeforeEach
    public void setupEach() throws IOException {
        basicSetup();
        getDataHubAdminConfig();
        DocumentWriteSet writeSet = modMgr.newWriteSet();
        StringHandle handle = new StringHandle("'use strict';\n" +
            "\n" +
            "function testModule(picture, value) {\n" +
            "  return xdmp.parseDateTime(picture, value);\n" +
            "}\n" +
            "\n" +
            "module.exports = {\n" +
            "  testModule: testModule\n" +
            "};");
        handle.setFormat(Format.TEXT);
        DocumentMetadataHandle permissions = new DocumentMetadataHandle()
            .withPermission(getDataHubAdminConfig().getFlowDeveloperRoleName(), DocumentMetadataHandle.Capability.EXECUTE, UPDATE, READ);
        writeSet.add("/custom-modules/mapping-functions/testModule.sjs", permissions, handle);
        modMgr.write(writeSet);
    }

    @AfterAll
    public static void cleanUp() {
        new Installer().deleteProjectDir();
    }

    @Test
    public void testMetaDataGeneration() {
        if (versions.isVersionCompatibleWithES()) {
            CommandContext context = new CommandContext(hubConfig.getAppConfig(), hubConfig.getManageClient(), hubConfig.getAdminManager());
            generateFunctionMetadataCommand.execute(context);
            Assertions.assertFalse(getModulesFile("/custom-modules/mapping-functions/testModule.xml.xslt").isEmpty());
        }
    }
}

