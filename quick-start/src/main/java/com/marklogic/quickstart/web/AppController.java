package com.marklogic.quickstart.web;

import com.marklogic.client.helper.LoggingObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class AppController extends LoggingObject {

    /**
     * Assumes that the root URL should use a template named "index", which presumably will setup the Angular app.
     */
    @RequestMapping(value = {"/", "/login", "/home", "/settings", "/jobs", "/traces/**", "/404"}, method = RequestMethod.GET)
    public String index() {
        return "index";
    }
}
