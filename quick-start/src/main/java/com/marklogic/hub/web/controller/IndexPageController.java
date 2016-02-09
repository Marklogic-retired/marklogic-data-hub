package com.marklogic.hub.web.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/")
public class IndexPageController extends BaseController {
    
    @RequestMapping(method = RequestMethod.GET)
    public String getPage(HttpServletRequest request) throws Exception {
        return "redirect:/index.html";
    }
}
