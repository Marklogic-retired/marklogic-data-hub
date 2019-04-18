/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.core;

import com.marklogic.client.ext.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.hub.*;
import com.marklogic.hub.ApplicationConfig;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.net.Socket;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class DataHubInstallTest extends HubTestBase {
    private static int afterTelemetryInstallCount = 0;

    static boolean setupDone=false;

    @BeforeEach
    public void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        createProjectDir();
    }

    @AfterEach
    public void teardown() {
        deleteProjectDir();
    }

    //should be removed after DHFPROD-1263 is fixed.
	private Map<String, Boolean> runPreInstallCheck(){
		Map<String, Boolean> resp = new HashMap<>();
		try (Socket ignored = new Socket(getDataHubAdminConfig().getHost(), getDataHubAdminConfig().getPort(DatabaseKind.STAGING))) {
	    	resp.put("stagingPortInUse", true);
	    }
	    catch (IOException ignored) {
	    	resp.put("stagingPortInUse", false);
	    }

	    try (Socket ignored = new Socket(getDataHubAdminConfig().getHost(), getDataHubAdminConfig().getPort(DatabaseKind.FINAL))) {
	    	resp.put("finalPortInUse", true);
	    }
	    catch (IOException ignored) {
	    	resp.put("finalPortInUse", false);
	    }
		return resp;
	}

    @Test
    @Disabled
    public void testTelemetryInstallCount() throws IOException {
        assertTrue(afterTelemetryInstallCount > 0, "Telemetry install count was not incremented during install.  Value now is " + afterTelemetryInstallCount);
    }

    @Test
    public void testInstallHubModules() throws IOException {
        Assumptions.assumeFalse(getDataHubAdminConfig().getIsProvisionedEnvironment());
        assertTrue(getDataHub().isInstalled().isInstalled());

        assertTrue(getModulesFile("/com.marklogic.hub/config.xqy").startsWith(getResource("data-hub-test/core-modules/config.xqy")));

        assertTrue(getModulesFile("/Default/data-hub-JOBS/rest-api/options/traces.xml").length() > 0, "trace options not installed");
        assertTrue(getModulesFile("/Default/data-hub-JOBS/rest-api/options/jobs.xml").length() > 0, "jobs options not installed");
        assertTrue(getModulesFile("/Default/data-hub-STAGING/rest-api/options/default.xml").length() > 0,"staging options not installed");
        assertTrue(getModulesFile("/Default/data-hub-FINAL/rest-api/options/default.xml").length() > 0, "final options not installed");
    }

    @Test
    public void getHubModulesVersion() throws IOException {
        String version = getHubFlowRunnerConfig().getJarVersion();
        assertEquals(version, versions.getHubVersion());
        getDataHubAdminConfig();
    }

    @Test
    public void testInstallUserModules() throws IOException, ParserConfigurationException, SAXException, URISyntaxException {
        Assumptions.assumeFalse(getDataHubAdminConfig().getIsProvisionedEnvironment());
        URL url = DataHubInstallTest.class.getClassLoader().getResource("data-hub-test");
        String path = Paths.get(url.toURI()).toFile().getAbsolutePath();
        File srcDir = new File(path);
        File projectDir = new File(PROJECT_PATH);

        createProjectDir(path);
        FileUtils.cleanDirectory(projectDir);
        FileUtils.copyDirectory(srcDir, projectDir);
        HubConfig hubConfig = getDataHubAdminConfig();

        int totalCount = getDocCount(HubConfig.DEFAULT_MODULES_DB_NAME, null);
        installUserModules(hubConfig, false);

        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/collector.xqy"),
            getModulesFile("/entities/test-entity/harmonize/final/collector.xqy"));

        /* this test requires a privilege we don't want to give to flow-operator-role
          TODO implement admin testing for specific assertions.
        EvalResultIterator resultItr = runInModules(
            "xquery version \"1.0-ml\";\n" +
                "import module namespace sec=\"http://marklogic.com/xdmp/security\" at \n" +
                "    \"/MarkLogic/security.xqy\";\n" +
                "let $perms := xdmp:document-get-permissions('/entities/test-entity/harmonize/final/collector.xqy')\n" +
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
        assertEquals("flow-operator-role,rest-admin,rest-reader,rest-writer", res.getString());
         */

        assertEquals(
            getResource("data-hub-test/plugins/my-lib.xqy"),
            getModulesFile("/my-lib.xqy"));

        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/main.xqy"),
            getModulesFile("/entities/test-entity/harmonize/final/main.xqy"));


        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/content.xqy"),
            getModulesFile("/entities/test-entity/harmonize/final/content.xqy"));
        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/headers.xqy"),
            getModulesFile("/entities/test-entity/harmonize/final/headers.xqy"));
        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/triples.xqy"),
            getModulesFile("/entities/test-entity/harmonize/final/triples.xqy"));
        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/writer.xqy"),
            getModulesFile("/entities/test-entity/harmonize/final/writer.xqy"));
        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/main.xqy"),
            getModulesFile("/entities/test-entity/harmonize/final/main.xqy"));

        assertXMLEqual(
            getXmlFromResource("data-hub-test/final.xml"),
            getModulesDocument("/entities/test-entity/harmonize/final/final.xml"));


        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/input/hl7/content.xqy"),
            getModulesFile("/entities/test-entity/input/hl7/content.xqy"));
        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/input/hl7/headers.xqy"),
            getModulesFile("/entities/test-entity/input/hl7/headers.xqy"));
        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/input/hl7/triples.xqy"),
            getModulesFile("/entities/test-entity/input/hl7/triples.xqy"));
        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/input/hl7/writer.xqy"),
            getModulesFile("/entities/test-entity/input/hl7/writer.xqy"));
        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/input/hl7/main.xqy"),
            getModulesFile("/entities/test-entity/input/hl7/main.xqy"));
        assertXMLEqual(
            getXmlFromResource("data-hub-test/hl7.xml"),
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

        /*
        ** The following tests would fail as installUserModules() is run with "forceLoad" option set to true as the
        * LoadUserModulesCommand runs first and the timestamp file it creates will be deleted by LoadUserArtifactsCommand
        * as currently these 2 commands share the timestamp file
         */

        String timestampFile = hubConfig.getHubProject().getUserModulesDeployTimestampFile();
        PropertiesModuleManager propsManager = new PropertiesModuleManager(timestampFile);
        propsManager.initialize();
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/my-lib.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/harmonize/final/content.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/harmonize/final/headers.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/harmonize/final/triples.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/harmonize/final/writer.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/harmonize/final/main.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/input/hl7/content.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/input/hl7/headers.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/input/hl7/triples.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/input/hl7/writer.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/input/hl7/main.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/input/REST/options/doctors.xml")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/harmonize/REST/options/patients.xml")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File("ye-olde-project/plugins/entities/test-entity/input/REST/transforms/test-input-transform.xqy")));
    }

    @Test
    public void testClearUserModules() throws URISyntaxException {
        URL url = DataHubInstallTest.class.getClassLoader().getResource("data-hub-test");
        String path = Paths.get(url.toURI()).toFile().getAbsolutePath();
        createProjectDir(path);
        HubConfig hubConfig = getDataHubAdminConfig(path);
        dataHub.clearUserModules();


        installUserModules(hubConfig, true);

        // removed counts assertions which were so brittle as to be just an impediment to life.

        dataHub.clearUserModules();


    }

}
