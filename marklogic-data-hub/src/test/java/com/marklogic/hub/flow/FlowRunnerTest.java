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
package com.marklogic.hub.flow;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
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
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.stream.XMLStreamException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.EXECUTE;
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.READ;
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.UPDATE;
import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class FlowRunnerTest extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");

    @BeforeEach
    public void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);
        deleteProjectDir();
        createProjectDir();
        enableDebugging();
        enableTracing();

        getDataHubAdminConfig(); // to set the deployement user back to dhf-admin-user
        scaffolding.createEntity(ENTITY);
        clearUserModules();
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    private void addStagingDocs() {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        meta.getPermissions().add(getDataHubAdminConfig().getFlowOperatorRoleName(), READ, UPDATE, EXECUTE);
        installStagingDoc("/employee1.xml", meta, "flow-runner-test/input/employee1.xml");
        installStagingDoc("/employee2.xml", meta, "flow-runner-test/input/employee2.xml");
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

        installUserModules(getDataHubAdminConfig(), false);


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

        installUserModules(getDataHubAdminConfig(), false);


        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize-sjs-json",
                FlowType.HARMONIZE);
        FlowRunner flowRunner = fm.newFlowRunner()
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

        installUserModules(getDataHubAdminConfig(), false);

        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize-xqy-json",
                FlowType.HARMONIZE);
        FlowRunner flowRunner = fm.newFlowRunner()
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

        installUserModules(getDataHubAdminConfig(), false);


        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize-sjs-xml",
                FlowType.HARMONIZE);
        FlowRunner flowRunner = fm.newFlowRunner()
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
    public void testRunFlowNamespaceXMLSJS() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        addStagingDocs();

        scaffolding.createFlow(ENTITY, "testharmonize-sjs-ns-xml", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.XML, false);

        Files.copy(getResourceStream("flow-runner-test/my-test-flow-ns-xml-sjs/collector.sjs"),
            projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-sjs-ns-xml/collector.sjs"),
            StandardCopyOption.REPLACE_EXISTING);
        Files.copy(getResourceStream("flow-runner-test/my-test-flow-ns-xml-sjs/content.sjs"),
            projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-sjs-ns-xml/content.sjs"),
            StandardCopyOption.REPLACE_EXISTING);
        Files.copy(getResourceStream("flow-runner-test/my-test-flow-ns-xml-sjs/triples.sjs"),
            projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-sjs-ns-xml/triples.sjs"),
            StandardCopyOption.REPLACE_EXISTING);
        Files.copy(getResourceStream("flow-runner-test/my-test-flow-ns-xml-sjs/headers.sjs"),
            projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-sjs-ns-xml/headers.sjs"),
            StandardCopyOption.REPLACE_EXISTING);

        installUserModules(getDataHubAdminConfig(), false);


        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize-sjs-ns-xml",
            FlowType.HARMONIZE);
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        String expected = "<envelope xmlns=\"http://marklogic.com/entity-services\">\n" +
            "  <headers>\n" +
            "    <value xmlns=\"\">1234</value>\n" +
            "  </headers>\n" +
            "  <triples>\n" +
            "    <sem:triple xmlns:sem=\"http://marklogic.com/semantics\">\n" +
            "      <sem:subject>subject</sem:subject>\n" +
            "      <sem:predicate>predicate</sem:predicate>\n" +
            "      <sem:object>object</sem:object>\n" +
            "    </sem:triple>\n" +
            "  </triples>\n" +
            "  <instance>\n" +
            "    <info>\n" +
            "      <title>Person</title>\n" +
            "      <version>0.0.1</version>\n" +
            "    </info>\n" +
            "    <prs:Person xmlns:prs=\"http://marklogic.com/Person\">\n" +
            "      <prs:Id>2</prs:Id>\n" +
            "    </prs:Person>\n" +
            "  </instance>\n" +
            "  <attachments>\n" +
            "  </attachments>\n" +
            "</envelope>";

        String actual = finalDocMgr.read("/employee2.xml").next().getContentAs(String.class);
        //logger.debug(expected);
        //logger.debug(actual);
        XMLAssert.assertXMLEqual(expected, actual);
    }

    @Test
    public void testRunFlowNamespaceXMLXQY() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        addStagingDocs();

        scaffolding.createFlow(ENTITY, "testharmonize-xqy-ns-xml", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML, false);

        Files.copy(getResourceStream("flow-runner-test/my-test-flow-ns-xml-xqy/collector.xqy"),
            projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-xqy-ns-xml/collector.xqy"),
            StandardCopyOption.REPLACE_EXISTING);
        Files.copy(getResourceStream("flow-runner-test/my-test-flow-ns-xml-xqy/content.xqy"),
            projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-xqy-ns-xml/content.xqy"),
            StandardCopyOption.REPLACE_EXISTING);
        Files.copy(getResourceStream("flow-runner-test/my-test-flow-ns-xml-xqy/triples.xqy"),
            projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-xqy-ns-xml/triples.xqy"),
            StandardCopyOption.REPLACE_EXISTING);
        Files.copy(getResourceStream("flow-runner-test/my-test-flow-ns-xml-xqy/headers.xqy"),
            projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize/testharmonize-xqy-ns-xml/headers.xqy"),
            StandardCopyOption.REPLACE_EXISTING);

        installUserModules(getDataHubAdminConfig(), false);


        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize-xqy-ns-xml",
            FlowType.HARMONIZE);
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        String expected = "<envelope xmlns=\"http://marklogic.com/entity-services\">\n" +
            "  <headers>\n" +
            "    <value xmlns=\"\">1234</value>\n" +
            "  </headers>\n" +
            "  <triples>\n" +
            "    <sem:triple xmlns:sem=\"http://marklogic.com/semantics\">\n" +
            "      <sem:subject>subject</sem:subject>\n" +
            "      <sem:predicate>predicate</sem:predicate>\n" +
            "      <sem:object>object</sem:object>\n" +
            "    </sem:triple>\n" +
            "  </triples>\n" +
            "  <instance>\n" +
            "    <info>\n" +
            "      <title>Person</title>\n" +
            "      <version>0.0.1</version>\n" +
            "    </info>\n" +
            "    <prs:Person xmlns:prs=\"http://marklogic.com/Person\">\n" +
            "      <prs:Id>2</prs:Id>\n" +
            "    </prs:Person>\n" +
            "  </instance>\n" +
            "  <attachments>\n" +
            "  </attachments>\n" +
            "</envelope>";

        String actual = finalDocMgr.read("/employee2.xml").next().getContentAs(String.class);
        //logger.debug(expected);
        //logger.debug(actual);
        XMLAssert.assertXMLEqual(expected, actual);
    }

    @Test
    public void testCreateandDeployFlowWithHubUser() throws IOException {

        Assumptions.assumeFalse(getDataHubAdminConfig().getIsProvisionedEnvironment());
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
        getDataHubAdminConfig();
        assertNull(getModulesFile("/entities/"+ENTITY+".entity.json"));
        //deploys the entity to final db
        installUserModules(getDataHubAdminConfig(), false);

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
        installUserModules(getDataHubAdminConfig(), true);

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
