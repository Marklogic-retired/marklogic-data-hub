/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.web;

import java.util.ArrayList;
import java.util.List;

import com.marklogic.client.FailedRequestException;
import com.marklogic.hub.explorer.service.JobsService;

import com.fasterxml.jackson.databind.JsonNode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

  private static final Logger logger = LoggerFactory.getLogger(JobsController.class);

  @Autowired
  private JobsService jobsService;

  @RequestMapping(value = "/models", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getLatestJobInfoForAllModels() {
    List<JsonNode> modelList = new ArrayList<>();
    try {
      modelList = jobsService.getLatestJobInfoForAllModels();
    } catch (FailedRequestException e) {
      /*
       * As MarkLogic server throws a FailedRequestException for both data-service module not found
       * and if the user is unauthorized to access the module; we need to fail silently and log the
       * issue.
       */
      logger.error(e.getMessage());
    }
    return new ResponseEntity<>(modelList, HttpStatus.OK);
  }

  @RequestMapping(value = "/models/{modelName}", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getLatestJobInfo(@PathVariable String modelName) {
    JsonNode json = null;
    try {
      json = jobsService.getLatestJobInfo(modelName);
    } catch (FailedRequestException e) {
      /*
       * As MarkLogic server throws a FailedRequestException for both data-service module not found
       * and if the user is unauthorized to access the module; we need to fail silently and log the
       * issue.
       */
      logger.error(e.getMessage());
    }
    return new ResponseEntity<>(json, HttpStatus.OK);
  }
}
