package com.marklogic.hub.central.controllers;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SinglePageAppController implements ErrorController {

    /**
     * Used when running HC as an executable war file; not used when running it locally for development purposes, as the
     * local Node server handles this route instead.
     *
     * @return
     */
    @RequestMapping(value = {"/"})
    public String index() {
        return "forward:index.html";
    }

}
