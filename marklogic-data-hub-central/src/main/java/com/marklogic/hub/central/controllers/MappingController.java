package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.dataservices.MappingService;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.hub.entity.HubEntity;
import com.marklogic.hub.impl.EntityManagerImpl;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiModelProperty;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@Controller
@RequestMapping("/api/artifacts/mapping")
public class MappingController extends BaseController {

    @RequestMapping(value = "/validation", method = RequestMethod.POST)
    @ResponseBody
    @ApiImplicitParam(required = true, paramType = "body", dataType = "MappingArtifact")
    @ApiOperation(value = "Test a mapping against a source document", response = MappingArtifact.class)
    @Secured("ROLE_readMapping")
    public ResponseEntity<ObjectNode> testMapping(@RequestBody @ApiParam(hidden=true) ObjectNode jsonMapping,
                                                  @RequestParam(value = "uri", required = true) String uri,
                                                  @RequestParam(value = "db", required = true) String database) {
        return new ResponseEntity<>((ObjectNode) getMappingService().testMapping(uri, database, jsonMapping), HttpStatus.OK);
    }

    @RequestMapping(value = "/functions", method = RequestMethod.GET)
    @ResponseBody
    @Secured("ROLE_readMapping")
    public ResponseEntity<JsonNode> getMappingFunctions() {
        return new ResponseEntity<>(getMappingService().getMappingFunctions(), HttpStatus.OK);
    }

    /**
     * The mapping tool needs an entity with all of its structured properties "merged" in from the other definitions in
     * the entity model that the entity belongs to.
     *
     * @param entityName
     * @return
     */
    @RequestMapping(value = "/entity/{entityName}", method = RequestMethod.GET)
    @ResponseBody
    @Secured("ROLE_readMapping")
    public JsonNode getEntityForMapping(@PathVariable String entityName) {
        ArrayNode array = (ArrayNode) ModelsService.on(getHubClient().getFinalClient()).getPrimaryEntityTypes();
        JsonNode entityModel = null;
        for (int i = 0; i < array.size(); i++) {
            JsonNode model = array.get(i);
            if (entityName.equals(model.get("entityName").asText())) {
                entityModel = model.get("model");
                break;
            }
        }

        if (entityModel == null) {
            throw new RuntimeException("Unable to find entity model with name: " + entityName);
        }

        HubEntity hubEntity = HubEntity.fromJson(entityName + ".entity.json", entityModel);
        return new EntityManagerImpl(null).getEntityFromProject(entityName, Arrays.asList(hubEntity), null, true).toJson();
    }

    protected MappingService getMappingService() {
        return MappingService.on(getHubClient().getStagingClient());
    }

    public static class MappingArtifact {
        public String name;
        public String targetEntityType;
        public String selectedSource;
        public String sourceQuery;
        @ApiModelProperty("Each property object has a name matching that of an entity property and a sourceFrom mapping expression")
        public Map<String, Object> properties;
    }
}
