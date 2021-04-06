package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.schemas.ModelDescriptor;
import com.marklogic.hub.dataservices.MappingService;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiModelProperty;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
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
    @ApiOperation(value = "Returns an entity along with all its related entities for mapping UI", response = MappableEntityList.class)
    public JsonNode getMappableEntities(@PathVariable String entityName) {
       return getMappingService().getEntitiesForMapping(entityName);
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


    public static class RelatedEntityMapping {
        public String mappingLinkText;
        public String entityMappingId;
    }

    public static class MappableEntity {
        public String entityMappingId;
        public String entityType;
        public String mappingTitle;
        public ModelDescriptor entityModel;

        @ApiModelProperty("Each 'mappingLinkText' refers to a mapping whose id is 'entityMappingId'")
        public List<RelatedEntityMapping> relatedEntityMappings;
    }

    public static class MappableEntityList extends ArrayList<MappableEntity> {
    }
}
