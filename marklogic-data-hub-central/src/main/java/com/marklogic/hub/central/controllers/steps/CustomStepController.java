package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.controllers.BaseController;
import com.marklogic.hub.central.schemas.StepSchema;
import com.marklogic.hub.dataservices.CustomStepService;
import io.swagger.annotations.ApiOperation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.ArrayList;

@Controller
@RequestMapping("/api/steps/custom")
public class CustomStepController extends BaseController {

    @RequestMapping(method = RequestMethod.GET)
    @ApiOperation(value = "Get all custom steps associated with entity types or not associated with any entity types ", response = CustomSteps.class)
    @Secured("ROLE_readCustom")
    public ResponseEntity<JsonNode> getCustomStepsWithEntity() {
        return ResponseEntity.ok(newService().getCustomSteps());

    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.GET)
    @ApiOperation(value = "Get a step", response = StepSchema.class)
    @Secured("ROLE_readCustom")
    public ResponseEntity<JsonNode> getCustomStep(@PathVariable String stepName) {
        return ResponseEntity.ok(newService().getCustomStep(stepName));
    }

    private CustomStepService newService() {
        return CustomStepService.on(getHubClient().getStagingClient());
    }

    public static class CustomSteps extends ArrayList<StepSchema> {
    }
}

