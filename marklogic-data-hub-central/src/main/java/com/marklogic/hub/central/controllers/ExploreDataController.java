package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.dataservices.ExploreDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping(value = "/api/explore")
public class ExploreDataController extends BaseController {

    @Autowired
    private Environment environment;
    private ObjectMapper objectMapper = new ObjectMapper();

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JsonNode> search(@RequestBody JsonNode searchQuery, @RequestHeader(name="userid") String userid) {
        ((ObjectNode) searchQuery).put("userid", userid);
        return ResponseEntity.ok(newExploreDataService().searchAndTransform(searchQuery));
    }

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<JsonNode> searchByStringQuery(@RequestParam String query, @RequestHeader(name="userid") String userid) throws JsonProcessingException {
        JsonNode searchQuery = objectMapper.readTree(query);
        ((ObjectNode) searchQuery).put("userid", userid);
        return ResponseEntity.ok(newExploreDataService().searchAndTransform(searchQuery));
    }

    @RequestMapping(value = "/getRecords", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JsonNode> getRecords(@RequestBody JsonNode recordIds) {
        return new ResponseEntity<>(newExploreDataService().getRecords(recordIds), HttpStatus.OK);
    }

    @RequestMapping(value = "/getRecord", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<JsonNode> getRecord(@RequestParam String recordId) {
        ObjectNode input = objectMapper.createObjectNode();
        input.putArray("uris").add(recordId);
        return new ResponseEntity<>(newExploreDataService().getRecords(input), HttpStatus.OK);
    }

    @RequestMapping(value = "/getEntityModels", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<JsonNode> getEntityModels() {
        return new ResponseEntity<>(newExploreDataService().getEntityModels(), HttpStatus.OK);
    }

    @RequestMapping(value = "/metrics", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JsonNode> getMetrics(@RequestBody JsonNode metricTypes) {
        return new ResponseEntity<>(newExploreDataService().getMetrics(metricTypes), HttpStatus.OK);
    }

    @RequestMapping(value = "/login", method = RequestMethod.GET)
    @ResponseBody
    public String getUserInfo() {
        UUID uuid = UUID.randomUUID();
        return uuid.toString();
    }

    @RequestMapping(value = "/proxyAddress", method = RequestMethod.GET)
    @ResponseBody
    public String getProxyAddress() {
        return environment.getProperty("loginAddress");
    }

    @RequestMapping(value = "/uiconfig", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getUIConfig() {
        DatabaseClient client = getHubClient().getCustomDbModulesClient();
        JSONDocumentManager docMgr = client.newJSONDocumentManager();
        JacksonHandle handleJSON = new JacksonHandle();
        docMgr.read("/explore-data/ui-config/config.json", handleJSON);
        return handleJSON.get();
    }

    @RequestMapping(method = RequestMethod.POST, value = "/recentlyVisited")
    @ResponseBody
    public ResponseEntity<Void> saveQueryDocument(@RequestBody JsonNode recentRecord) {
        newExploreDataService().saveRecentlyVisitedRecord(recentRecord);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/recentlyVisited")
    @ResponseBody
    public ResponseEntity<JsonNode> getQueryDocuments(@RequestParam String user) {
        return new ResponseEntity<>(newExploreDataService().getRecentlyVisitedRecords(user), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/userMetaData")
    @ResponseBody
    public ResponseEntity<Void> saveUserMetaData(@RequestBody JsonNode userMetaData) {
        newExploreDataService().saveUserMetaData(userMetaData);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/userMetaData")
    @ResponseBody
    public ResponseEntity<JsonNode> getUserMetaData(@RequestParam String user) {
        return new ResponseEntity<>(newExploreDataService().getUserMetaData(user), HttpStatus.OK);
    }

    private ExploreDataService newExploreDataService() {
        return ExploreDataService.on(getHubClient().getCustomDbClient());
    }
}
