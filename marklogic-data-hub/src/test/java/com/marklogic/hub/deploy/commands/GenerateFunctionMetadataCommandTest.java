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
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.regex.Pattern;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.READ;
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.UPDATE;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class GenerateFunctionMetadataCommandTest extends HubTestBase {

    @Autowired
    private HubConfigImpl hubConfig;

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
        String serverVersion = dataHub.getServerVersion();
        if (serverVersion != null && versionIsCompatibleWithES(serverVersion)) {
            CommandContext context = new CommandContext(hubConfig.getAppConfig(), hubConfig.getManageClient(), hubConfig.getAdminManager());
            generateFunctionMetadataCommand.execute(context);
            Assertions.assertFalse(getModulesFile("/custom-modules/mapping-functions/testModule.xml.xslt").isEmpty());
        }
    }

    //TODO Find a better home for this, since it could be used elsewhere.
    public boolean versionIsCompatibleWithES(String version) {
        boolean compatibleWithES = false;
        int majorVersion = Integer.parseInt(version.replace("^([0-9]+)\\..*$", "$1"));
        if (majorVersion >= 9) {
            boolean isNightly = Pattern.matches("^[0-9]+\\.[0-9]+-[0-9]{8}$", version);
            if (isNightly) {
                int dateInt = Integer.parseInt(version.replace("^[0-9]+\\.[0-9]+-([0-9]{8})$", "$1"));
                compatibleWithES = dateInt >= 20190726;
            } else if (majorVersion == 9) {
                int minorInt = Integer.parseInt(version.replace("^[0-9]+\\.[0-9]+-([0-9]{2,})$", "$1"));
                compatibleWithES = minorInt >= 10;
            } else {
                compatibleWithES = true;
            }
        }
        return compatibleWithES;

    }

}

