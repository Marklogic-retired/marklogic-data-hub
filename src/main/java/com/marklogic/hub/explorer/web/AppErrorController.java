package com.marklogic.hub.explorer.web;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AppErrorController implements ErrorController {

  @RequestMapping("/error")
  public String handleError() {
    return "index";
  }

  @Override
  public String getErrorPath() {
    return "/error";
  }
}