package com.marklogic.quickstart.integrationtests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.mapping.Mapping;
import com.marklogic.quickstart.model.entity_services.EntityModel;

import io.restassured.RestAssured;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class EndToEndAPITest {

	@LocalServerPort
	int port;

	private E2ETestsRequestHelper requestHelper = new E2ETestsRequestHelper();
	static final protected Logger logger = LoggerFactory.getLogger(EndToEndAPITest.class);

	// Project Initialization variables
	boolean projectInitStatus;
	JsonPath projectInitJson;
	Path projectPath;
	Response projectInitResponse;

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
	JsonNode runHarmonizeFlowJsonObj;
	Map<String, Object> runFlowOptions;
	Response createInputFlowResponse;
	Response createHarmonizeFlowResponse;
	Response deleteFlowResponse;
	Response runInputFlowResponse;
	Response runHarmonizeFlowResponse;
	String basePath;
	String flowType;
	String inputPath;
	String responseEntityName;
	String responseFlowName;
	String responseFlowType;
	String runHarmonizeJsonBody;

	// Map Creation variables
	JsonNode editMapRequestNode;
	JsonNode mappingDataJsonNode;
	List<Mapping> maps;
	List<String> mapNames;
	Response createMapResponse;
	Response getMappingResponse;
	Response getMapNamesResponse;
	Response deleteMapResponse;
	String mapName;
	String mappingData;

	// Job Status variables
	JsonNode jobResultsNode;
	Response getJobsResponse;

	@BeforeAll
	public void setUp() {
		requestHelper.createProjectDir();
	}

	@AfterAll
	public void tearDown() {
		requestHelper.deleteProjectDir();
	}

	@Before
	public void serverSetup() {
		RestAssured.port = port;
	}

	@Test
	public void modelMappingE2ETests() throws JSONException, IOException, InterruptedException {

		// Tests api's to initialize the project folder and set the environment configuration
		projectInitResponse = requestHelper.initilizeProjectConfiguration();
		projectInitJson = projectInitResponse.jsonPath();
		projectInitStatus =  projectInitJson.getBoolean("initialized");
		projectPath =  Paths.get(projectInitJson.getString("path"));
		assertEquals(200, projectInitResponse.statusCode());
		assertTrue(projectInitStatus);
		assertTrue(Files.exists(projectPath));
		logger.info("Project Init Test Passed");

		// Tests api's to login into the quick-start application. A session cookie is received in
		// header which has to be attached to the subsequent requests for security
		loginResponse = requestHelper.doLogin();

		assertFalse(loginResponse.isEmpty());
		logger.info("Login Test Passed");

		// Clear all the documents in the databases
		clearDbResponse = requestHelper.clearAllDatabases();

		assertEquals(200, clearDbResponse.statusCode());
		logger.info("Clear DB's test passed");

		// Test api's to check the database names and the number of documents available in each database
		statsResponse = requestHelper.getDocStats();
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
		logger.info("Stats Test Passed");

		// Test api's to create new entities
		createEntityJsonBody = requestHelper.getResourceFileContent("integration-test-data/create-entity-model.json");
		createEntityJsonObj = new JSONObject(createEntityJsonBody);
		entityName = createEntityJsonObj.getJSONObject("info").getString("title");
		createEntityResponse = requestHelper.createEntity(createEntityJsonBody, entityName);
		responseEntityTitle = createEntityResponse.jsonPath().getString("info.title");

		assertEquals(200, createEntityResponse.statusCode());
		assertTrue(responseEntityTitle.equals(entityName));
		logger.info("Create Entities Test Passed");

		// Get the list of entities and verify if entities are created
		getEnitiesResponse = requestHelper.getAllEntities();
		getEntitiesJson = getEnitiesResponse.jsonPath();
		entitiesList = getEntitiesJson.getList("", EntityModel.class);
		responseEntityTitle = entitiesList.get(0).getInfo().getTitle();

		assertEquals(200, getEnitiesResponse.statusCode());
		assertEquals(1, entitiesList.size());
		assertTrue(responseEntityTitle.equals(entityName));
		logger.info("Verify Entities Test Passed");

		// Test API's for creation on input flows.
		flowType = "INPUT";
		createInputFlowResponse = requestHelper.createFlow(entityName, flowType, DataFormat.JSON,
				CodeFormat.JAVASCRIPT, false, null);
		createInputFlowJson = createInputFlowResponse.jsonPath();
		responseFlowName = createInputFlowJson.getString("flowName");
		responseEntityName = createInputFlowJson.getString("entityName");
		responseFlowType = createInputFlowJson.getString("flowType");

		assertEquals(200, createInputFlowResponse.statusCode());
		assertTrue(requestHelper.getFlowName().equals(responseFlowName));
		assertTrue(entityName.equals(responseEntityName));
		assertTrue(flowType.equals(responseFlowType));
		logger.info("Create Input Flow test passed");
		requestHelper.waitForReloadModules();

		// Test API's for running the input flow created
		runFlowOptions = new HashMap<>();
		inputPath = requestHelper.getResourceFilePath("integration-test-data/input/input" + "." + DataFormat.JSON.toString());
		basePath = requestHelper.getResourceFilePath("integration-test-data/input");
		mlcpOptions = requestHelper.generateMLCPOptions(inputPath, basePath, entityName, "",
				CodeFormat.JAVASCRIPT, DataFormat.JSON, runFlowOptions);
		runInputFlowResponse = requestHelper.runFlow(mlcpOptions, entityName, FlowType.INPUT);
		assertEquals(204, runInputFlowResponse.statusCode());
		logger.info("Run Input Flow Test Passed");
		requestHelper.waitForReloadModules();

		// Checking if the staging database has 1 document after input flow.
		statsResponse = requestHelper.getDocStats();
		statsJson = statsResponse.jsonPath();

		assertEquals(200, statsResponse.statusCode());
		assertEquals(1, statsJson.getInt("stagingCount"));
		assertEquals(1, statsJson.getInt("finalCount"));

		// Test API's to fetch if a given specific mapping exists
		mapName = requestHelper.createMapName();
		getMappingResponse = requestHelper.getMap(mapName);

		assertEquals(404, getMappingResponse.statusCode());

		// Test API's to create a map with a name
		mappingData = requestHelper.getResourceFileContent("integration-test-data/mapping-data.json");
		mappingDataJsonNode = new ObjectMapper().readTree(mappingData);
		((ObjectNode) mappingDataJsonNode).put("name", mapName);
		createMapResponse = requestHelper.createMap(mapName, mappingDataJsonNode);
		assertEquals(200, createMapResponse.statusCode());
		logger.info("Create Map test passed");
		requestHelper.waitForReloadModules();

		// Create a second Map
		mapName = requestHelper.createMapName();
		mappingData = requestHelper.getResourceFileContent("integration-test-data/mapping-data.json");
		mappingDataJsonNode = new ObjectMapper().readTree(mappingData);
		((ObjectNode) mappingDataJsonNode).put("name", mapName);
		createMapResponse = requestHelper.createMap(mapName, mappingDataJsonNode);
		assertEquals(200, createMapResponse.statusCode());
		logger.info("Create Map test passed");
		requestHelper.waitForReloadModules();

		// Test API'S to Get List of Maps
		getMapNamesResponse = requestHelper.getMapNames();
		maps = getMapNamesResponse.jsonPath().getList("$");
		assertEquals(200, getMapNamesResponse.statusCode());
		assertEquals(2, maps.size());

		// Test API's to Delete a map
		deleteMapResponse = requestHelper.deleteMap(mapName);

		// Check if the map is deleted by getting list of names of the maps
		getMapNamesResponse = requestHelper.getMapNames();
		mapNames = getMapNamesResponse.jsonPath().getList("$");

		assertEquals(204, deleteMapResponse.statusCode());
		assertEquals(200, getMapNamesResponse.statusCode());
		assertEquals(1, mapNames.size());
		assertFalse(mapNames.contains(mapName));
		mapName = mapNames.get(0);
		logger.info("Delete a map test passed");

		// The map created has the wrong mapping data. The harmonization flow which
		// is created with this map should fail when run. Test API's for creation on harmonize flows.
		flowType = "HARMONIZE";
		createHarmonizeFlowResponse = requestHelper.createFlow(entityName, flowType, DataFormat.JSON,
				CodeFormat.JAVASCRIPT, true, mapName);
		createHarmonizeFlowJSON = createHarmonizeFlowResponse.jsonPath();
		responseFlowName = createHarmonizeFlowJSON.getString("flowName");
		responseEntityName = createHarmonizeFlowJSON.getString("entityName");
		responseFlowType = createHarmonizeFlowJSON.getString("flowType");

		assertEquals(200, createHarmonizeFlowResponse.statusCode());
		assertTrue(requestHelper.getFlowName().equals(responseFlowName));
		assertTrue(entityName.equals(responseEntityName));
		assertTrue(flowType.equals(responseFlowType));
		logger.info("Create Harmonize Flow Passed");

		requestHelper.waitForReloadModules();

		// Tests to run the created harmonize flow
		runHarmonizeJsonBody = requestHelper.getResourceFileContent("integration-test-data/run-harm-flow-request.json");
		runHarmonizeFlowJsonObj = new ObjectMapper().readTree(runHarmonizeJsonBody);
		runHarmonizeFlowResponse = requestHelper.runFlow(runHarmonizeFlowJsonObj, entityName, FlowType.HARMONIZE);
		assertEquals(200, runHarmonizeFlowResponse.statusCode());

		// Tests to check job status. Job status should not be FINISHED.
		getJobsResponse = requestHelper.getJobs(1, 10);
		jobResultsNode = new ObjectMapper().readTree(getJobsResponse.asString()).get("results");
		if(jobResultsNode.isArray()) {
			for(JsonNode node : jobResultsNode) {
				if(node.path("content").path("flowName").asText().equals(responseFlowName)) {
					assertFalse(node.path("content").path("status").asText().equals("FINISHED"));
				}
			}
		}
		logger.info("Run Harmonize Flow test for incorrect mapping passed");
		requestHelper.waitForReloadModules();

		// Test to delete this harmonization flow.
		deleteFlowResponse = requestHelper.deleteFlow(entityName, responseFlowName, flowType);
		assertEquals(204, deleteFlowResponse.statusCode());
		logger.info("Delete Flow test passed");

		// Edit the map and verify if the data is correct. To do this, get the map
		// edit the map and save it. Next step is to get the map and verify the
		// version of the map.
		getMappingResponse = requestHelper.getMap(mapName);
		assertEquals(200, getMappingResponse.statusCode());

		mappingData = getMappingResponse.asString();
		mappingDataJsonNode = new ObjectMapper().readTree(mappingData);
		editMapRequestNode = mappingDataJsonNode.path("properties").path("price");
		((ObjectNode) editMapRequestNode).put("sourcedFrom", "price");
		createMapResponse = requestHelper.createMap(mapName, mappingDataJsonNode);
		assertEquals(200, createMapResponse.statusCode());

		getMappingResponse = requestHelper.getMap(mapName);
		assertEquals(200, getMappingResponse.statusCode());
		assertEquals(1, getMappingResponse.jsonPath().getInt("version"));
		assertTrue(mapName.equals(getMappingResponse.jsonPath().get("name")));
		logger.info("Get Map info test passed");
		requestHelper.waitForReloadModules();

		// Test API's for creation on harmonize flows.
		flowType = "HARMONIZE";
		createHarmonizeFlowResponse = requestHelper.createFlow(entityName, flowType, DataFormat.JSON,
				CodeFormat.JAVASCRIPT, true, mapName);
		createHarmonizeFlowJSON = createHarmonizeFlowResponse.jsonPath();
		responseFlowName = createHarmonizeFlowJSON.getString("flowName");
		responseEntityName = createHarmonizeFlowJSON.getString("entityName");
		responseFlowType = createHarmonizeFlowJSON.getString("flowType");

		assertEquals(200, createHarmonizeFlowResponse.statusCode());
		assertTrue(requestHelper.getFlowName().equals(responseFlowName));
		assertTrue(entityName.equals(responseEntityName));
		assertTrue(flowType.equals(responseFlowType));
		logger.info("Create Harmonize Flow Passed");
		requestHelper.waitForReloadModules();

		// Next step is to run the created harmonize flow
		runHarmonizeJsonBody = requestHelper.getResourceFileContent("integration-test-data/run-harm-flow-request.json");
		runHarmonizeFlowJsonObj = new ObjectMapper().readTree(runHarmonizeJsonBody);
		runHarmonizeFlowResponse = requestHelper.runFlow(runHarmonizeFlowJsonObj, entityName, FlowType.HARMONIZE);

		assertEquals(200, runHarmonizeFlowResponse.statusCode());
		logger.info("Run Harmonize Flow test Passed for correct mapping data");
		requestHelper.waitForReloadModules();

		// Checking job status
		getJobsResponse = requestHelper.getJobs(1, 10);
		jobResultsNode = new ObjectMapper().readTree(getJobsResponse.asString()).get("results");
		if(jobResultsNode.isArray()) {
			for(JsonNode node : jobResultsNode) {
				if(node.path("content").path("flowName").asText().equals(responseFlowName)) {
					assertTrue(node.path("content").path("status").asText().equals("FINISHED"));
				}
			}
		}
		logger.info("Get Jobs Data test passed");

		// Checking if the staging database has 1 document after input flow.
		statsResponse = requestHelper.getDocStats();
		statsJson = statsResponse.jsonPath();
		assertEquals(200, statsResponse.statusCode());
		assertEquals(1, statsJson.getInt("stagingCount"));
		assertEquals(5, statsJson.getInt("finalCount"));

		// Using thread sleep to make the main thread wait for the thread which
		// is installing user modules. Need to make wait the main thread for
		// completion of the thread running installUserModules()
		requestHelper.waitForReloadModules();
	}
}
