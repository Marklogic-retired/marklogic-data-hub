package com.marklogic.quickstart.integrationtests;

import static io.restassured.RestAssured.given;

import java.io.File;
import java.io.IOException;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.quickstart.auth.LoginInfo;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.JobQuery;

import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;

public class E2ETestsRequestHelper extends HubTestBase {

	private Cookie requestCookie;
	private int harmonizeFlowNameCount = 1;
	private int mapNameCount = 1;
	private LoginInfo loginInfo = new LoginInfo();
	private String flowName;
	private String sessionID;
	static final protected Logger logger = LoggerFactory.getLogger(E2ETestsRequestHelper.class);

	public Response initilizeProjectConfiguration() {
		String projectPath = new File(PROJECT_PATH).getAbsolutePath();
		Response projectInitResponse =
				given()
					.contentType("application/x-www-form-urlencoded")
					.queryParam("path", projectPath)
				.when()
					.post("/api/projects/");
		createLoginCredentials(projectInitResponse);

		return projectInitResponse;
	}

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

	public Response deleteEntity(String entityName) {
		Response createEntityResponse =
				given()
					.cookie(requestCookie)
					.contentType(ContentType.JSON)
				.when()
					.delete("/api/current-project/entities/"+entityName);

		return createEntityResponse;
	}

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
		FlowModel flowModel = createFlowModel(entityName, flowType, dataFormat, codeFormat, useEsModel, mappingName);
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

	public Response getMapNames() {
		Response getMapNamesResponse =
				given()
					.cookie(requestCookie)
				.when()
					.get("/api/current-project/mappings/names");

		return getMapNamesResponse;
	}

	public Response getMaps() {
		Response getAllMapsResponse =
				given()
					.cookie(requestCookie)
				.when()
					.get("/api/current-project/mappings");

		return getAllMapsResponse;
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

	public Response deleteMap(String mapName) {
		Response deleteMapResponse =
				given()
				.contentType(ContentType.JSON)
			    .cookie(requestCookie)
				.pathParam("mapName", mapName)
			.when()
				.delete("/api/current-project/mappings/{mapName}");

		return deleteMapResponse;
	}

	public Response getJobs(long start, long count) {
		JobQuery jobQuery = buildJobQuery();
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
				optionsJson += "\"transform_module\":\"\\\"/data-hub/4/transforms/"
                		+ "mlcp-flow-transform.sjs\\\"\"," + "\"transform_function\":\"transform\",";
		} else {
				optionsJson += "\"transform_module\":\"\\\"/data-hub/4/transforms/"
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
			logger.info("Waiting to load modules");
			Thread.sleep(15000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}

	public String createMapName() {
		String mapName = "map" + mapNameCount;
		mapNameCount++;
		return mapName;
	}

	public String getResourceFileContent(String fileLoc) {
		return getResource(fileLoc);
	}

	public String getResourceFilePath(String fileLoc) {
		return getResourceFile(fileLoc).getAbsolutePath();
	}

	private void buildCookie() {
		requestCookie = new Cookie.Builder("JSESSIONID", sessionID).setSecured(true)
			      .setComment("session id cookie").build();
	}

	private void createLoginCredentials(Response projectInitResponse) {
		JsonPath projectInitJson = projectInitResponse.jsonPath();
		loginInfo.projectId = projectInitJson.getInt("id");
		loginInfo.environment = projectInitJson.getList("environments").get(0).toString();
		loginInfo.username = user;
		loginInfo.password = password;
	}

	private FlowModel createFlowModel(String entityName, String flowType, DataFormat dataFormat,
			CodeFormat codeFormat, boolean useEsModel, String mappingName) {
		FlowModel flowModel = new FlowModel();
		flowModel.dataFormat = dataFormat;
		flowModel.codeFormat = codeFormat;
		flowModel.useEsModel = useEsModel;
		flowModel.mappingName = mappingName;
		flowModel.flowName = entityName+"-"+flowType.toLowerCase()+"-flow"+harmonizeFlowNameCount;
		harmonizeFlowNameCount++;
		this.flowName = flowModel.flowName;
		return flowModel;
	}

	private JobQuery buildJobQuery() {
		JobQuery jobQuery = new JobQuery();
		return jobQuery;
	}
}
