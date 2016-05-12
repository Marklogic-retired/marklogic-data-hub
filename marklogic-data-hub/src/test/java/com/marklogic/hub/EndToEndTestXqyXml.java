package com.marklogic.hub;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;

import java.io.File;
import java.io.IOException;

import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.xml.sax.SAXException;

import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.Format;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;

public class EndToEndTestXqyXml extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static File projectDir = new File("ye-olde-project");

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        if (projectDir.isDirectory() && projectDir.exists()) {
            FileUtils.deleteDirectory(projectDir);
        }

        installHub();

        enableDebugging();

        Scaffolding scaffolding = new Scaffolding(projectDir.toString());
        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "testinput", FlowType.INPUT,
                PluginFormat.XQUERY, Format.XML);
        scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
                PluginFormat.XQUERY, Format.XML);

        new DataHub(getHubConfig()).installUserModules();
    }

    @AfterClass
    public static void teardown() throws IOException {
        uninstallHub();
        FileUtils.deleteDirectory(projectDir);
    }

    @Test
    public void runFlows() throws IOException, ParserConfigurationException, SAXException {
        FlowManager fm = new FlowManager(stagingClient);
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
                FlowType.HARMONIZE);

        stagingDocMgr.write("/input.xml", new DOMHandle(getXmlFromResource("e2e-test/staged.xml")));

        JobFinishedListener harmonizeFlowListener = new JobFinishedListener();
        fm.runFlow(harmonizeFlow, 10, harmonizeFlowListener);
        harmonizeFlowListener.waitForFinish();
        assertXMLEqual(getXmlFromResource("e2e-test/final.xml"), finalDocMgr.read("/input.xml").next().getContent(new DOMHandle()).get());
    }
}
