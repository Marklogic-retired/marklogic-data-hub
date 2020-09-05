/*
 * Copyright (c) 2020 MarkLogic Corporation
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

import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.ext.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.w3c.dom.Document;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Paths;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.jupiter.api.Assertions.*;

public class DataHubInstallTest extends AbstractHubCoreTest {

    @Autowired
    DataHub dataHub;

    @Test
    public void testInstallHubModules() {
        Assumptions.assumeFalse(getHubConfig().getIsProvisionedEnvironment());
        assertTrue(dataHub.isInstalled().isInstalled());

        assertTrue(getModulesFile("/com.marklogic.hub/config.xqy").startsWith(getResource("data-hub-test/core-modules/config.xqy")));

        QueryOptionsManager jobsOptMgr = getHubClient().getJobsClient().newServerConfigManager().newQueryOptionsManager();
        StringHandle strJobTracesHandle = new StringHandle();
        jobsOptMgr.readOptions("traces", strJobTracesHandle);
        assertTrue(strJobTracesHandle.get().length() > 0, "traces options not installed");
        StringHandle strJobssHandle = new StringHandle();
        jobsOptMgr.readOptions("jobs", strJobssHandle);
        assertTrue(strJobssHandle.get().length() > 0, "jobs options not installed");
        StringHandle strStagingHandle = new StringHandle();
        getHubClient().getStagingClient().newServerConfigManager().newQueryOptionsManager().readOptions("default", strStagingHandle);
        assertTrue(strStagingHandle.get().length() > 0, "staging options not installed");
        StringHandle strFinalHandle = new StringHandle();
        getHubClient().getFinalClient().newServerConfigManager().newQueryOptionsManager().readOptions("default", strFinalHandle);
        assertTrue(strFinalHandle.get().length() > 0, "final options not installed");
    }

    @Test
    public void testInstallUserModules() throws IOException, URISyntaxException {
        Assumptions.assumeFalse(runAsFlowDeveloper().getIsProvisionedEnvironment());
        URL url = DataHubInstallTest.class.getClassLoader().getResource("data-hub-test");
        String path = Paths.get(url.toURI()).toFile().getAbsolutePath();
        File srcDir = new File(path);
        File projectDir = getHubProject().getProjectDir().toFile();

        FileUtils.cleanDirectory(projectDir);
        FileUtils.copyDirectory(srcDir, projectDir);

        installUserModules(runAsFlowDeveloper(), false);

        assertEquals(
            getResource("data-hub-test/plugins/entities/test-entity/harmonize/final/collector.xqy"),
            getModulesFile("/entities/test-entity/harmonize/final/collector.xqy"));

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

        // This used to test the finalClient as well, but that was misleading because that client was still talking
        // to the staging port
        QueryOptionsManager stagingQueryOptMgr = getClientByName(HubConfig.DEFAULT_STAGING_NAME).newServerConfigManager().newQueryOptionsManager();
        assertXMLEqual(
            getXmlFromResource("data-hub-test/plugins/entities/test-entity/input/REST/options/doctors.xml"),
            stagingQueryOptMgr.readOptions("doctors", new DOMHandle()).get());

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

        String timestampFile = getHubProject().getUserModulesDeployTimestampFile();
        PropertiesModuleManager propsManager = new PropertiesModuleManager(timestampFile);
        propsManager.initialize();

        File pluginsDir = getHubProject().getHubPluginsDir().toFile();

        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "my-lib.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/harmonize/final/content.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/harmonize/final/headers.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/harmonize/final/triples.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/harmonize/final/writer.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/harmonize/final/main.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/input/hl7/content.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/input/hl7/headers.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/input/hl7/triples.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/input/hl7/writer.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/input/hl7/main.xqy")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/input/REST/options/doctors.xml")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/harmonize/REST/options/patients.xml")));
        assertFalse(propsManager.hasFileBeenModifiedSinceLastLoaded(new File(pluginsDir, "entities/test-entity/input/REST/transforms/test-input-transform.xqy")));
    }

    private Document getModulesDocument(String uri) {
        return getHubClient().getModulesClient().newDocumentManager().read(uri).next().getContent(new DOMHandle()).get();
    }
}
