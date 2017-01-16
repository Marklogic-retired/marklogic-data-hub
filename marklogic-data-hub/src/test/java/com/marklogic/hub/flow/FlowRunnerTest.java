/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.hub.flow;

import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.Format;
import com.marklogic.hub.*;
import com.marklogic.hub.plugin.PluginFormat;
import com.marklogic.hub.scaffold.Scaffolding;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;

public class FlowRunnerTest extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);
        File projectDirFile = projectDir.toFile();
        if (projectDirFile.isDirectory() && projectDirFile.exists()) {
            FileUtils.deleteDirectory(projectDirFile);
        }

        installHub();

        enableDebugging();
        enableTracing();

        Scaffolding scaffolding = new Scaffolding(projectDir.toString(), stagingClient);
        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
            PluginFormat.XQUERY, Format.XML);

        DataHub dh = new DataHub(getHubConfig());
        dh.clearUserModules();
        dh.installUserModules();

        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/collector/collector.xqy", "flow-runner-test/collector.xqy");
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/content/content.xqy", "flow-runner-test/content-for-options.xqy");
    }

    @AfterClass
    public static void teardown() throws IOException {
        FileUtils.deleteDirectory(projectDir.toFile());
    }

    @Test
    public void testPassOptions() throws IOException, ParserConfigurationException, SAXException {

        FlowManager fm = new FlowManager(getHubConfig());
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);
        JobFinishedListener harmonizeFlowListener = new JobFinishedListener();
        HashMap<String, Object> options = new HashMap<>();
        options.put("name", "Bob Smith");
        options.put("age", 55);
        fm.runFlow(harmonizeFlow, 10, 1, HubDatabase.STAGING, HubDatabase.FINAL, options, harmonizeFlowListener);
        harmonizeFlowListener.waitForFinish();
        assertXMLEqual(getXmlFromResource("flow-runner-test/with-options-output.xml"), finalDocMgr.read("1.xml").next().getContent(new DOMHandle()).get());
    }
}
