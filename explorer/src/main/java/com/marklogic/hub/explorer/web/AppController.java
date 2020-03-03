/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class AppController {

  /**
   * Assumes that the root URL should use a template named "index", which presumably will setup the
   * React app.
   */
  @RequestMapping(value = {"/"}, method = RequestMethod.GET)
  public String index() {
    return "index";
  }
}
