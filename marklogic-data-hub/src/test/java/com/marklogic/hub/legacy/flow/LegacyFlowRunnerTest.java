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
package com.marklogic.hub.legacy.flow;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.mapping.Mapping;
import com.marklogic.hub.util.FileUtil;
import org.custommonkey.xmlunit.XMLAssert;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.Assert;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class LegacyFlowRunnerTest extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");

    @BeforeEach
    public void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);
        deleteProjectDir();
        createProjectDir();
        enableDebugging();
        enableTracing();

        scaffolding.createEntity(ENTITY);
        clearUserModules();
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    @Test
    public void testPassOptions() throws IOException, ParserConfigurationException, SAXException {
        scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
                CodeFormat.XQUERY, DataFormat.XML, false);
        Files.copy(getResourceStream("flow-runner-test/collector.xqy"),
                projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize/collector.xqy"),
                StandardCopyOption.REPLACE_EXISTING);
        Files.copy(getResourceStream("flow-runner-test/content-for-options.xqy"),
                projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize/content.xqy"),
                StandardCopyOption.REPLACE_EXISTING);

        installUserModules(getHubAdminConfig(), false);


        LegacyFlow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
                FlowType.HARMONIZE);
        HashMap<String, Object> options = new HashMap<>();
        options.put("name", "Bob Smith");
        options.put("age", 55);
        LegacyFlowRunner flowRunner = fm.newFlowRunner()
                .withFlow(harmonizeFlow)
                .withBatchSize(10)
                .withThreadCount(1)
                .withOptions(options);
        flowRunner.run();
        flowRunner.awaitCompletion();

        EvalResultIterator resultItr = runInDatabase("xdmp:database('" + HubConfig.DEFAULT_FINAL_NAME + "')", HubConfig.DEFAULT_FINAL_NAME);
        String targetDB = resultItr.next().getString();
        String expected =
                "<envelope xmlns=\"http://marklogic.com/entity-services\">\n" +
                        "  <headers></headers>\n" +
                        "  <triples></triples>\n" +
                        "  <instance>\n" +
                        "   <info>\n" +
                        "     <title>Person</title>\n" +
                        "     <version>0.0.2</version>\n" +
                        "   </info>\n" +
                        "    <Person xmlns=\"\">\n" +
                        "      <name>Bob Smith</name>\n" +
                        "      <age>55</age>\n" +
                        "      <entity>e2eentity</entity>\n" +
                        "      <flow>testharmonize</flow>\n" +
                        "      <flowType>harmonize</flowType>\n" +
                        "      <dataFormat>xml</dataFormat>\n" +
                        "      <target-database>" + targetDB + "</target-database>\n" +
                        "    </Person>\n" +
                        "  </instance>\n" +
                        "  <attachments><original xmlns=\"\">data</original></attachments>\n" +
                        "</envelope>";

        String actual = finalDocMgr.read("1.xml").next().getContent(new StringHandle()).get();

        assertXMLEqual(expected, actual);
    }

    // bug DHFPROD-500, attachments showing up in two places
    @Test
    public void testEnvelopeSJS() throws IOException {
        scaffolding.createFlow(ENTITY, "testharmonize-sjs-json", FlowType.HARMONIZE,
                CodeFormat.JAVASCRIPT, DataFormat.JSON, false);
        //testing sjs JSON canonical instance
        Files.copy(getResourceStream("flow-runner-test/collector.sjs"),
                projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-sjs-json/collector.sjs"),
                StandardCopyOption.REPLACE_EXISTING);
        Files.copy(getResourceStream("flow-runner-test/contentTestingEnvelope.sjs"),
                projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-sjs-json/content.sjs"),
                StandardCopyOption.REPLACE_EXISTING);

        installUserModules(getHubAdminConfig(), false);


        LegacyFlow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize-sjs-json",
                FlowType.HARMONIZE);
        LegacyFlowRunner flowRunner = fm.newFlowRunner()
                .withFlow(harmonizeFlow)
                .withBatchSize(10)
                .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        JsonNode jsonEnvelope = finalDocMgr.read("1.json").next().getContent(new JacksonHandle()).get();

        try {
            logger.debug(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(jsonEnvelope));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        assertNull(jsonEnvelope.get("envelope").get("instance").get("Person").get("$attachments"));
        assertNotNull(jsonEnvelope.get("envelope").get("attachments"));
    }

    @Test
    public void testEnvelopeXQY() throws IOException {

        //testing xqy JSON canonical instance
        scaffolding.createFlow(ENTITY, "testharmonize-xqy-json", FlowType.HARMONIZE,
                CodeFormat.XQUERY, DataFormat.JSON, false);
        Files.copy(getResourceStream("flow-runner-test/collector2.xqy"),
                projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-xqy-json/collector.xqy"),
                StandardCopyOption.REPLACE_EXISTING);
        Files.copy(getResourceStream("flow-runner-test/content-testing-envelope.xqy"),
                projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-xqy-json/content.xqy"),
                StandardCopyOption.REPLACE_EXISTING);

        installUserModules(getHubAdminConfig(), false);

        LegacyFlow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize-xqy-json",
                FlowType.HARMONIZE);
        LegacyFlowRunner flowRunner = fm.newFlowRunner()
                .withFlow(harmonizeFlow)
                .withBatchSize(10)
                .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        JsonNode jsonEnvelope = finalDocMgr.read("2.json").next().getContent(new JacksonHandle()).get();

        try {
            logger.debug(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(jsonEnvelope));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        assertNull(jsonEnvelope.get("envelope").get("instance").get("Person").get("$attachments"));
        assertNotNull(jsonEnvelope.get("envelope").get("attachments"));
    }

    // bug DHFPROD-500, attachments showing up in two places
    @Test
    public void testEnvelopeSJSXML() throws IOException, SAXException {
        scaffolding.createFlow(ENTITY, "testharmonize-sjs-xml", FlowType.HARMONIZE,
                CodeFormat.JAVASCRIPT, DataFormat.XML, false);

        Files.copy(getResourceStream("flow-runner-test/collector2.sjs"),
                projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-sjs-xml/collector.sjs"),
                StandardCopyOption.REPLACE_EXISTING);
        Files.copy(getResourceStream("flow-runner-test/contentTestingEnvelope.sjs"),
                projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-sjs-xml/content.sjs"),
                StandardCopyOption.REPLACE_EXISTING);

        installUserModules(getHubAdminConfig(), false);


        LegacyFlow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize-sjs-xml",
                FlowType.HARMONIZE);
        LegacyFlowRunner flowRunner = fm.newFlowRunner()
                .withFlow(harmonizeFlow)
                .withBatchSize(10)
                .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        String expected =
                "<envelope xmlns=\"http://marklogic.com/entity-services\">\n" +
                        "  <headers></headers>\n" +
                        "  <triples></triples>\n" +
                        "  <instance>\n" +
                        "   <info>\n" +
                        "     <title>Person</title>\n" +
                        "     <version>0.0.1</version>\n" +
                        "   </info>\n" +
                        "    <Person xmlns=\"\">\n" +
                        "       <an>instance</an>\n" +
                        "       <document>that</document>\n" +
                        "       <is>not</is>\n" +
                        "       <harmononized>yeah</harmononized>\n" +
                        "    </Person>\n" +
                        "  </instance>\n" +
                        "  <attachments><and xmlns=\"\">originaldochere</and></attachments>\n" +
                        "</envelope>";

        String actual = finalDocMgr.read("2.xml").next().getContentAs(String.class);
        //logger.debug(expected);
        //logger.debug(actual);
        XMLAssert.assertXMLEqual(expected, actual);

    }

    @Test
    public void testCreateandDeployFlowWithHubUser() throws IOException {
        Assumptions.assumeFalse(getHubAdminConfig().getIsProvisionedEnvironment());

        scaffolding.createFlow(ENTITY, "FlowWithHubUser", FlowType.HARMONIZE,
                CodeFormat.XQUERY, DataFormat.JSON, false);
        Files.copy(getResourceStream("flow-runner-test/collector2.xqy"),
                projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/FlowWithHubUser/collector.xqy"),
                StandardCopyOption.REPLACE_EXISTING);
        Files.copy(getResourceStream("flow-runner-test/content-testing-envelope.xqy"),
                projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/FlowWithHubUser/content.xqy"),
                StandardCopyOption.REPLACE_EXISTING);
        try {
            installUserModules(getHubFlowRunnerConfig(), false);
        }
        catch(Exception e) {
            Assert.assertTrue(e.getMessage().toUpperCase().contains("SEC-URIPRIV:"));
        }
        //The flow should not be deployed.
        assertNull(getModulesFile("/entities/"+ENTITY+"/harmonize/FlowWithHubUser/FlowWithHubUser.xml"));

        Path entityDir = projectDir.resolve("plugins").resolve("entities").resolve(ENTITY);
        copyFile("e2e-test/" + ENTITY + ".entity.json", entityDir.resolve(ENTITY + ".entity.json"));
        try {
            installUserModules(getHubFlowRunnerConfig(), false);
        }
        catch(Exception e) {
            Assert.assertTrue(e.getMessage().toUpperCase().contains("SEC-URIPRIV:"));
        }
        getHubAdminConfig();
        assertNull(getModulesFile("/entities/"+ENTITY+".entity.json"));
        //deploys the entity to final db
        installUserModules(getHubAdminConfig(), false);

        ObjectMapper mapper = new ObjectMapper();
        Mapping testMap = Mapping.create("test");
        testMap.setDescription("This is a test.");
        testMap.setSourceContext("//");
        testMap.setTargetEntityType(ENTITY);
        HashMap<String, ObjectNode> mappingProperties = new HashMap<>();
        mappingProperties.put("id", mapper.createObjectNode().put("sourcedFrom", "id"));
        mappingProperties.put("name", mapper.createObjectNode().put("sourcedFrom", "name"));
        mappingProperties.put("salary", mapper.createObjectNode().put("sourcedFrom", "salary"));
        mappingManager.saveMapping(testMap);

        try {
            installUserModules(getHubFlowRunnerConfig(), false);
        }
        catch(Exception e) {
            Assert.assertTrue(e.getMessage().toUpperCase().contains("SEC-URIPRIV:"));
        }
        // Mapping should not be deployed
        assertFalse(finalDocMgr.read("/mappings/test/test-1.mapping.json").hasNext());
        // Deploys mapping to final db
        installUserModules(getHubAdminConfig(), true);

        scaffolding.createFlow(ENTITY, "MappingFlowWithHubUser", FlowType.HARMONIZE, CodeFormat.JAVASCRIPT, DataFormat.XML, true, "test-1");
        try {
            installUserModules(getHubFlowRunnerConfig(), false);
        }
        catch(Exception e) {
            Assert.assertTrue(e.getMessage().toUpperCase().contains("SEC-URIPRIV:"));
        }
        assertNull(getModulesFile("/entities/"+ENTITY+"/harmonize/MappingFlowWithHubUser/MappingFlowWithHubUser.xml"));
    }

    private void copyFile(String srcDir, Path dstDir) {
        FileUtil.copy(getResourceStream(srcDir), dstDir.toFile());
    }
}
