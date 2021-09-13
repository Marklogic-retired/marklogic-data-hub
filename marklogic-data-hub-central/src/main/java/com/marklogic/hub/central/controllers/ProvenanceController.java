package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.hub.dataservices.ProvenanceService;
import io.swagger.annotations.ApiOperation;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/api/provenance")
public class ProvenanceController extends BaseController {
    /**
     * Returns the provenance graph for a document.
     *
     * @return
     */
    @RequestMapping(value = "/getProvenanceGraph", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get the provenance data for a document in graph form", response = ProvenanceGraph.class)
    public ResponseEntity<JsonNode> getProvenanceGraph(@RequestParam String documentURI) {
        return ResponseEntity.ok(ProvenanceService.on(getHubClient().getFinalClient()).getProvenanceGraph(documentURI));
    }

    class ProvenanceGraph {
        public List<Activity> activities;
    }
    class Activity {
        public String activityID;
        public String provID;
        public Date time;
        public List<Node> nodes;
        public List<Link> links;
    }
    class Node {
        public String id;
        public String label;
        public String entityName;
        public ChangeType changeType;
    }
    class Link {
        public String to;
        public String from;
        public String label;
    }
    enum ChangeType{
        Create, Update, Source;

        @Override
        public String toString() {
            switch (this) {
                case Create:
                    return "Create";
                case Update:
                    return "Update";
                case Source:
                    return "Source";
                default:
                    throw new RuntimeException("Illegal ChangeType!");
            }
        }
    }
}
