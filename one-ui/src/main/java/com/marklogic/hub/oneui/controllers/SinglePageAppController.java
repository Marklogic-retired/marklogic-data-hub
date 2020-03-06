package com.marklogic.hub.oneui.controllers;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SinglePageAppController implements ErrorController {
    @RequestMapping(value = {"/"})
    public String index() {
        return "forward:index.html";
    }

    /**
     * Returns the path of the error page.
     *
     * @return the error path
     */
    @Override
    @RequestMapping("/error")
    public String getErrorPath() {
        return "forward:index.html";
    }
}
