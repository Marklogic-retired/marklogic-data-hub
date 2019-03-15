package com.marklogic.hub.web.integrationtests;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.web.WebApplication;
import com.marklogic.hub.web.model.entity_services.EntityModel;
import io.restassured.RestAssured;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

// extendwith is the junit 5 way to run spring tests
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {WebApplication.class, ApplicationConfig.class})
public class EndToEndAPITest {

	@LocalServerPort
	int port;

	private E2ETestsRequestHelper requestHelper = new E2ETestsRequestHelper();
	static final protected Logger logger = LoggerFactory.getLogger(EndToEndAPITest.class);


	@BeforeEach
	public void setUp() {
        RestAssured.port = port;
		requestHelper.createProjectDir();
        requestHelper.clearUserModules();
	}

	@AfterEach
	public void tearDown() {
		requestHelper.deleteProjectDir();
	}

	@Test
	public void modelMappingE2ETests() throws JSONException, IOException, InterruptedException {

		// Tests api's to initialize the project folder and set the environment configuration
		Response projectInitResponse = requestHelper.initilizeProjectConfiguration();
		JsonPath projectInitJson = projectInitResponse.jsonPath();
		boolean projectInitStatus =  projectInitJson.getBoolean("initialized");
        Path projectPath =  Paths.get(projectInitJson.getString("path"));
		assertEquals(200, projectInitResponse.statusCode());
		assertTrue(projectInitStatus);
		assertTrue(Files.exists(projectPath));
		logger.info("Project Init Test Passed");

		// Tests api's to login into the quick-start application. A session cookie is received in
		// header which has to be attached to the subsequent requests for security
		String loginResponse = requestHelper.doLogin();

		assertFalse(loginResponse.isEmpty());
		logger.info("Login Test Passed");

		// Clear all the documents in the databases
		Response clearDbResponse = requestHelper.clearAllDatabases();

		assertEquals(200, clearDbResponse.statusCode());
		logger.info("Clear DB's test passed");

		// Test api's to check the database names and the number of documents available in each database
		Response statsResponse = requestHelper.getDocStats();
		JsonPath statsJson = statsResponse.jsonPath();

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
		String createEntityJsonBody = requestHelper.getResourceFileContent("integration-test-data/create-entity-model.json");
        JSONObject createEntityJsonObj = new JSONObject(createEntityJsonBody);
		String entityName = createEntityJsonObj.getJSONObject("info").getString("title");
		Response createEntityResponse = requestHelper.createEntity(createEntityJsonBody, entityName);
		String responseEntityTitle = createEntityResponse.jsonPath().getString("info.title");

		assertEquals(200, createEntityResponse.statusCode());
		assertTrue(responseEntityTitle.equals(entityName));
		logger.info("Create Entities Test Passed");

		// Get the list of entities and verify if entities are created
		Response getEnitiesResponse = requestHelper.getAllEntities();
        JsonPath getEntitiesJson = getEnitiesResponse.jsonPath();
        List<EntityModel> entitiesList = getEntitiesJson.getList("", EntityModel.class);
        responseEntityTitle = entitiesList.get(0).getInfo().getTitle();

		assertEquals(200, getEnitiesResponse.statusCode());
		assertEquals(1, entitiesList.size());
		assertTrue(responseEntityTitle.equals(entityName));
		logger.info("Verify Entities Test Passed");

		// Test API's for creation on input flows.
		String flowType = "INPUT";
		Response createInputFlowResponse = requestHelper.createFlow(entityName, flowType, DataFormat.JSON,
				CodeFormat.JAVASCRIPT, false, null);
		JsonPath createInputFlowJson = createInputFlowResponse.jsonPath();
		String responseFlowName = createInputFlowJson.getString("flowName");
		String responseEntityName = createInputFlowJson.getString("entityName");
		String responseFlowType = createInputFlowJson.getString("flowType");

		assertEquals(200, createInputFlowResponse.statusCode());
		assertTrue(requestHelper.getFlowName().equals(responseFlowName));
		assertTrue(entityName.equals(responseEntityName));
		assertTrue(flowType.equals(responseFlowType));
		logger.info("Create Input Flow test passed");
		requestHelper.waitForReloadModules();

		// Test API's for running the input flow created
		HashMap<String, Object> runFlowOptions = new HashMap<>();
		String inputPath = requestHelper.getResourceFilePath("integration-test-data/input/input" + "." + DataFormat.JSON.toString());
		String basePath = requestHelper.getResourceFilePath("integration-test-data/input");
		JsonNode mlcpOptions = requestHelper.generateMLCPOptions(inputPath, basePath, entityName, "",
				CodeFormat.JAVASCRIPT, DataFormat.JSON, runFlowOptions);
		Response runInputFlowResponse = requestHelper.runFlow(mlcpOptions, entityName, FlowType.INPUT);
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
		String mapName = requestHelper.createMapName();
		Response getMappingResponse = requestHelper.getMap(mapName);

		assertEquals(404, getMappingResponse.statusCode());

		// Test API's to create a map with a name
		String mappingData = requestHelper.getResourceFileContent("integration-test-data/mapping-data.json");
		JsonNode mappingDataJsonNode = new ObjectMapper().readTree(mappingData);
		((ObjectNode) mappingDataJsonNode).put("name", mapName);
		Response createMapResponse = requestHelper.createMap(mapName, mappingDataJsonNode);
		assertEquals(200, createMapResponse.statusCode());
		logger.info("Create Map test passed");
		requestHelper.waitForReloadModules();

		// Create maps with space and special character in mapping name and delete them
		mapName = requestHelper.createMapName()+" "+"test";
		mappingData = requestHelper.getResourceFileContent("integration-test-data/mapping-data.json");
		mappingDataJsonNode = new ObjectMapper().readTree(mappingData);
		((ObjectNode) mappingDataJsonNode).put("name", mapName);
		createMapResponse = requestHelper.createMap(mapName, mappingDataJsonNode);
		assertEquals(200, createMapResponse.statusCode());
		logger.info("Create Map test with space in mapping name passed");
		requestHelper.waitForReloadModules();
		Response deleteMapResponse = requestHelper.deleteMap(mapName);
		logger.info("Deleted Map with space in mapping name passed");

		mapName = requestHelper.createMapName()+"_"+"test";
		mappingData = requestHelper.getResourceFileContent("integration-test-data/mapping-data.json");
		mappingDataJsonNode = new ObjectMapper().readTree(mappingData);
		((ObjectNode) mappingDataJsonNode).put("name", mapName);
		createMapResponse = requestHelper.createMap(mapName, mappingDataJsonNode);
		assertEquals(200, createMapResponse.statusCode());
		logger.info("Create Map test with special charatcer in mapping name passed");
		requestHelper.waitForReloadModules();
		deleteMapResponse = requestHelper.deleteMap(mapName);
		logger.info("Delete Map test with special charatcer in mapping name passed");

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
		Response getMapNamesResponse = requestHelper.getMapNames();
		List<String> maps = getMapNamesResponse.jsonPath().getList("$");
		assertEquals(200, getMapNamesResponse.statusCode());
		assertEquals(2, maps.size());

		// Test API's to Delete a map
		deleteMapResponse = requestHelper.deleteMap(mapName);

		// Check if the map is deleted by getting list of names of the maps
		getMapNamesResponse = requestHelper.getMapNames();
		List<String> mapNames = getMapNamesResponse.jsonPath().getList("$");

		assertEquals(204, deleteMapResponse.statusCode());
		assertEquals(200, getMapNamesResponse.statusCode());
		assertEquals(1, mapNames.size());
		assertFalse(mapNames.contains(mapName));
		mapName = mapNames.get(0);
		logger.info("Delete a map test passed");

		// The map created has the wrong mapping data. The harmonization flow which
		// is created with this map should fail when run. Test API's for creation on harmonize flows.
		flowType = "HARMONIZE";
		Response createHarmonizeFlowResponse = requestHelper.createFlow(entityName, flowType, DataFormat.JSON,
				CodeFormat.JAVASCRIPT, true, mapName);
		JsonPath createHarmonizeFlowJSON = createHarmonizeFlowResponse.jsonPath();
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
		String runHarmonizeJsonBody = requestHelper.getResourceFileContent("integration-test-data/run-harm-flow-request.json");
		JsonNode runHarmonizeFlowJsonObj = new ObjectMapper().readTree(runHarmonizeJsonBody);
		Response runHarmonizeFlowResponse = requestHelper.runFlow(runHarmonizeFlowJsonObj, entityName, FlowType.HARMONIZE);
		assertEquals(200, runHarmonizeFlowResponse.statusCode());

		// Tests to check job status. Job status should not be FINISHED.

		Response getJobsResponse = requestHelper.getJobs(1, 10);
		JsonNode jobResultsNode = new ObjectMapper().readTree(getJobsResponse.asString()).get("results");
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
		Response deleteFlowResponse = requestHelper.deleteFlow(entityName, responseFlowName, flowType);
		assertEquals(204, deleteFlowResponse.statusCode());
		logger.info("Delete Flow test passed");

		// Edit the map and verify if the data is correct. To do this, get the map
		// edit the map and save it. Next step is to get the map and verify the
		// version of the map.
		getMappingResponse = requestHelper.getMap(mapName);
		assertEquals(200, getMappingResponse.statusCode());

		mappingData = getMappingResponse.asString();
		mappingDataJsonNode = new ObjectMapper().readTree(mappingData);
		JsonNode editMapRequestNode = mappingDataJsonNode.path("properties").path("price");
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
		assertEquals(7, statsJson.getInt("finalCount"));

		// Using thread sleep to make the main thread wait for the thread which
		// is installing user modules. Need to make wait the main thread for
		// completion of the thread running installUserModules()
		requestHelper.waitForReloadModules();


		// clean up entity so filesystem watch goes away
        requestHelper.deleteEntity(entityName);
	}

}
