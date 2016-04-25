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

public class EndToEndTestSjsXml extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static File pluginsDir = new File("./ye-olde-plugins");

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        if (pluginsDir.isDirectory() && pluginsDir.exists()) {
            FileUtils.deleteDirectory(pluginsDir);
        }

        installHub();

        enableDebugging();
        enableTracing();

        Scaffolding.createEntity(ENTITY, pluginsDir);
        Scaffolding.createFlow(ENTITY, "testinput", FlowType.INPUT,
                PluginFormat.JAVASCRIPT, Format.XML, pluginsDir);
        Scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
                PluginFormat.JAVASCRIPT, Format.XML, pluginsDir);

        new DataHub(getHubConfig()).installUserModules(pluginsDir.toString());
    }

    @AfterClass
    public static void teardown() throws IOException {
        uninstallHub();
        FileUtils.deleteDirectory(pluginsDir);
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
