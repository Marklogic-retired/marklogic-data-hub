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

import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
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

        Scaffolding scaffolding = Scaffolding.create(projectDir.toString(), stagingClient);
        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML);

        DataHub dh = DataHub.create(getHubConfig());
        dh.clearUserModules();
        installUserModules(getHubConfig(), false);

        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/collector.xqy", "flow-runner-test/collector.xqy");
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/content.xqy", "flow-runner-test/content-for-options.xqy");
    }

    @AfterClass
    public static void teardown() {
    	uninstallHub();
        deleteProjectDir();
    }

    @Test
    public void testPassOptions() throws IOException, ParserConfigurationException, SAXException {

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);
        HashMap<String, Object> options = new HashMap<>();
        options.put("name", "Bob Smith");
        options.put("age", 55);
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(10)
            .withThreadCount(1)
            .withOptions(options);
        flowRunner.run();
        flowRunner.awaitCompletion();

        EvalResultIterator resultItr = runInDatabase("xdmp:database('" + HubConfig.DEFAULT_FINAL_NAME + "')", HubConfig.DEFAULT_FINAL_NAME);
        String targetDB = resultItr.next().getString();
        String expected = "<envelope xmlns=\"http://marklogic.com/entity-services\">\n" +
            "  <headers></headers>\n" +
            "  <triples></triples>\n" +
            "  <instance>\n" +
            "    <result xmlns=\"\">\n" +
            "      <name>Bob Smith</name>\n" +
            "      <age>55</age>\n" +
            "      <entity>e2eentity</entity>\n" +
            "      <flow>testharmonize</flow>\n" +
            "      <flowType>harmonize</flowType>\n" +
            "      <dataFormat>xml</dataFormat>\n" +
            "      <target-database>" + targetDB + "</target-database>\n" +
            "    </result>\n" +
            "  </instance>\n" +
            "  <attachments></attachments>\n" +
            "</envelope>";

        assertXMLEqual(expected, finalDocMgr.read("1.xml").next().getContent(new StringHandle()).get());
    }
}
