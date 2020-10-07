package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.controllers.BaseController;
import com.marklogic.hub.central.schemas.StepSchema;
import com.marklogic.hub.dataservices.ArtifactService;
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
@RequestMapping("/api/steps/matching")
public class MatchingStepController extends BaseController {

    private final static String STEP_DEFINITION_TYPE = "matching";

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get all matching steps", response = MatchingSteps.class)
    @Secured("ROLE_readMatching")
    public ResponseEntity<JsonNode> getSteps() {
        return ResponseEntity.ok(ArtifactService.on(getHubClient().getStagingClient()).getList(STEP_DEFINITION_TYPE));
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.GET)
    @ApiOperation(value = "Get a step", response = StepSchema.class)
    @Secured("ROLE_readMatching")
    public ResponseEntity<JsonNode> getStep(@PathVariable String stepName) {
        return ResponseEntity.ok(newService().getStep(STEP_DEFINITION_TYPE, stepName));
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.POST)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "StepSchema")
    @Secured("ROLE_writeMatching")
    public ResponseEntity<Void> saveStep(@RequestBody @ApiParam(hidden = true) ObjectNode propertiesToAssign, @PathVariable String stepName) {
        propertiesToAssign.put("name", stepName);
        newService().saveStep(STEP_DEFINITION_TYPE, propertiesToAssign, false);
        return emptyOk();
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.DELETE)
    @Secured("ROLE_writeMatching")
    public ResponseEntity<Void> deleteStep(@PathVariable String stepName) {
        newService().deleteStep(STEP_DEFINITION_TYPE, stepName);
        return emptyOk();
    }

    private StepService newService() {
        return StepService.on(getHubClient().getStagingClient());
    }

    public static class MatchingSteps extends ArrayList<StepSchema> {
    }


}
