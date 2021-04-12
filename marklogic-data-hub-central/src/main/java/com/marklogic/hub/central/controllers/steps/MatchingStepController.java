package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.controllers.BaseController;
import com.marklogic.hub.central.controllers.MappingController;
import com.marklogic.hub.central.schemas.StepSchema;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.dataservices.MasteringService;
import com.marklogic.hub.dataservices.StepService;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.stream.Stream;

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

    @RequestMapping(method = RequestMethod.POST)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "StepSchema")
    @Secured("ROLE_writeMatching")
    public ResponseEntity<Void> createMatchingStep(@RequestBody @ApiParam(hidden = true) ObjectNode propertiesToAssign) {
        String stepName = propertiesToAssign.get("name").asText();
        propertiesToAssign.put("name", stepName);
        newService().saveStep(STEP_DEFINITION_TYPE, propertiesToAssign, false, true);
        return emptyOk();
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.PUT)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "StepSchema")
    @Secured("ROLE_writeMatching")
    public ResponseEntity<Void> updateMatchingStep(@RequestBody @ApiParam(hidden = true) ObjectNode propertiesToAssign, @PathVariable String stepName) {
        propertiesToAssign.put("name", stepName);
        newService().saveStep(STEP_DEFINITION_TYPE, propertiesToAssign, false, false);
        return emptyOk();
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.DELETE)
    @Secured("ROLE_writeMatching")
    public ResponseEntity<Void> deleteStep(@PathVariable String stepName) {
        newService().deleteStep(STEP_DEFINITION_TYPE, stepName);
        return emptyOk();
    }

    @RequestMapping(value = "/{stepName}/calculateMatchingActivity", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get information about matching step")
    @Secured("ROLE_readMatching")
    public ResponseEntity<JsonNode> calculateMatchingActivity(@PathVariable String stepName) {
        return ResponseEntity.ok(MasteringService.on(getHubClient().getStagingClient()).calculateMatchingActivity(stepName));
    }

    @RequestMapping(value = "/{stepName}/previewMatchingActivity", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Get matching pairs of URIs and the match details")
    @Secured("ROLE_readMatching")
    public ResponseEntity<JsonNode> previewMatchingActivity(@PathVariable String stepName,
                                                            @RequestParam(value = "uris", required = false) String[] uris,
                                                            @RequestParam(value = "sampleSize", required = true) int sampleSize) {
        Stream<String> urisStream = null;
        if (uris != null) {
            urisStream = Arrays.stream(uris);
        }
        // Using final client as content to match against will most likely be in final, reducing the number of invokes needed
        return ResponseEntity.ok(MasteringService.on(getHubClient().getFinalClient()).previewMatchingActivity(stepName, urisStream, sampleSize));
    }

    @RequestMapping(value = "/{stepName}/validate", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Validate the matching step")
    @Secured("ROLE_readMatching")
    public ResponseEntity<JsonNode> validateMatchingStep(@PathVariable String stepName) {
        return ResponseEntity.ok(MasteringService.on(getHubClient().getStagingClient()).validateMatchingStep(stepName));
    }

    private StepService newService() {
        return StepService.on(getHubClient().getStagingClient());
    }

    public static class MatchingSteps extends ArrayList<StepSchema> {
    }


}
