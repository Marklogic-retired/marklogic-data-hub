package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.controllers.BaseController;
import com.marklogic.hub.central.models.AbstractModel;
import com.marklogic.hub.central.schemas.StepSchema;
import com.marklogic.hub.central.schemas.StepSettingsSchema;
import com.marklogic.hub.dataservices.StepService;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/api/steps/ingestion")
public class IngestionStepController extends BaseController {

    private final static String STEP_DEFINITION_TYPE = "ingestion";

    @RequestMapping(method = RequestMethod.POST)
    @ApiOperation(value = "Create a step", response = StepSchema.class)
    public ResponseEntity<JsonNode> createStep(@RequestBody IngestionInfo info) {
        return jsonCreated(newService().createStep(STEP_DEFINITION_TYPE, info.toJsonNode()));
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.GET)
    @ApiOperation(value = "Get a step", response = StepSchema.class)
    public ResponseEntity<JsonNode> getStep(@PathVariable String stepName) {
        return ResponseEntity.ok(newService().getStep(STEP_DEFINITION_TYPE, stepName));
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.PUT)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "StepSchema")
    public ResponseEntity<Void> updateStep(@RequestBody @ApiParam(hidden = true) JsonNode propertiesToAssign, @PathVariable String stepName) {
        newService().updateStep(STEP_DEFINITION_TYPE, stepName, propertiesToAssign);
        return emptyOk();
    }

    @RequestMapping(value = "/{stepName}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteStep(@PathVariable String stepName) {
        newService().deleteStep(STEP_DEFINITION_TYPE, stepName);
        return emptyOk();
    }

    @RequestMapping(value = "/{stepName}/settings", method = RequestMethod.GET)
    public ResponseEntity<StepSettingsSchema> getSettings(@PathVariable String stepName) {
        return ResponseEntity.ok(StepUtil.settingsFromJson(newService().getStep(STEP_DEFINITION_TYPE, stepName)));
    }

    @RequestMapping(value = "/{stepName}/settings", method = RequestMethod.PUT)
    public ResponseEntity<Void> updateSettings(@PathVariable String stepName, @RequestBody StepSettingsSchema settings) {
        newService().updateStep(STEP_DEFINITION_TYPE, stepName, StepUtil.valueToTree(settings));
        return emptyOk();
    }

    private StepService newService() {
        return StepService.on(getHubClient().getStagingClient());
    }

    public static class IngestionInfo extends AbstractModel {
        public String name;
        public String description;
        public String sourceFormat;
        public String targetFormat;
        public String outputURIReplacement;
    }
}

