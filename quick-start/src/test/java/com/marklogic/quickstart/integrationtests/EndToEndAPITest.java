package com.marklogic.quickstart.integrationtests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.quickstart.model.entity_services.EntityModel;

import io.restassured.RestAssured;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class EndToEndAPITest extends HubTestBase {

	@LocalServerPort
	int port;

	private IntegrationUtils utils = new IntegrationUtils();
	
	// Project Initialization variables
	boolean projectInitStatus;
	JsonPath projectInitJson;
	Response projectInitResponse;
	String projectPath;
	
	// Login Process variables
	String loginResponse;
	
	// Clear Database variables
	Response clearDbResponse;
	
	// Database stats variables
	JsonPath statsJson;
	Response statsResponse;
	
	// Create Entities variables
	JSONObject createEntityJsonObj;
	JsonPath getEntitiesJson;
	List<EntityModel> entitiesList;
	Response createEntityResponse;
	Response getEnitiesResponse;
	String createEntityJsonBody;
	String entityName;
	String responseEntityTitle;
	
	// Flow process variables
	JsonPath createInputFlowJson;
	JsonPath createHarmonizeFlowJSON;
	JsonNode mlcpOptions;
	JsonNode runHmJsonObj;
	Map<String, Object> runFlowOptions;
	Response createInputFlowResponse;
	Response runIpFlowResponse;
	Response createHarmonizeFlowResponse;
	Response runHmFlowResponse;
	Response deleteFlowResponse;
	String flowType;
	String respFlowName;
	String respEntityName;
	String respFlowType;
	String pluginDir;
	String inputPath;
	String basePath;
	String runHmJsonBody;
	
	// Map Creation variables
	JsonNode mappingDataJsonNode;
	JsonNode editMapRequestNode;
	Response getMappingResponse;
	Response createMapResponse;
	String mapName;
	String mappingData;
	
	// Job Status variables
	JsonNode jobResultsNode;
	Response getJobsResponse;
	
	@BeforeAll
	public void setUp() {
		createProjectDir();
	}

	@AfterAll
	public void tearDown() {
		deleteProjectDir();
	}

	@Before
	public void serverSetup() {
		RestAssured.port = port;
	}

	@Test
	public void modelMappingE2ETests() throws JSONException, IOException, InterruptedException {
		
		// Tests api's to initialize the project folder and set the environment configuration
		projectInitResponse = utils.initilizeProjectConfiguration();
		projectInitJson = projectInitResponse.jsonPath();
		projectInitStatus =  projectInitJson.getBoolean("initialized");
		projectPath =  projectInitJson.getString("path");
		
		assertEquals(200, projectInitResponse.statusCode());
		assertTrue(projectInitStatus);
		assertTrue(projectPath.contains("marklog-data-hub-develop/marklogic-data-hub/quick-start/ye-olde-project"));
		System.out.println("projectInitResponse: "+ projectInitResponse.asString());
		System.out.println("Project Init Test Passed");
		
		// Tests api's to login into the quick-start application. A session cookie is received in
		// header which has to be attached to the subsequent requests for security
		loginResponse = utils.doLogin();
		
		assertTrue(!loginResponse.isEmpty());
		System.out.println("Login Test Passed");
		
		// Clear all the documents in the databases
		clearDbResponse = utils.clearAllDatabases();
		
		assertEquals(200, clearDbResponse.statusCode());
		System.out.println("Clear DB's test passed");
		
		// Test api's to check the database names and the number of documents available in each database
		statsResponse = utils.getDocStats();
		statsJson = statsResponse.jsonPath();
		
		assertEquals(200, statsResponse.statusCode());
		assertEquals(0, statsJson.getInt("stagingCount"));
		assertEquals(0, statsJson.getInt("finalCount"));
		assertEquals(0, statsJson.getInt("jobCount"));
		assertEquals(0, statsJson.getInt("traceCount"));
		assertEquals("data-hub-STAGING", statsJson.get("stagingDb"));
		assertEquals("data-hub-FINAL", statsJson.get("finalDb"));
		assertEquals("data-hub-JOBS", statsJson.get("jobDb"));
		assertEquals("data-hub-JOBS", statsJson.get("traceDb"));
		System.out.println("Stats Test Passed");
		
		// Test api's to create new entities
		createEntityJsonBody = getResource("integration-test-data/create-entity-model.json");
		createEntityJsonObj = new JSONObject(createEntityJsonBody);
		entityName = createEntityJsonObj.getJSONObject("info").getString("title");
		createEntityResponse = utils.createEntity(createEntityJsonBody, entityName);
		responseEntityTitle = createEntityResponse.jsonPath().getString("info.title");
		
		assertEquals(200, createEntityResponse.statusCode());
		assertTrue(responseEntityTitle.equals(entityName));
		System.out.println("createEntityResponse: "+ createEntityResponse.asString());
		System.out.println("Create Entities Test Passed");
		
		// Get the list of entities and verify if entities are created
		getEnitiesResponse = utils.getAllEntities();
		getEntitiesJson = getEnitiesResponse.jsonPath();
		entitiesList = getEntitiesJson.getList("", EntityModel.class);
		responseEntityTitle = entitiesList.get(0).getInfo().getTitle();
		
		assertEquals(200, getEnitiesResponse.statusCode());
		assertEquals(1, entitiesList.size());
		assertTrue(responseEntityTitle.equals(entityName));
		System.out.println("Verify Entities Test Passed");
		
		// Test API's for creation on input flows.
		flowType = "INPUT";
		createInputFlowResponse = utils.createFlow(entityName, flowType, DataFormat.JSON, 
				CodeFormat.JAVASCRIPT, false, null);
		createInputFlowJson = createInputFlowResponse.jsonPath();
		respFlowName = createInputFlowJson.getString("flowName");
		respEntityName = createInputFlowJson.getString("entityName");
		respFlowType = createInputFlowJson.getString("flowType");
		pluginDir = createInputFlowJson.getString("plugins.pluginPath");
		
		assertEquals(200, createInputFlowResponse.statusCode());
		assertTrue(utils.getFlowName().equals(respFlowName));
		assertTrue(entityName.equals(respEntityName));
		assertTrue(flowType.equals(respFlowType));
		assertTrue(pluginDir.contains("/"+respFlowName+"/content.sjs"));
		System.out.println("Create Input Flow test passed");
		utils.waitForReloadModules();
		
		// Test API's for running the input flow created 
		runFlowOptions = new HashMap<>();
		inputPath = getResourceFile("integration-test-data/input/input" + "." + DataFormat.JSON.toString())
				.getAbsolutePath();
        basePath = getResourceFile("integration-test-data/input").getAbsolutePath();
		mlcpOptions = utils.generateMLCPOptions(inputPath, basePath, entityName, "",
				CodeFormat.JAVASCRIPT, DataFormat.JSON, runFlowOptions);
		runIpFlowResponse = utils.runFlow(mlcpOptions, entityName, FlowType.INPUT);
		assertEquals(204, runIpFlowResponse.statusCode());
		System.out.println("Run Input Flow Test Passed");
		utils.waitForReloadModules();
		
		// Checking if the staging database has 1 document after input flow.
		statsResponse = utils.getDocStats();
		statsJson = statsResponse.jsonPath();
		
		assertEquals(200, statsResponse.statusCode());
		assertEquals(1, statsJson.getInt("stagingCount"));
		assertEquals(1, statsJson.getInt("finalCount"));
		
		// Test API's to fetch if a given specific mapping exists
		mapName = "map1";
		getMappingResponse = utils.getMap(mapName);
		
		assertEquals(500, getMappingResponse.statusCode());
		
		// Test API's to create a map with a name
		mappingData = getResource("integration-test-data/mapping-data.json");
		mappingDataJsonNode = new ObjectMapper().readTree(mappingData);
		((ObjectNode) mappingDataJsonNode).put("name", mapName);
		createMapResponse = utils.createMap(mapName, mappingDataJsonNode);
		assertEquals(200, createMapResponse.statusCode());
		utils.waitForReloadModules();
		
		// The map created has the wrong mapping data. The harmonization flow which
		// is created with this map should fail when run. Test API's for creation on harmonize flows.
		flowType = "HARMONIZE";
		createHarmonizeFlowResponse = utils.createFlow(entityName, flowType, DataFormat.JSON, 
				CodeFormat.JAVASCRIPT, true, mapName);
		createHarmonizeFlowJSON = createHarmonizeFlowResponse.jsonPath();
		respFlowName = createHarmonizeFlowJSON.getString("flowName");
		respEntityName = createHarmonizeFlowJSON.getString("entityName");
		respFlowType = createHarmonizeFlowJSON.getString("flowType");
		pluginDir = createHarmonizeFlowJSON.getString("plugins.pluginPath");
		
		assertEquals(200, createHarmonizeFlowResponse.statusCode());
		assertTrue(utils.getFlowName().equals(respFlowName));
		assertTrue(entityName.equals(respEntityName));
		assertTrue(flowType.equals(respFlowType));
		assertTrue(pluginDir.contains("/"+respFlowName+"/content.sjs"));
		System.out.println("Create Harmonize Flow Passed");
		
		utils.waitForReloadModules();
		
		// Tests to run the created harmonize flow
		runHmJsonBody = getResource("integration-test-data/run-harm-flow-request.json");
		runHmJsonObj = new ObjectMapper().readTree(runHmJsonBody);
		runHmFlowResponse = utils.runFlow(runHmJsonObj, entityName, FlowType.HARMONIZE);
		assertEquals(200, runHmFlowResponse.statusCode());
		
		// Tests to check job status. Job status should not be FINISHED.
		getJobsResponse = utils.getJobs(1, 10);
		jobResultsNode = new ObjectMapper().readTree(getJobsResponse.asString()).get("results");
		if(jobResultsNode.isArray()) {
			for(JsonNode node : jobResultsNode) {
				if(node.path("content").path("flowName").asText().equals(respFlowName)) {
					assertFalse(node.path("content").path("status").asText().equals("FINISHED"));
				}
			}
		}
		System.out.println("Run Harmonize Flow test Passed");		
		utils.waitForReloadModules();
		
		// Test to delete this harmonization flow.
		deleteFlowResponse = utils.deleteFlow(entityName, respFlowName, flowType);
		assertEquals(204, deleteFlowResponse.statusCode());
		
		// Edit the map and verify if the data is correct. To do this, get the map
		// edit the map and save it. Next step is to get the map and verify the 
		// version of the map.
		getMappingResponse = utils.getMap(mapName);
		assertEquals(200, getMappingResponse.statusCode());
		
		mappingData = getMappingResponse.asString();
		mappingDataJsonNode = new ObjectMapper().readTree(mappingData);
		editMapRequestNode = mappingDataJsonNode.path("properties").path("price");
		((ObjectNode) editMapRequestNode).put("sourcedFrom", "price");
		createMapResponse = utils.createMap(mapName, mappingDataJsonNode);
		assertEquals(200, createMapResponse.statusCode());
		
		getMappingResponse = utils.getMap(mapName);
		assertEquals(200, getMappingResponse.statusCode());
		assertEquals(2, getMappingResponse.jsonPath().getInt("version"));
		assertTrue(mapName.equals(getMappingResponse.jsonPath().get("name")));
		utils.waitForReloadModules();
		
		// Test API's for creation on harmonize flows.
		flowType = "HARMONIZE";
		createHarmonizeFlowResponse = utils.createFlow(entityName, flowType, DataFormat.JSON, 
				CodeFormat.JAVASCRIPT, true, mapName);
		createHarmonizeFlowJSON = createHarmonizeFlowResponse.jsonPath();
		respFlowName = createHarmonizeFlowJSON.getString("flowName");
		respEntityName = createHarmonizeFlowJSON.getString("entityName");
		respFlowType = createHarmonizeFlowJSON.getString("flowType");
		pluginDir = createHarmonizeFlowJSON.getString("plugins.pluginPath");
		
		assertEquals(200, createHarmonizeFlowResponse.statusCode());
		assertTrue(utils.getFlowName().equals(respFlowName));
		assertTrue(entityName.equals(respEntityName));
		assertTrue(flowType.equals(respFlowType));
		assertTrue(pluginDir.contains("/"+respFlowName+"/content.sjs"));
		System.out.println("Create Harmonize Flow Passed");
		utils.waitForReloadModules();
		
		// Next step is to run the created harmonize flow
		runHmJsonBody = getResource("integration-test-data/run-harm-flow-request.json");
		runHmJsonObj = new ObjectMapper().readTree(runHmJsonBody);
		runHmFlowResponse = utils.runFlow(runHmJsonObj, entityName, FlowType.HARMONIZE);
		
		assertEquals(200, runHmFlowResponse.statusCode());
		System.out.println("Run Harmonize Flow test Passed");
		utils.waitForReloadModules();
		
		// Checking job status
		getJobsResponse = utils.getJobs(1, 10);
		jobResultsNode = new ObjectMapper().readTree(getJobsResponse.asString()).get("results");
		if(jobResultsNode.isArray()) {
			for(JsonNode node : jobResultsNode) {
				if(node.path("content").path("flowName").asText().equals(respFlowName)) {
					assertTrue(node.path("content").path("status").asText().equals("FINISHED"));
				}
			}
		}
		
		// Checking if the staging database has 1 document after input flow.
		statsResponse = utils.getDocStats();
		statsJson = statsResponse.jsonPath();
		assertEquals(200, statsResponse.statusCode());
		assertEquals(1, statsJson.getInt("stagingCount"));
		assertEquals(4, statsJson.getInt("finalCount"));
		System.out.println("--------");
		System.out.println("Waiting for other threads to complete");
		
		// Using thread sleep to make the main thread wait for the thread which 
		// is installing user modules. Need to make wait the main thread for
		// completion of the thread running installUserModules().
		utils.waitForReloadModules();
	}
}
