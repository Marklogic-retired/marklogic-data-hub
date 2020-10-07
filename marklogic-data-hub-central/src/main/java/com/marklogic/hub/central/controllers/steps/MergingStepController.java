package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.controllers.BaseController;
import com.marklogic.hub.central.schemas.StepSchema;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.dataservices.MasteringService;
import com.marklogic.hub.dataservices.StepService;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@Controller
@RequestMapping("/api/steps/merging")
public class MergingStepController extends BaseController {

    private final static String STEP_DEFINITION_TYPE = "merging";

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get all merging steps", response = MergingSteps.class)
    @Secured("ROLE_readMerging")
    public ResponseEntity<JsonNode> getSteps() {
        return ResponseEntity.ok(ArtifactService.on(getHubClient().getStagingClient()).getList(STEP_DEFINITION_TYPE));
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.GET)
    @ApiOperation(value = "Get a step", response = StepSchema.class)
    @Secured("ROLE_readMerging")
    public ResponseEntity<JsonNode> getStep(@PathVariable String stepName) {
        return ResponseEntity.ok(newService().getStep(STEP_DEFINITION_TYPE, stepName));
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.POST)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "StepSchema")
    @Secured("ROLE_writeMerging")
    public ResponseEntity<Void> saveStep(@RequestBody @ApiParam(hidden = true) ObjectNode propertiesToAssign, @PathVariable String stepName) {
        propertiesToAssign.put("name", stepName);
        newService().saveStep(STEP_DEFINITION_TYPE, propertiesToAssign, false);
        return emptyOk();
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.DELETE)
    @Secured("ROLE_writeMerging")
    public ResponseEntity<Void> deleteStep(@PathVariable String stepName) {
        newService().deleteStep(STEP_DEFINITION_TYPE, stepName);
        return emptyOk();
    }

    @RequestMapping(value = "/defaultCollections/{entityType}", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation("Returns the default mastering collections for an entity type")
    public JsonNode getDefaultCollections(@PathVariable String entityType) {
        return MasteringService
            .on(getHubClient().getStagingClient())
            .getDefaultCollections(entityType);
    }

    private StepService newService() {
        return StepService.on(getHubClient().getStagingClient());
    }

    public static class MergingSteps extends ArrayList<StepSchema> {
    }


}
