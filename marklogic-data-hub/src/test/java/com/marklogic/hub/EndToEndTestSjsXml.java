package com.marklogic.hub;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;

import java.io.File;
import java.io.IOException;
import java.net.URL;

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

        Scaffolding.createEntity(ENTITY, pluginsDir);
        Scaffolding.createFlow(ENTITY, "testinput", FlowType.INPUT,
                PluginFormat.JAVASCRIPT, Format.XML, pluginsDir);
        Scaffolding.createFlow(ENTITY, "testconformance", FlowType.CONFORMANCE,
                PluginFormat.JAVASCRIPT, Format.XML, pluginsDir);

        new DataHub(host, stagingPort, finalPort, user, password).installUserModules(pluginsDir.toString());
    }

    @AfterClass
    public static void teardown() throws IOException {
        uninstallHub();
        FileUtils.deleteDirectory(pluginsDir);
    }

    @Test
    public void runFlows() throws IOException, ParserConfigurationException, SAXException {
        FlowManager fm = new FlowManager(stagingClient);
        Flow inputFlow = fm.getFlow(ENTITY, "testinput", FlowType.INPUT);
        Flow conformanceFlow = fm.getFlow(ENTITY, "testconformance",
                FlowType.CONFORMANCE);

        URL url = HubTestBase.class.getClassLoader().getResource("e2e-test/input");
        HubConfig config = getHubConfig(url.getPath());
        fm.runInputFlow(inputFlow, config);

        assertXMLEqual(getXmlFromResource("e2e-test/staged.xml"), stagingDocMgr.read("/input.xml").next().getContent(new DOMHandle()).get());

        JobFinishedListener conformanceFlowListener = new JobFinishedListener();
        fm.runFlow(conformanceFlow, 10, conformanceFlowListener);
        conformanceFlowListener.waitForFinish();
        assertXMLEqual(getXmlFromResource("e2e-test/final.xml"), finalDocMgr.read("/input.xml").next().getContent(new DOMHandle()).get());
    }
}
