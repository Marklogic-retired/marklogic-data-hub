/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.web;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/datahub/v2/info")
public class AppInfoController {


  private Environment environment;

  @Autowired
  AppInfoController(Environment environment) {
    this.environment = environment;
  }

  @RequestMapping(method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<Map<String, String>> getInfo() {
    Map<String, String> infoMap = new HashMap<>();
    infoMap.put("session.timeout",
        environment.getProperty("server.servlet.session.timeout"));
    return new ResponseEntity<>(infoMap, HttpStatus.OK);
  }

}
