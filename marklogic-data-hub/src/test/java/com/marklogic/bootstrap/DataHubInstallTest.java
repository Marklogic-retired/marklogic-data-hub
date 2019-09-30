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
package com.marklogic.bootstrap;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.admin.ServerConfigurationManager;
import com.marklogic.client.ext.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.QueryOptionsListHandle;
import com.marklogic.hub.*;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.jupiter.api.Assertions.*;

/**
 * This test should really just be run as part of CD pipeline
 * or on-demand.  It's the only test that requires setup/teardown
 * and is not valid in a provisioned environment.
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class DataHubInstallTest extends HubTestBase
{
    private static DataHub dataHub;

    private static int afterTelemetryInstallCount = 0;

    static boolean setupDone = false;
    static String projectDir = PROJECT_PATH;

    @Autowired
    public void setDataHub(DataHub dataHub){
        DataHubInstallTest.dataHub = dataHub;
    }

    @BeforeAll
    public static void setupOnce() {
        new Installer().deleteProjectDir();
    }

    @BeforeEach
    public void setup()
    {
        // special case do-one setup.
        XMLUnit.setIgnoreWhitespace(true);
        // the project dir must be available for uninstall to do anything... interesting.
        createProjectDir();

        if (!setupDone) {
            HubProject project = getDataHubAdminConfig().getHubProject();

            //creating directories for adding final schemas/ modules and trigger files
            Path userSchemasDir = Paths.get(PROJECT_PATH).resolve(HubProject.PATH_PREFIX).resolve("ml-schemas");
            Path userModulesDir = project.getUserFinalModulesDir();
            Path finalTriggersDir = project.getUserDatabaseDir()
                    .resolve(HubConfig.DEFAULT_FINAL_TRIGGERS_DB_NAME)
                    .resolve("triggers");
            Path stagingTriggersDir = project.getUserDatabaseDir()
            .resolve(HubConfig.DEFAULT_STAGING_TRIGGERS_DB_NAME)
            .resolve("triggers");

            userSchemasDir.resolve("tde").toFile().mkdirs();
            userModulesDir.resolve("ext").toFile().mkdirs();
            finalTriggersDir.toFile().mkdirs();
            stagingTriggersDir.toFile().mkdirs();
            //userTriggersDir.toFile().mkdirs();

            //creating directories for adding staging schemas/ modules and trigger files
            Path hubSchemasDir = project.getUserDatabaseDir()
                .resolve(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME)
                .resolve("schemas");
            Path hubModulesDir = project.getHubStagingModulesDir();
            //Path hubTriggersDir = project.getHubConfigDir().resolve("triggers");

            hubSchemasDir.resolve("tde").toFile().mkdirs();
            hubModulesDir.resolve("ext").toFile().mkdirs();
            //hubTriggersDir.toFile().mkdirs();
            //Copying files to their locations
            try {
                FileUtils.copyFileToDirectory(getResourceFile("data-hub-test/scaffolding/tdedoc.xml"), userSchemasDir.resolve("tde").toFile());
                FileUtils.copyFileToDirectory(getResourceFile("data-hub-test/scaffolding/sample-trigger.xqy"), userModulesDir.resolve("ext").toFile());
                FileUtils.copyFileToDirectory(getResourceFile("data-hub-test/scaffolding/final-trigger.json"), finalTriggersDir.toFile());

                FileUtils.copyFileToDirectory(getResourceFile("data-hub-test/scaffolding/tdedoc.xml"), hubSchemasDir.resolve("tde").toFile());
                FileUtils.copyFileToDirectory(getResourceFile("data-hub-test/scaffolding/sample-trigger.xqy"), hubModulesDir.resolve("ext").toFile());
                FileUtils.copyFileToDirectory(getResourceFile("data-hub-test/scaffolding/staging-trigger.json"), stagingTriggersDir.toFile());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            getDataHub().install(null);
            getDataHubAdminConfig().refreshProject();
            setupDone = true;
        }
        afterTelemetryInstallCount = getTelemetryInstallCount();
    }

    @AfterAll
    public static void cleanUp()
    {
        dataHub.uninstall();
        setupDone = false;
    }


    @Test
    public void testTelemetryInstallCount() throws IOException
    {
        assertTrue(afterTelemetryInstallCount > 0, "Telemetry install count was not incremented during install.  Value now is " + afterTelemetryInstallCount);
    }

    @Test
    public void testProjectScaffolding() throws IOException
    {
        DatabaseClient stagingTriggersClient = null;
        DatabaseClient finalTriggersClient = null;

        DatabaseClient stagingSchemasClient = null;
        DatabaseClient finalSchemasClient = null;
        try {
            stagingTriggersClient = getClient(host, stagingPort, HubConfig.DEFAULT_STAGING_TRIGGERS_DB_NAME, user, password, stagingAuthMethod);
            finalTriggersClient = getClient(host, finalPort, HubConfig.DEFAULT_FINAL_TRIGGERS_DB_NAME, user, password, finalAuthMethod);
            stagingSchemasClient = getClient(host, stagingPort, HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, user, password, stagingAuthMethod);
            finalSchemasClient = getClient(host, finalPort, HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, user, password, finalAuthMethod);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        //checking if modules are written to correct db
        assertNotNull(getModulesFile("/ext/sample-trigger.xqy"));

        assertNotNull(getModulesFile("/ext/sample-trigger.xqy"));

        //checking if tdes are written to correct db
        Document expectedXml = getXmlFromResource("data-hub-test/scaffolding/tdedoc.xml");
        Document actualXml = stagingSchemasClient.newDocumentManager().read("/tde/tdedoc.xml").next().getContent(new DOMHandle()).get();
        assertXMLEqual(expectedXml, actualXml);
        actualXml = finalSchemasClient.newDocumentManager().read("/tde/tdedoc.xml").next().getContent(new DOMHandle()).get();
        assertXMLEqual(expectedXml, actualXml);

        final String message = "For 5.1.0, 8 triggers are expected, and the test also adds 'my-trigger' for a count of 9";
        int count = stagingTriggersClient.newServerEval().xquery("fn:count(fn:doc())").eval().next().getNumber().intValue();
        assertEquals(9, count, message);
        count = finalTriggersClient.newServerEval().xquery("fn:count(fn:doc())").eval().next().getNumber().intValue();
        assertEquals(9, count, message);

    }

    @Test
    public void testInstallHubModules() throws IOException
    {
        assertTrue(getDataHub().isInstalled().isInstalled());

        assertTrue(getModulesFile("/com.marklogic.hub/config.xqy").startsWith(getResource("data-hub-test/core-modules/config.xqy")));

        ServerConfigurationManager jobsConfigMgr = adminHubConfig.newJobDbClient().newServerConfigManager();
        QueryOptionsManager jobsOptionsManager = jobsConfigMgr.newQueryOptionsManager();
        Set<String> jobsOptions = jobsOptionsManager.optionsList(new QueryOptionsListHandle()).getValuesMap().keySet();
        assertTrue(jobsOptions.contains("traces"), "trace options not installed");
        assertTrue(jobsOptions.contains("jobs"), "jobs options not installed");

        ServerConfigurationManager stagingConfigMgr = adminHubConfig.newStagingClient().newServerConfigManager();
        QueryOptionsManager stagingOptionsManager = stagingConfigMgr.newQueryOptionsManager();
        Set<String> stagingOptions = stagingOptionsManager.optionsList(new QueryOptionsListHandle()).getValuesMap().keySet();

        assertTrue(stagingOptions.contains("default"), "staging options not installed");

        ServerConfigurationManager finalConfigMgr = adminHubConfig.newFinalClient().newServerConfigManager();
        QueryOptionsManager finalOptionsManager = finalConfigMgr.newQueryOptionsManager();
        Set<String> finalOptions = finalOptionsManager.optionsList(new QueryOptionsListHandle()).getValuesMap().keySet();
        assertTrue(finalOptions.contains("default"), "final options not installed");
    }

    @Test
    public void getHubModulesVersion() throws IOException
    {
        String version = getHubFlowRunnerConfig().getJarVersion();
        assertEquals(version, versions.getHubVersion());
        getDataHubAdminConfig();
    }

    @Test
    public void testInstallUserModules() throws IOException, ParserConfigurationException, SAXException, URISyntaxException
    {
        deleteProjectDir();
        Path src = Paths.get(DataHubInstallTest.class.getClassLoader().getResource("data-hub-test").toURI());
        Path dest = Paths.get(PROJECT_PATH).getFileName().toAbsolutePath();
        FileUtils.copyDirectory(src.toFile(), dest.toFile());

        createProjectDir();
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

        ServerConfigurationManager stagingConfigMgr = adminHubConfig.newStagingClient().newServerConfigManager();
        QueryOptionsManager stagingOptionsManager = stagingConfigMgr.newQueryOptionsManager();

        assertXMLEqual(
            getXmlFromResource("data-hub-test/plugins/entities/test-entity/input/REST/options/doctors.xml"),
            stagingOptionsManager.readOptions("doctors", new DOMHandle()).get());

        ServerConfigurationManager finalConfigMgr = adminHubConfig.newFinalClient().newServerConfigManager();
        QueryOptionsManager finalOptionsManager = finalConfigMgr.newQueryOptionsManager();

        assertXMLEqual(
            getXmlFromResource("data-hub-test/plugins/entities/test-entity/harmonize/REST/options/patients.xml"),
            finalOptionsManager.readOptions("patients", new DOMHandle()).get());

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
    public void testClearUserModules() throws URISyntaxException
    {
        URL url = DataHubInstallTest.class.getClassLoader().getResource("data-hub-test");
        String path = Paths.get(url.toURI()).toFile().getAbsolutePath();
        createProjectDir(path);
        dataHub.clearUserModules();
        installUserModules(adminHubConfig, true);

        // removed counts assertions which were so brittle as to be just an impediment to life.

        dataHub.clearUserModules();
    }

}
