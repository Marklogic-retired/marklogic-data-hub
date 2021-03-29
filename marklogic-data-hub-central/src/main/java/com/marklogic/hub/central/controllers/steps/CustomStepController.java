package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.controllers.BaseController;
import com.marklogic.hub.central.schemas.StepSchema;
import com.marklogic.hub.dataservices.CustomStepService;
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
@RequestMapping("/api/steps/custom")
public class CustomStepController extends BaseController {

    private final static String STEP_DEFINITION_TYPE = "custom";

    @RequestMapping(method = RequestMethod.GET)
    @ApiOperation(value = "Get all custom steps associated with entity types or not associated with any entity types ", response = CustomSteps.class)
    @Secured("ROLE_readCustom")
    public ResponseEntity<JsonNode> getCustomStepsWithEntity() {
        return ResponseEntity.ok(customStepService().getCustomSteps());

    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.GET)
    @ApiOperation(value = "Get a step", response = StepSchema.class)
    @Secured("ROLE_readCustom")
    public ResponseEntity<JsonNode> getCustomStep(@PathVariable String stepName) {
        return ResponseEntity.ok(customStepService().getCustomStep(stepName));
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.PUT)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "StepSchema")
    @Secured("ROLE_writeCustom")
    public ResponseEntity<Void> updateCustomStep(@RequestBody @ApiParam(hidden = true) ObjectNode propertiesToAssign, @PathVariable String stepName) {
        propertiesToAssign.put("name", stepName);
        customStepService().updateCustomStep(propertiesToAssign);
        return emptyOk();
    }

    private CustomStepService customStepService() {
        return CustomStepService.on(getHubClient().getStagingClient());
    }

    private StepService newStepService() {
        return StepService.on(getHubClient().getStagingClient());
    }

    public static class CustomSteps extends ArrayList<StepSchema> {
    }
}