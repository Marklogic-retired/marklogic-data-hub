package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.controllers.BaseController;
import com.marklogic.hub.central.schemas.StepSchema;
import com.marklogic.hub.central.schemas.StepSettingsSchema;
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
@RequestMapping("/api/steps/mapping")
public class MappingStepController extends BaseController {

    private final static String STEP_DEFINITION_TYPE = "mapping";

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get all mapping steps", response = MappingSteps.class)
    @Secured("ROLE_readMapping")
    public ResponseEntity<JsonNode> getSteps() {
        return ResponseEntity.ok(ArtifactService.on(getHubClient().getStagingClient()).getList(STEP_DEFINITION_TYPE));
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.GET)
    @ApiOperation(value = "Get a step", response = StepSchema.class)
    @Secured("ROLE_readMapping")
    public ResponseEntity<JsonNode> getStep(@PathVariable String stepName) {
        return ResponseEntity.ok(newService().getStep(STEP_DEFINITION_TYPE, stepName));
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.POST)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "StepSchema")
    public ResponseEntity<Void> saveStep(@RequestBody @ApiParam(hidden = true) ObjectNode propertiesToAssign, @PathVariable String stepName) {
        propertiesToAssign.put("name", stepName);
        newService().saveStep(STEP_DEFINITION_TYPE, propertiesToAssign);
        return emptyOk();
    }

    @RequestMapping(value = "/{stepName}/settings", method = RequestMethod.GET)
    @Secured("ROLE_readMapping")
    public ResponseEntity<StepSettingsSchema> getSettings(@PathVariable String stepName) {
        return ResponseEntity.ok(StepUtil.settingsFromJson(newService().getStep(STEP_DEFINITION_TYPE, stepName)));
    }

    @RequestMapping(value = "/{stepName}/settings", method = RequestMethod.PUT)
    public ResponseEntity<Void> updateSettings(@PathVariable String stepName, @RequestBody StepSettingsSchema settings) {
        ObjectNode node = StepUtil.valueToTree(settings);
        node.put("name", stepName);
        newService().saveStep(STEP_DEFINITION_TYPE, node);
        return emptyOk();
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteStep(@PathVariable String stepName) {
        newService().deleteStep(STEP_DEFINITION_TYPE, stepName);
        return emptyOk();
    }

    private StepService newService() {
        return StepService.on(getHubClient().getStagingClient());
    }

    public static class MappingSteps extends ArrayList<StepSchema> {
    }


}
