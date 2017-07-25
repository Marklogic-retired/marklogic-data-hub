package com.marklogic.hub;

import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Paths;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class DataHubInstallTest extends HubTestBase {

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        InstallInfo installInfo = getDataHub().isInstalled();
        if (installInfo.isInstalled()) {
            uninstallHub();
        }
        installHub();
    }

    @Test
    public void testInstallHubModules() throws IOException {
        assertTrue(getDataHub().isInstalled().isInstalled());

        assertTrue(getModulesFile("/com.marklogic.hub/lib/config.xqy").startsWith(getResource("data-hub-test/core-modules/config.xqy")));
    }

    @Test
    public void getHubModulesVersion() throws IOException {
        String version = getHubConfig().getJarVersion();
        assertEquals(version, getDataHub().getHubVersion());
    }

    @Test
    public void testInstallUserModules() throws IOException, ParserConfigurationException, SAXException, URISyntaxException {
        URL url = DataHubInstallTest.class.getClassLoader().getResource("data-hub-test");
        String path = Paths.get(url.toURI()).toFile().getAbsolutePath();

        DataHub dataHub = new DataHub(getHubConfig(path));

        dataHub.installUserModules(true);

        assertEquals(
                getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/collector/collector.xqy"),
                getModulesFile("/entities/test-entity/harmonize/final/collector/collector.xqy"));

        EvalResultIterator resultItr = runInModules(
            "xquery version \"1.0-ml\";\n" +
                "import module namespace sec=\"http://marklogic.com/xdmp/security\" at \n" +
                "    \"/MarkLogic/security.xqy\";\n" +
                "let $perms := xdmp:document-get-permissions('/entities/test-entity/harmonize/final/collector/collector.xqy')\n" +
                "return\n" +
                "  fn:string-join(" +
                "    for $x in xdmp:invoke-function(function() {\n" +
                "      sec:get-role-names($perms/sec:role-id) ! fn:string()\n" +
                "    }," +
                "    map:entry(\"database\", xdmp:security-database())" +
                "    )" +
                "    order by $x ascending" +
                "    return $x, \",\")");
        EvalResult res = resultItr.next();
        assertEquals("data-hub-role,rest-admin", res.getString());
        assertEquals(
                getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/content/content.xqy"),
                getModulesFile("/entities/test-entity/harmonize/final/content/content.xqy"));
        assertEquals(
                getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/headers/headers.xqy"),
                getModulesFile("/entities/test-entity/harmonize/final/headers/headers.xqy"));
        assertEquals(
                getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/triples/triples.xqy"),
                getModulesFile("/entities/test-entity/harmonize/final/triples/triples.xqy"));

        assertXMLEqual(
                getXmlFromResource("data-hub-test/plugins/entities/test-entity/harmonize/final/final.xml"),
                getModulesDocument("/entities/test-entity/harmonize/final/final.xml"));


        assertEquals(
                getResource("data-hub-test/plugins/entities/test-entity/input/hl7/content/content.xqy"),
                getModulesFile("/entities/test-entity/input/hl7/content/content.xqy"));
        assertEquals(
                getResource("data-hub-test/plugins/entities/test-entity/input/hl7/headers/headers.xqy"),
                getModulesFile("/entities/test-entity/input/hl7/headers/headers.xqy"));
        assertEquals(
                getResource("data-hub-test/plugins/entities/test-entity/input/hl7/triples/triples.xqy"),
                getModulesFile("/entities/test-entity/input/hl7/triples/triples.xqy"));
        assertXMLEqual(
                getXmlFromResource("data-hub-test/plugins/entities/test-entity/input/hl7/hl7.xml"),
                getModulesDocument("/entities/test-entity/input/hl7/hl7.xml"));

        assertXMLEqual(
                getXmlFromResource("data-hub-test/plugins/entities/test-entity/input/REST/options/doctors.xml"),
                getModulesDocument("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/doctors.xml"));

        assertXMLEqual(
                getXmlFromResource("data-hub-test/plugins/entities/test-entity/harmonize/REST/options/patients.xml"),
                getModulesDocument("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/patients.xml"));

        assertXMLEqual(
                getXmlFromResource("data-hub-helpers/test-conf-metadata.xml"),
                getModulesDocument("/marklogic.rest.transform/test-conf-transform/assets/metadata.xml"));
        assertEquals(
                getResource("data-hub-test/plugins/entities/test-entity/harmonize/REST/transforms/test-conf-transform.xqy"),
                getModulesFile("/marklogic.rest.transform/test-conf-transform/assets/transform.xqy"));

        assertXMLEqual(
                getXmlFromResource("data-hub-helpers/test-input-metadata.xml"),
                getModulesDocument("/marklogic.rest.transform/test-input-transform/assets/metadata.xml"));
        assertEquals(
                getResource("data-hub-test/plugins/entities/test-entity/input/REST/transforms/test-input-transform.xqy"),
                getModulesFile("/marklogic.rest.transform/test-input-transform/assets/transform.xqy"));

    }
}
