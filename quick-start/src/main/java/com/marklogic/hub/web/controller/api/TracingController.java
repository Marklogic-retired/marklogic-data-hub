package com.marklogic.hub.web.controller.api;

import java.io.IOException;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.Tracing;
import com.marklogic.hub.config.EnvironmentConfiguration;

@RestController
@RequestMapping("/api/tracing")
public class TracingController {

    @Autowired
    private EnvironmentConfiguration environmentConfig;

    private Tracing getTracing() {
        return new Tracing(environmentConfig.getStagingClient());
    }
    @RequestMapping(value="/enable", method = RequestMethod.POST)
    public void enableTracing(HttpSession session) {
        Tracing t = getTracing();
        t.enable();
    }

    @RequestMapping(value="/disable", method = RequestMethod.POST)
    public void disableTracing(HttpSession session) {
        Tracing t = getTracing();
        t.disable();
    }

    @RequestMapping(value="/is-enabled", method = RequestMethod.GET)
    public JsonNode isEnabled(HttpSession session) throws JsonProcessingException, IOException {
        Tracing t = getTracing();
        ObjectMapper om = new ObjectMapper();
        return om.readTree("{\"enabled\":" + t.isEnabled() + "}");
    }

}
