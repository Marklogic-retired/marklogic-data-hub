package com.marklogic.hub.explorer.web;

import com.marklogic.hub.explorer.service.JobsService;

import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/v2/jobs")
public class JobsController {

  @Autowired
  private JobsService jobsService;

  @RequestMapping(value = "/models", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getLatestJobInfoForAllModels() {
    return new ResponseEntity<>(jobsService.getLatestJobInfoForAllModels(), HttpStatus.OK);
  }

  @RequestMapping(value = "/models/{modelName}", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getLatestJobInfo(@PathVariable String modelName) {
    JsonNode json = jobsService.getLatestJobInfo(modelName);
    return new ResponseEntity<>(json, HttpStatus.OK);
  }
}
