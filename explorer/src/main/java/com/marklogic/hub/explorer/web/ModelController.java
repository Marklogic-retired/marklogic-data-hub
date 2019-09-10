package com.marklogic.hub.explorer.web;

import java.io.IOException;

import com.marklogic.hub.explorer.service.ModelService;

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
@RequestMapping("/v2/models")
public class ModelController {

  @Autowired protected ModelService modelService;

  @RequestMapping(method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getModels() throws IOException {
    JsonNode json = modelService.getModels();
    return new ResponseEntity<>(json, HttpStatus.OK);
  }

  @RequestMapping(value = "/{modelName}", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getModel(@PathVariable String modelName) throws IOException {
    String json = modelService.getModel(modelName);
    return new ResponseEntity<>(json, HttpStatus.OK);
  }
}
