package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.controllers.BaseController;
import com.marklogic.hub.dataservices.StepService;
import io.swagger.annotations.ApiOperation;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
import java.util.stream.Stream;

@Controller
@RequestMapping("/api/steps")
public class StepController extends BaseController {
    @RequestMapping(method = RequestMethod.GET)
    @ApiOperation(value = "Get all steps grouped by type", response = Steps.class)
    @Secured("ROLE_readFlow")
    public ResponseEntity<JsonNode> get() {
        return ResponseEntity.ok(newStepService().getStepsByType(Stream.of("stepId", "name")));
    }

    private StepService newStepService() {
        return StepService.on(getHubClient().getStagingClient());
    }

    public static class Steps {
        public List<StepReference> ingestionSteps;
        public List<StepReference> mappingSteps;
    }

    public static class StepReference {
        public String stepId;
        public String name;
    }
}
