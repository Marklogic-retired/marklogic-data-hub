package com.marklogic.hub.oneui.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SinglePageAppController {
    @RequestMapping(value = {"/", "/home", "/load-data", "/install", "/login", "/error"})
    public String index() {
        return "forward:index.html";
    }
}