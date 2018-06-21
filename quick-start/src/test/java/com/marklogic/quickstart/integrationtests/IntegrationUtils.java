package com.marklogic.quickstart.integrationtests;

import static io.restassured.RestAssured.given;

import java.io.File;
import java.io.IOException;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.quickstart.auth.LoginInfo;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.JobQuery;

import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;

public class IntegrationUtils {
	
	private String sessionID;
	private String projectPath;
	
	// created this field to enable fetch the flowName that was created during the createFlow process
	// and verify it.
	private String flowName;
	private int hmFlowNameCount = 1;
	
	private Cookie requestCookie;
	private LoginInfo loginInfo = new LoginInfo();
	private FlowModel flowModel;
	private JobQuery jobQuery;
	
	// Tests api's to initialize the project folder and set the environment configuration
	// Verifies if this the only project and status code of request is 200 OK
	public Response initilizeProjectConfiguration() {
		projectPath = new File(HubTestBase.PROJECT_PATH).getAbsolutePath();
		Response projectInitResponse = 
				given()
					.contentType("application/x-www-form-urlencoded")
					.queryParam("path", projectPath)
				.when()
					.post("/api/projects/");
		
		createLoginCredentials(projectInitResponse);
		
		return projectInitResponse;
	}
	// Tests api's to login into the quick-start application. These tests are using the 
	// admin/admin credentials. A session cookie is received in header which has to be
	// attached to the subsequent requests for security.
	public String doLogin() {
		Response loginResponse = 
				given()
					.body(loginInfo)
				.when()
					.post("/api/login");
		if(loginResponse.statusCode() == 200) {
			sessionID = StringUtils.substringBetween(loginResponse.getHeader("Set-Cookie"), "JSESSIONID=", ";");
		}
		
		// building cookie to use for subsequent endpoint requests
		buildCookie();
		
		return sessionID;
	}
	
	// Test api's to create new entities and verify if the entities are created by
	// making subsequent get request
	public Response createEntity(String createEntityJsonBody, String entityName) {
		Response createEntityResponse = 
				given()
					.cookie(requestCookie)
					.contentType(ContentType.JSON)
					.body(createEntityJsonBody).
				when()
					.put("/api/current-project/entities/"+entityName);
		
		return createEntityResponse;
	}
	
	// Get the list of entities and verify if entities are created
	public Response getAllEntities() {
		Response getEnitiesResponse = 
				given()
					.cookie(requestCookie)
				.when()
					.get("/api/current-project/entities/");
		
		return getEnitiesResponse;
	}
	
	public Response getDocStats() {
		Response statsResponse = 
				given()
					.cookie(requestCookie)
				.when()
					.get("/api/current-project/stats");
		
		return statsResponse;
	}
	
	public Response createFlow(String entityName, String flowType, DataFormat dataFormat, CodeFormat codeFormat,
			boolean useEsModel, String mappingName) {
		flowModel = createFlowModel(entityName, flowType, dataFormat, codeFormat, useEsModel, mappingName);
		Response createFlowResponse = 
				given()
					.contentType(ContentType.JSON)
				    .cookie(requestCookie)
					.body(flowModel)
					.pathParam("entityName", entityName)
					.pathParam("flowType", flowType)
				.when()
					.post("/api/current-project/entities/{entityName}/flows/{flowType}");
		
		return createFlowResponse;
	}
	
	public Response runFlow(JsonNode bodyParams, String entityName, FlowType flowType) {
		String runFlowPostURI = "";
		if(flowType.toString().equalsIgnoreCase("input")) {
			runFlowPostURI = "/api/current-project/entities/{entityName}/flows/input/{flowName}/run";
		} else {
			runFlowPostURI = "/api/current-project/entities/{entityName}/flows/harmonize/{flowName}/run";
		}
		
		Response runFlowResponse = 
				given()
					.cookie(requestCookie)
					.contentType(ContentType.JSON)
					.body(bodyParams)
					.pathParam("entityName", entityName)
					.pathParam("flowName", flowName).
				when()
					.post(runFlowPostURI);
		
		return runFlowResponse;
	}
	
	public Response deleteFlow(String entityName, String flowName, String flowType) {
		Response deleteFlowResponse = 
				given()
					.cookie(requestCookie)
					.contentType(ContentType.JSON)
					.pathParam("entityName", entityName)
					.pathParam("flowName", flowName)
					.pathParam("flowType", flowType).
				when()
					.delete("/api/current-project/entities/{entityName}/flows/{flowName}/{flowType}");
					
		return deleteFlowResponse;
	}
	
	public Response getMap(String mapName) {
		Response getMapResponse = 
				given()
					.cookie(requestCookie)
					.pathParam("mapName", mapName)
				.when()
					.get("/api/current-project/mappings/{mapName}");
		
		return getMapResponse;
	}
	
	public Response createMap(String mapName, JsonNode mapJsonNode) {
		Response createMapResponse = 
				given()
					.contentType(ContentType.JSON)
				    .cookie(requestCookie)
					.body(mapJsonNode)
					.pathParam("mapName", mapName)
				.when()
					.post("/api/current-project/mappings/{mapName}");
		
		return createMapResponse;
	}
	
	public Response getJobs(long start, long count) {
		jobQuery = buildJobQuery();
		Response getJobsResponse = 
				given()
					.contentType(ContentType.JSON)
				    .cookie(requestCookie)
					.body(jobQuery)
				.when()
					.post("/api/jobs");
		
		return getJobsResponse;
	}
	
	public Response clearAllDatabases() {
		Response clearDbResponse = 
				given()
					.contentType(ContentType.JSON)
				    .cookie(requestCookie)
				.when()
					.post("/api/current-project/clear-all");
		
		return clearDbResponse;
	}
	
	public JsonNode generateMLCPOptions(String inputPath, String basePath, String entityName, String mlcpPath, 
			CodeFormat codeFormat, DataFormat dataFormat, Map<String, Object> options) 
					throws IOException {
		
		String optionString = toJsonString(options).replace("\"", "\\\"");
		
		String optionsJson = "{ " + "\"mlcpPath\":\"" + mlcpPath + "\"," + "\"mlcpOptions\":" +
                "{" +
                    "\"input_file_path\":\"" + inputPath.replace("\\", "\\\\\\\\") + "\"," +
                    "\"input_file_type\":\"\\\"documents\\\"\"," +
                    "\"output_collections\":\"\\\"" + entityName + "\\\"\"," +
                    "\"output_permissions\":\"\\\"rest-reader,read,rest-writer,update\\\"\"," +
                    "\"output_uri_replace\":\"\\\"" + basePath.replace("\\", "/")
                    .replaceAll("^([A-Za-z]):", "/$1:") + ",''\\\"\"," +
                    "\"document_type\":\"\\\"" + dataFormat.toString() + "\\\"\",";
        if (codeFormat.equals(CodeFormat.JAVASCRIPT)) {
                optionsJson += "\"transform_module\":\"\\\"/MarkLogic/data-hub-framework/transforms/"
                		+ "mlcp-flow-transform.sjs\\\"\"," + "\"transform_function\":\"transform\",";
        } else {
                optionsJson += "\"transform_module\":\"\\\"/MarkLogic/data-hub-framework/transforms/"
                		+ "mlcp-flow-transform.xqy\\\"\"," + "\"transform_namespace\":\"\\\"http://marklogic.com/data-hub/"
                		+ "mlcp-flow-transform\\\"\",";
        }
        optionsJson += "\"transform_param\":\"entity-name=" + entityName + ",flow-name=" + flowName + ",options=" 
            			+ optionString + "\"" + "}}";
        
        JsonNode ipFlowJsonNode = new ObjectMapper().readTree(optionsJson);
        
		return ipFlowJsonNode;
	}
	
	public String toJsonString(Object value) {
        try {
            return new ObjectMapper().writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
	
	public String getFlowName() {
		return this.flowName;
	}
	
	public void waitForReloadModules() {
		try {
			System.out.println("Waiting to deploy Modules");
			Thread.sleep(10000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}
	
	private void buildCookie() {
		requestCookie = new Cookie.Builder("JSESSIONID", sessionID).setSecured(true)
			      .setComment("session id cookie").build();
	}
	
	private void createLoginCredentials(Response projectInitResponse) {
		JsonPath projectInitJson = projectInitResponse.jsonPath();
		loginInfo.projectId = projectInitJson.getInt("id");
		loginInfo.environment = projectInitJson.getList("environments").get(0).toString();
		loginInfo.username = "admin";
		loginInfo.password = "admin";
	}
	
	private FlowModel createFlowModel(String entityName, String flowType, DataFormat dataFormat, 
			CodeFormat codeFormat, boolean useEsModel, String mappingName) {
		flowModel = new FlowModel();
		flowModel.dataFormat = dataFormat;
		flowModel.codeFormat = codeFormat;
		flowModel.useEsModel = useEsModel;
		flowModel.mappingName = mappingName;
		flowModel.flowName = entityName+"-"+flowType.toLowerCase()+"-flow"+hmFlowNameCount;
		hmFlowNameCount++;
		this.flowName = flowModel.flowName;
		return flowModel;
	}
	
	private JobQuery buildJobQuery() {
		jobQuery = new JobQuery();
		return jobQuery;
	}
}
