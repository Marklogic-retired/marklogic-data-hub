package com.marklogic.hub.web.web;

import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.web.exception.DataHubException;
import com.marklogic.hub.web.exception.NotFoundException;
import com.marklogic.hub.web.model.StepModel;
import com.marklogic.hub.web.service.FlowManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/flows")
public class FlowController {
    @Autowired
    private FlowManagerService flowManagerService;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public List<Flow> getFlows() {
        return flowManagerService.getFlows();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @ResponseBody
    public Flow createFlow(@RequestBody String flowJson) {
        return flowManagerService.createFlow(flowJson);
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getFlow(@PathVariable String flowName) {
        Flow flow = null;
        try {
            flow = flowManagerService.getFlow(flowName);
            if (flow == null) {
                throw new NotFoundException();
            }
        } catch (DataHubProjectException dpe) {
            throw new DataHubException(dpe.getMessage());
        }
        return new ResponseEntity<Flow>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/names/", method = RequestMethod.GET)
    @ResponseBody
    public List<String> getFlowNames() {
        return flowManagerService.getFlowNames();
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteFlow(@PathVariable String flowName)  {
        flowManagerService.deleteFlow(flowName);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/{flowName}/steps", method = RequestMethod.GET)
    @ResponseBody
    public List<StepModel> getSteps(@PathVariable String flowName) {
        return flowManagerService.getSteps(flowName);
    }

    @RequestMapping(value = "/{flowName}/steps", method = RequestMethod.POST)
    @ResponseBody
    public StepModel createStep(@PathVariable String flowName, @RequestBody String stepJson) {
        return flowManagerService.createStep(flowName, stepJson);
    }
}
