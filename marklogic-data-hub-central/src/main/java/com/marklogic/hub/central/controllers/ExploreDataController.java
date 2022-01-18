package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.schemas.EntitySearchResponseSchema;
import com.marklogic.hub.dataservices.ExploreDataService;
import io.swagger.annotations.ApiOperation;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping(value = "/api/explore")
public class ExploreDataController extends BaseController {

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Response is a MarkLogic JSON search response. Please see ./specs/EntitySearchResponse.schema.json for complete information, as swagger-ui does not capture all the details",
        response = EntitySearchResponseSchema.class)
    public ResponseEntity<JsonNode> search(@RequestBody JsonNode searchQuery, @RequestParam(defaultValue = "final") String database, @RequestHeader(name="userid") String userid) {
        ((ObjectNode) searchQuery).put("userid", userid);
        return ResponseEntity.ok(newExploreDataService(database).searchAndTransform(searchQuery));
    }

    @RequestMapping(value = "/twizzlers/login", method = RequestMethod.GET)
    @ResponseBody
    public String getUserInfo() {
        UUID uuid = UUID.randomUUID();
        return uuid.toString();
    }

    private ExploreDataService newExploreDataService(String database) {
        return ExploreDataService.on(getHubClient().getNewClient());
    }
}
