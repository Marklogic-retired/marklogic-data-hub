/*
 * Copyright 2012-2018 MarkLogic Corporation
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
package com.marklogic.hub;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Vector;
import java.util.concurrent.TimeUnit;

import org.custommonkey.xmlunit.XMLUnit;
import org.json.JSONException;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.junit.platform.runner.JUnitPlatform;
import org.junit.runner.RunWith;
import org.skyscreamer.jsonassert.Customization;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.skyscreamer.jsonassert.ValueMatcher;
import org.skyscreamer.jsonassert.comparator.CustomComparator;
import org.w3c.dom.Document;

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
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.mapping.Mapping;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.Installer;


@RunWith(JUnitPlatform.class)
public class MappingE2E extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");
    private static final int TEST_SIZE = 20;
    private static final int BATCH_SIZE = 10;
    private FlowManager flowManager;
    private DataMovementManager stagingDataMovementManager;
    private MappingManager mappingManager;
    private boolean installDocsFinished = false;
    private boolean installDocsFailed = false;
    private String installDocError;
    private List<String> modelProperties;
    private Scaffolding scaffolding;
    private List<String> allMappings;

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().installHubOnce();
    }

    @AfterAll
    public static void teardown() {
        new Installer().uninstallHub();
    }

    private static boolean isSetup = false;
    @BeforeEach
    public void setupEach() {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
        createProjectDir();
        mappingManager = MappingManager.getMappingManager(getHubConfig());
        enableTracing();
        enableDebugging();
        if (!isSetup) {
            isSetup = true;
            scaffolding = Scaffolding.create(projectDir.toString(), finalClient);
            scaffolding.createEntity(ENTITY);

            Path entityDir = projectDir.resolve("plugins").resolve("entities").resolve(ENTITY);
            copyFile("e2e-test/" + ENTITY + ".entity.json", entityDir.resolve(ENTITY + ".entity.json"));

            if (modelProperties == null) {
    	        ObjectMapper objectMapper = new ObjectMapper();
    	     	JsonNode rootNode = null;
    			try {
    				rootNode = objectMapper.readTree(getHubConfig().getHubEntitiesDir().resolve(ENTITY).resolve(ENTITY+".entity.json").toFile());
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

            allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            	if(flowType.equals(FlowType.HARMONIZE)) {
            		for(String mapping: allMappings) {
            			int version = mappingManager.getMapping(mapping).getVersion();
            			for(int i = 1 ; i<=version; i++) {
            				createFlow("mapping", codeFormat, dataFormat, flowType, useEs, mapping, i, null);
            			}

            		}
            	}
            });
            flowManager = FlowManager.create(getHubConfig());
            installUserModules(getHubConfig(), true);
            stagingDataMovementManager = stagingClient.newDataMovementManager();
        }
    }

    @TestFactory
    public List<DynamicTest> generateTests() {
    	List<DynamicTest> tests = new ArrayList<>();
    	for(String mapping: allMappings) {
	    	allCombos((codeFormat, dataFormat, flowType, useEs) -> {
	    		if(useEs && flowType.equals(FlowType.HARMONIZE)) {
	    			String prefix = "mapping";
	    		    int version = mappingManager.getMapping(mapping).getVersion();

		            String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, mapping, version);

		            Map<String, Object> options = new HashMap<>();
		            tests.add(DynamicTest.dynamicTest(flowName , () -> {
		            	FinalCounts finalCounts = new FinalCounts(TEST_SIZE, TEST_SIZE * 2, TEST_SIZE + 1, 1, TEST_SIZE, 0, TEST_SIZE, 0, TEST_SIZE/BATCH_SIZE, 0, "FINISHED");
		                //This is a failing test, so finalCounts changed accordingly
		            	if(codeFormat.equals(CodeFormat.XQUERY) && flowName.contains("empty-sourceContext")) {
		                	 finalCounts = new FinalCounts(TEST_SIZE, 0 , TEST_SIZE + 1, 1, 0, TEST_SIZE , 0, TEST_SIZE, 0,TEST_SIZE/BATCH_SIZE,  "FAILED");
		                }
		               // Run flow for the mapping with whose version is 2.
		                if(version == 2) {
		                	testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true, mapping, 1);
		               }
		               testHarmonizeFlow(prefix, codeFormat, dataFormat, useEs, options, stagingClient, HubConfig.DEFAULT_FINAL_NAME, finalCounts, true, mapping, version);
		            }));

	    		}
	    	});
    	}
        return tests;
    }

    private String getFlowName(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, String mapping, int version) {
        return prefix + "-" + flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString() + "-" + mapping+"-"+version ;
    }


    private void createFlow(String prefix, CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEs, String mapping, int  version, CreateFlowListener listener) {
    	if(useEs && flowType.equals(FlowType.HARMONIZE)) {
    		String flowName = getFlowName(prefix, codeFormat, dataFormat, flowType, mapping, version);
	        Path entityDir = projectDir.resolve("plugins").resolve("entities").resolve(ENTITY);
	        Path flowDir = entityDir.resolve(flowType.toString()).resolve(flowName);

	        copyFile("e2e-test/" + ENTITY + ".entity.json", entityDir.resolve(ENTITY + ".entity.json"));
	        installUserModules(getHubConfig(), true);

	        scaffolding.createFlow(ENTITY, flowName, flowType, codeFormat, dataFormat, true, mapping + "-" +version);

	        String srcDir = "e2e-test/" + codeFormat.toString() + "-flow/";
	        copyFile(srcDir + "collector." + codeFormat.toString(), flowDir.resolve("collector." + codeFormat.toString()));
            copyFile(srcDir + "writer." + codeFormat.toString(), flowDir.resolve("writer." + codeFormat.toString()));
	        if (listener != null) {
	            listener.onFlowCreated(codeFormat, dataFormat, flowType, srcDir, flowDir, true);
	        }
    	}
    }

    private void createMappings() {
    	allMappings = new ArrayList<String>();
    	Map<String, String> sourceContexts = new HashMap<>();
    	sourceContexts.put("validPath", "//validtest/");
    	sourceContexts.put("nonExistentPath", "//test1/validtest/");
    	sourceContexts.put("inCorrectPath", "//invalidtest/");


    	String targetEntity = "http://marklogic.com/example/Schema-0.0.1/e2eentity";
    	Map<String, String> properties = new HashMap<>();
    	properties.put("oneProp","empid");
    	properties.put("threeProp","empid,fullname,monthlysalary");
    	properties.put("nonExistingProp", "fakeprop1");
    	properties.put("nonMatchingCanonicalProp", "empid,fullname");

        for (Entry<String,String> sourceContext : sourceContexts.entrySet()) {
        	for (Entry<String,String> property : properties.entrySet()) {
        		String mapName = sourceContext.getKey()+"-"+property.getKey();
        		allMappings.add(mapName);
                createMapping(mapName, sourceContext.getValue(), targetEntity , property.getValue().split(","));
        	}
        }
        // Corner/ Invalid cases
        createMapping("empty-sourceContext", null,"http://marklogic.com/example/Schema-0.0.1/e2eentity", "empid,fullname,monthlysalary".split(","));
        createMapping("without-sourcedFrom", "//validtest/","http://marklogic.com/example/Schema-0.0.1/e2eentity",  "empid,fullname,monthlysalary".split(","));
        createMapping("empty-properties", "//validtest/","http://marklogic.com/example/Schema-0.0.1/e2eentity", new String[1]);
        createMapping("diff-entity-validPath", "//validtest/","http://marklogic.com/example/Schema-0.0.1/fakeentity", "empid,fullname,monthlysalary".split(","));
        //Create another version of existing mapping
        createMapping("validPath-threeProp", "//validtest/","http://marklogic.com/example/Schema-0.0.1/e2eentity", true, "empid,fullname,monthlysalary".split(","));
        allMappings.addAll(Arrays.asList("empty-sourceContext,empty-properties,diff-entity-validPath,without-sourcedFrom".split(",")));
        installUserModules(getHubConfig(), true);
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
          		}
          		//non-existing property in canonical model
          		else if(name.contains("nonMatchingCanonicalProp")) {
          			mappingProperties.put("id1", mapper.createObjectNode().put("sourcedFrom", "empid"));
          			mappingProperties.put("name1", mapper.createObjectNode().put("sourcedFrom", "fullname"));
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
        FileUtil.copy(getResourceStream(srcDir), dstDir.toFile());
    }

    private void installDocs(DataFormat dataFormat, String collection, DatabaseClient srcClient) {
        DataMovementManager mgr = srcClient.newDataMovementManager();

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
        StringHandle handle = new StringHandle(getResource("e2e-test/" + filename + "." + dataFormat.toString()));
        String dataFormatString = dataFormat.toString();
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + "." + dataFormatString, metadataHandle, handle);
        }

        writeBatcher.flushAndWait();
        assertTrue(installDocsFinished, "Doc install not finished");
        assertFalse(installDocsFailed, "Doc install failed: " + installDocError);

        if (srcClient.getDatabase().equals(HubConfig.DEFAULT_STAGING_NAME)) {
            assertEquals(TEST_SIZE, getStagingDocCount(collection));
            assertEquals(0, getFinalDocCount(collection));
        }
        else {
            assertEquals(TEST_SIZE, getFinalDocCount(collection));
            assertEquals(0, getStagingDocCount(collection));
        }
    }
    private Tuple<FlowRunner, JobTicket> runHarmonizeFlow(
        String flowName, DataFormat dataFormat,
        Vector<String> completed, Vector<String> failed,
        Map<String, Object> options,
        DatabaseClient srcClient, String destDb,
        boolean waitForCompletion)
    {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);

        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());
        assertEquals(0, getJobDocCount());

        installDocs(dataFormat, ENTITY, srcClient);

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, flowName, FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
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
        return new Tuple<>(flowRunner, jobTicket);
    }

    private void testHarmonizeFlow(
        String prefix, CodeFormat codeFormat, DataFormat dataFormat, boolean useEs,
        Map<String, Object> options, DatabaseClient srcClient, String destDb,
        FinalCounts finalCounts, boolean waitForCompletion, String mapping, int version) throws InterruptedException {

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
        String flowName = getFlowName(prefix, codeFormat, dataFormat, FlowType.HARMONIZE, mapping, version);

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        Tuple<FlowRunner, JobTicket> tuple = runHarmonizeFlow(flowName, dataFormat, completed, failed, options, srcClient, destDb, waitForCompletion);

        if (waitForCompletion) {
            // takes a little time to run.
            Thread.sleep(2000);
            int stagingCount = getStagingDocCount();
            int finalCount = getFinalDocCount();
            int tracingCount = getTracingDocCount();
            int jobsCount = getJobDocCount();

            assertEquals(finalCounts.stagingCount, stagingCount);
            assertEquals(finalCounts.finalCount, finalCount);
            assertEquals(finalCounts.tracingCount, tracingCount);
            assertEquals(finalCounts.jobCount, jobsCount);

            assertEquals(finalCounts.completedCount, completed.size());
            assertEquals(finalCounts.failedCount, failed.size());

            GenericDocumentManager mgr = finalDocMgr;
            if (destDb.equals(HubConfig.DEFAULT_STAGING_NAME)) {
                mgr = stagingDocMgr;
            }

            String filename = "mapping/final-es";

            if(flowName.contains("oneProp")) {
            	filename = "mapping/final-es-oneProp";
            }
            if(! flowName.contains("validPath") || flowName.contains("non")) {
            	filename = "mapping/final-es-empty";
            }
            if (! flowName.contains("empty-sourceContext")) {
	            if (dataFormat.equals(DataFormat.XML)) {
	                Document expected = getXmlFromResource("e2e-test/" + filename + ".xml");
	                for (int i = 0; i < TEST_SIZE; i+=10) {
	                    Document actual = mgr.read("/input-" + i + ".xml").next().getContent(new DOMHandle()).get();
	                    //debugOutput(expected, System.out);
                        //debugOutput(actual, System.out);
	                    assertXMLEqual(expected, actual);
	                }
	            } else {
	                String expected = getResource("e2e-test/" + filename + "." + dataFormat.toString());
	                for (int i = 0; i < TEST_SIZE; i+=10) {
	                    String actual = mgr.read("/input-" + i + "." + dataFormat.toString()).next().getContent(new StringHandle()).get();
	                    //ignoring for now
	                    try {
							JSONAssert.assertEquals(expected, actual,
							new CustomComparator(JSONCompareMode.STRICT,
					                Customization.customization("envelope.instance.e2eentity",
					                                            new ValueMatcher<Object>() {
					                  @Override public boolean equal(Object o1, Object o2) {
					                    return true;
					                  }
					                })));
						} catch (JSONException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
	                }
	            }
            }
            // inspect the job json
            JsonNode node = jobDocMgr.read("/jobs/" + tuple.y.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
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
}
