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
package com.marklogic.hub_integration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.MappingManager;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.legacy.LegacyFlowManager;
import com.marklogic.hub.legacy.flow.*;
import com.marklogic.hub.mapping.Mapping;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.w3c.dom.Document;

import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.Map.Entry;
import java.util.concurrent.TimeUnit;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.jupiter.api.Assertions.*;

// TestFactory doesn't play nice with support for parallel tests yet, so forcing same thread execution
@Execution(ExecutionMode.SAME_THREAD)
public class MappingE2E extends AbstractHubCoreTest {

    private static final String ENTITY = "e2eentity";
    private static final int TEST_SIZE = 20;
    private static final int BATCH_SIZE = 10;

    @Autowired
    LegacyFlowManager flowManager;

    private boolean installDocsFinished = false;
    private boolean installDocsFailed = false;
    private String installDocError;
    private List<String> modelProperties;

    @Autowired
    Scaffolding scaffolding;

    @Autowired
    MappingManager mappingManager;

    private static boolean isSetup = false;
    private DatabaseClient flowRunnerClient;

    @BeforeEach
    public void setupEach() {
        runAsFlowOperator();
        flowRunnerClient = getHubClient().getStagingClient();
        runAsFlowDeveloper();

        enableTracing();
        enableDebugging();
        if (!isSetup) {
            isSetup = true;
            scaffolding.createEntity(ENTITY);
            Path entityDir = getHubProject().getProjectDir().resolve("entities");
            copyFile("e2e-test/" + ENTITY + ".entity.json", entityDir.resolve(ENTITY + ".entity.json"));
            installUserModules(runAsFlowDeveloper(), true);
            if (modelProperties == null) {
    	        ObjectMapper objectMapper = new ObjectMapper();
    	     	JsonNode rootNode = null;
    			try {
    				rootNode = objectMapper.readTree(getHubProject().getHubEntitiesDir().resolve(ENTITY+".entity.json").toFile());
    			} catch (JsonProcessingException e) {
    			      throw new RuntimeException(e);
    			} catch (IOException e) {
    			      throw new RuntimeException(e);
    			}
    	        Iterator<Entry<String, JsonNode>> itr = rootNode.get("definitions").get(ENTITY).get("properties").fields();
    	        modelProperties = new ArrayList<>();
    	        while(itr.hasNext()) {
    	        	modelProperties.add(itr.next().getKey());
    	        }
            }
            createMappings();

            copyFile("e2e-test/" + ENTITY + ".entity.json", entityDir.resolve(ENTITY + ".entity.json"));
            installUserModules(getHubConfig(), true);
            allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            	if(flowType.equals(FlowType.HARMONIZE)) {
            		for(String mapping:getMappings()) {
            			int version = mappingManager.getMapping(mapping).getVersion();
            			for(int i = 1 ; i<=version; i++) {
            				createFlow("mapping", codeFormat, dataFormat, flowType, useEs, mapping, i, null);
            			}

            		}
            	}
            });
            //Flows with xml docs having processing instructions/comments
            createFlow("extranodes", CodeFormat.XQUERY, DataFormat.XML, FlowType.HARMONIZE, true,"validPath1-threeProp", 1, (CreateFlowListener)null);
            createFlow("extranodes", CodeFormat.JAVASCRIPT, DataFormat.XML, FlowType.HARMONIZE, true, "validPath1-threeProp", 1, (CreateFlowListener)null);
            installUserModules(getHubConfig(), true);
        }
    }

    @TestFactory
    public List<DynamicTest> generateTests() {
    	List<DynamicTest> tests = new ArrayList<>();
    	//Flows with xml docs having processing instructions/comments
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String prefix = "extranodes";
            String mapping = "validPath1-threeProp";
            int version = 1;
            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, mapping, version);
            if (flowType.equals(FlowType.HARMONIZE) && useEs && dataFormat.equals(DataFormat.XML)) {
	            tests.add(DynamicTest.dynamicTest(flowName , () -> {
	                Map<String, Object> options = new HashMap<>();
	                FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE * 2, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE/BATCH_SIZE, 0, "FINISHED");
	                testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true, mapping, version);
	            }));
	        }
        });

    	for(String mapping: getMappings()) {
	    	allCombos((codeFormat, dataFormat, flowType, useEs) -> {
	    		if(useEs && flowType.equals(FlowType.HARMONIZE)) {
	    			String prefix = "mapping";
	    		    int version = mappingManager.getMapping(mapping).getVersion();
		            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, mapping, version);
		            Map<String, Object> options = new HashMap<>();
		            //if(flowName.contains("validPath")&&codeFormat.equals(CodeFormat.JAVASCRIPT)&&dataFormat.equals(DataFormat.XML))
		            tests.add(DynamicTest.dynamicTest(flowName , () -> {
		            	FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE * 2, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE/BATCH_SIZE, 0, "FINISHED");
		                //This is a failing test, so finalCounts changed accordingly
		            	if(codeFormat.equals(CodeFormat.XQUERY) && flowName.contains("empty-sourceContext")) {
		                	 finalCounts = new FinalCounts(TEST_SIZE, 0 , TEST_SIZE + 1, 1, 0, TEST_SIZE , 0, TEST_SIZE, 0,TEST_SIZE/BATCH_SIZE,  "FAILED");
		                }
		               // Run flow for the mapping with whose version is 2.
		                if(version == 2) {
		                	testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true, mapping, 1);
		               }
		               testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, flowRunnerClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true, mapping, version);

		            }));
	    		}
	    	});
    	}
        return tests;
    }

    private List<String> getMappings() {
    	Path mappingDir = getHubProject().getHubMappingsDir();
    	List<String> allMappings = new ArrayList<>();
    	try {
    		Files.walk(mappingDir).filter(f->Files.isDirectory(f)).forEach(f -> allMappings.add(f.getFileName().toString()));

		} catch (IOException e) {
		      throw new RuntimeException(e);
		}
    	//remove "mappings" form the list
    	allMappings.remove(0);
    	return allMappings;
    }

    private String getFlowName(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, String mapping, int version) {
        return prefix + "-" + flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString() + "-" + mapping+"-"+version ;
    }

    private void createFlow(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEs, String mapping, int  version, CreateFlowListener listener) {
    	if(useEs && flowType.equals(FlowType.HARMONIZE)) {
    		String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, mapping, version);
    		Path entityDir = getHubProject().getProjectDir().resolve("plugins").resolve("entities").resolve(ENTITY);
    		Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);

	        scaffolding.createLegacyFlow(ENTITY, flowName, flowType, codeFormat, dataFormat, true, mapping + "-" +version);

	        String srcDir = "e2e-test/" + codeFormat.toString() + "-flow/";
	        copyFile(srcDir + "collector." + codeFormat.toString(), flowDir.resolve("collector." + codeFormat.toString()));
            copyFile(srcDir + "writer." + codeFormat.toString(), flowDir.resolve("writer." + codeFormat.toString()));
	        if (listener != null) {
	            listener.onFlowCreated(codeFormat, dataFormat, flowType, srcDir, flowDir, true);
	        }
    	}
    }

    private void createMappings() {
    	List<String> allMappings = new ArrayList<String>();
    	Map<String, String> sourceContexts = new HashMap<>();
    	sourceContexts.put("validPath1", "//*:validtest/*:");
    	sourceContexts.put("validPath2", "/*:test/*:validtest/*:");
    	sourceContexts.put("validPath3", "//*:validtestns/*:");
    	sourceContexts.put("validPath4", "/*:test/*[name()='validtestns']/*:");

    	String targetEntity = "http://marklogic.com/example/Schema-0.0.1/e2eentity";
    	Map<String, String> properties = new HashMap<>();
    	//properties.put("twoProp","empid,fullname");
    	properties.put("threeProp","empid,fullname,monthlysalary");
    	properties.put("nonExistingProp", "fakeprop1");


        for (Entry<String,String> sourceContext : sourceContexts.entrySet()) {
        	for (Entry<String,String> property : properties.entrySet()) {
        		String mapName = sourceContext.getKey()+"-"+property.getKey();
        		allMappings.add(mapName);
                createMapping(mapName, sourceContext.getValue(), targetEntity , property.getValue().split(","));
        	}
        }

        // Corner/ Invalid cases
        createMapping("nonExistentPath", "//test1/validtest/","http://marklogic.com/example/Schema-0.0.1/e2eentity", "empid,fullname,monthlysalary".split(","));
        createMapping("inCorrectPath", "//invalidtestns/","http://marklogic.com/example/Schema-0.0.1/e2eentity",  "empid,fullname,monthlysalary".split(","));
        createMapping("empty-sourceContext", null,"http://marklogic.com/example/Schema-0.0.1/e2eentity", "empid,fullname,monthlysalary".split(","));

        createMapping("default-without-sourcedFrom", "/","http://marklogic.com/example/Schema-0.0.1/e2eentity",  "empid,fullname,monthlysalary".split(","));
        createMapping("default-no-properties", "//*:validtest/*:","http://marklogic.com/example/Schema-0.0.1/e2eentity");

        createMapping("diff-entity-validPath", "//*:validtest/*:","http://marklogic.com/example/Schema-0.0.1/e2eentity", "empid,fullname,monthlysalary".split(","));
        //Create another version of existing mapping
        createMapping("validPath1-threeProp", "//*:validtest/*:","http://marklogic.com/example/Schema-0.0.1/e2eentity", true, "empid,fullname,monthlysalary".split(","));
        allMappings.addAll(Arrays.asList("nonExistentPath,inCorrectPath,empty-sourceContext,default-without-sourcedFrom,default-no-properties,diff-entity-validPath".split(",")));

        installUserModules(runAsFlowDeveloper(), true);
    }

    private void createMapping(String name, String sourceContext, String targetEntityType,  String ... properties) {
    	createMapping(name, sourceContext, targetEntityType, false,  properties);
    }

    private void createMapping(String name, String sourceContext, String targetEntityType, boolean incrementVersion,  String ... properties) {
		ObjectMapper mapper = new ObjectMapper();
		Mapping testMap = Mapping.create(name);
		testMap.setDescription("This is a test.");
		testMap.setSourceContext(sourceContext);
		testMap.setTargetEntityType(targetEntityType);
		HashMap<String, ObjectNode> mappingProperties = new HashMap<>();
		for(String property:properties) {
		    if(property == null) {
		    	mappingProperties.put("id", (ObjectNode)null);
		    }
		    else {
		    	//non-existing property in source doc
		    	if(property.equals("fakeprop1")) {
		    		mappingProperties.put("id", mapper.createObjectNode().put("sourcedFrom", "fakeprop1"));
		    		mappingProperties.put("name", mapper.createObjectNode().put("sourcedFrom", "fakeprop1"));
		    		mappingProperties.put("salary", mapper.createObjectNode().put("sourcedFrom", "fakeprop1"));
		      	}
		    	else if(name.contains("without-sourcedFrom")) {
		    		//do nothing
		      	}
		    	else {
		    		String key = modelProperties.stream().filter(str -> property.contains(str)).findFirst().get();
		    		mappingProperties.put(key, mapper.createObjectNode().put("sourcedFrom", property));
		    	}
		    }
		}
		if(!name.contains("without-sourcedFrom")) {
			testMap.setProperties(mappingProperties);
		}
		mappingManager.saveMapping(testMap, incrementVersion);
    }

    private void copyFile(String srcDir, Path dstDir) {
        InputStream inputStream = getResourceStream(srcDir);
        FileUtil.copy(inputStream, dstDir.toFile());
        IOUtils.closeQuietly(inputStream);
    }

    private void installDocs(String flowName, DataFormat dataFormat, String collection, DatabaseClient srcClient) {
        DataMovementManager mgr;
        mgr = srcClient.newDataMovementManager();

        WriteBatcher writeBatcher = mgr.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4)
            .onBatchSuccess(batch -> installDocsFinished = true)
            .onBatchFailure((batch, failure) -> {
                failure.printStackTrace();
                installDocError = failure.getMessage();
                installDocsFailed = true;
            });

        installDocsFinished = false;
        installDocsFailed = false;
        mgr.startJob(writeBatcher);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add(collection);
        String filename = "mapping/staging-es";
        if(flowName.contains("extranodes")) {
        	filename = filename.concat("-extranodes");
        }
        StringHandle handle = new StringHandle(getResource("e2e-test/" + filename + "." + dataFormat.toString()));
        String dataFormatString = dataFormat.toString();
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + "." + dataFormatString, metadataHandle, handle);
        }

        writeBatcher.flushAndWait();
        assertTrue(installDocsFinished, "Doc install not finished");
        assertFalse(installDocsFailed, "Doc install failed: " + installDocError);
    }

    private Tuple<LegacyFlowRunner, JobTicket> runHarmonizeFlow(
        String flowName, DataFormat dataFormat,
        Vector<String> completed, Vector<String> failed,
        Map<String, Object> options,
        DatabaseClient srcClient, String destDb,
        boolean waitForCompletion)
    {
        resetDatabases();
        runAsFlowDeveloper();

        installDocs(flowName, dataFormat, ENTITY, srcClient);
        runAsFlowOperator();
        LegacyFlow harmonizeFlow = flowManager.getFlow(ENTITY, flowName, FlowType.HARMONIZE);

        LegacyFlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .withOptions(options)
            .withSourceClient(srcClient)
            .withDestinationDatabase(destDb)
            .onItemComplete((String jobId, String itemId) -> {
               completed.add(itemId);
            })
            .onItemFailed((String jobId, String itemId) -> {
               failed.add(itemId);
            });

        JobTicket jobTicket = flowRunner.run();
        if (waitForCompletion) {
            flowRunner.awaitCompletion();
        }
        else {
            try {
                flowRunner.awaitCompletion(2, TimeUnit.MILLISECONDS);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
        }
        runAsFlowDeveloper();
        return new Tuple<>(flowRunner, jobTicket);
    }

    private void testHarmonizeFlow(
        String prefix, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs,
        Map<String, Object> options, DatabaseClient srcClient, String destDb,
        FinalCounts finalCounts, boolean waitForCompletion, String mapping, int version) throws InterruptedException {

        resetDatabases();
        runAsFlowDeveloper();

        String flowName = getFlowName(prefix, codeFormat, dataFormat, FlowType.HARMONIZE, mapping, version);

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        final int originalStagingCount = getStagingDocCount();
        final int originalFinalCount = getFinalDocCount();
        final int originalJobsCount = getJobDocCount();

        Tuple<LegacyFlowRunner, JobTicket> tuple = runHarmonizeFlow(flowName, dataFormat, completed, failed, options, srcClient, destDb, waitForCompletion);

        if (waitForCompletion) {
            // takes a little time to run.
            sleep(2000);

            assertEquals(finalCounts.stagingCount + originalStagingCount, getStagingDocCount());
            assertEquals(finalCounts.finalCount + originalFinalCount, getFinalDocCount());
            assertEquals(finalCounts.jobCount + originalJobsCount, getJobDocCount());

            assertEquals(finalCounts.completedCount, completed.size());
            assertEquals(finalCounts.failedCount, failed.size());

            GenericDocumentManager mgr = destDb.equals(HubConfig.DEFAULT_STAGING_NAME) ?
                getHubClient().getStagingClient().newDocumentManager() :
                getHubClient().getFinalClient().newDocumentManager();

            String filename = null;

            if(flowName.contains("validPath")) {
            	filename = "mapping/final-es";
            	if(flowName.contains("extranodes")) {
            		filename = filename.concat("-extranodes");
            	}
                if(flowName.contains("validPath3") || flowName.contains("validPath4")) {
                	filename = filename.concat("-1");
                }
            }
            else {
            	filename = "mapping/final-es-empty";
            }

            if(flowName.contains("nonExistingProp")) {
            	filename = "mapping/final-es-empty";
            }
            if(! (codeFormat.equals(CodeFormat.XQUERY) && flowName.contains("empty-sourceContext"))) {
	            if (dataFormat.equals(DataFormat.XML)) {
	                Document expected = getXmlFromResource("e2e-test/" + filename + ".xml");
	                for (int i = 0; i < TEST_SIZE; i+=10) {
	                    Document actual = mgr.read("/input-" + i + ".xml").next().getContent(new DOMHandle()).get();
	                    debugOutput(expected, System.out);
                        debugOutput(actual, System.out);

	                    assertXMLEqual(expected, actual);
	                }
	            } else {
	                String expected = getResource("e2e-test/" + filename + "." + dataFormat.toString());
	                for (int i = 0; i < TEST_SIZE; i+=10) {
	                    String actual = mgr.read("/input-" + i + "." + dataFormat.toString()).next().getContent(new StringHandle()).get();
	                    assertJsonEqual(expected, actual, true);
	                }
	            }
            }
            // inspect the job json
            JsonNode node = getHubClient().getJobsClient().newDocumentManager().read("/jobs/" + tuple.y.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
            assertEquals(tuple.y.getJobId(), node.get("jobId").asText());
            assertEquals(finalCounts.jobSuccessfulEvents, node.get("successfulEvents").asInt());
            assertEquals(finalCounts.jobFailedEvents, node.get("failedEvents").asInt());
            assertEquals(finalCounts.jobSuccessfulBatches, node.get("successfulBatches").asInt());
            assertEquals(finalCounts.jobFailedBatches, node.get("failedBatches").asInt());
            assertEquals(finalCounts.jobStatus, node.get("status").asText());
        }
        else {
            assertNotEquals(TEST_SIZE, getFinalDocCount());
            tuple.x.awaitCompletion();
        }
    }

    private void debugOutput(Document xmldoc, OutputStream os) {
        try {
            TransformerFactory tf = TransformerFactory.newInstance();
            Transformer transformer = tf.newTransformer();
            transformer.setOutputProperty(OutputKeys.INDENT, "yes");
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
            transformer.transform(new DOMSource(xmldoc), new StreamResult(os));
        } catch (TransformerException e) {
            throw new DataHubConfigurationException(e);
        }
    }


}
