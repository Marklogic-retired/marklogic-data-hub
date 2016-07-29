package com.marklogic.quickstart.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.Debugging;
import com.marklogic.hub.Tracing;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.io.IOException;

@RestController
@RequestMapping("/settings")
public class SettingsController extends BaseController {

    private Tracing getTracing() {
        return new Tracing(envConfig.getStagingClient());
    }

    private Debugging getDebugging() {
        return new Debugging(envConfig.getStagingClient());
    }

    @RequestMapping(value="/trace/enable", method = RequestMethod.POST)
    public void enableTracing(HttpSession session) {
        requireAuth();
        Tracing t = getTracing();
        t.enable();
    }

    @RequestMapping(value="/trace/disable", method = RequestMethod.POST)
    public void disableTracing(HttpSession session) {
        requireAuth();
        Tracing t = getTracing();
        t.disable();
    }

    @RequestMapping(value="/trace/is-enabled", method = RequestMethod.GET)
    public JsonNode isTracingEnabled(HttpSession session) throws JsonProcessingException, IOException {
        requireAuth();
        Tracing t = getTracing();
        ObjectMapper om = new ObjectMapper();
        return om.readTree("{\"enabled\":" + t.isEnabled() + "}");
    }

    @RequestMapping(value="/debug/enable", method = RequestMethod.POST)
    public void enableDebuging(HttpSession session) {
        requireAuth();
        Debugging t = getDebugging();
        t.enable();
    }

    @RequestMapping(value="/debug/disable", method = RequestMethod.POST)
    public void disableDebugging(HttpSession session) {
        requireAuth();
        Debugging t = getDebugging();
        t.disable();
    }

    @RequestMapping(value="/debug/is-enabled", method = RequestMethod.GET)
    public JsonNode isDebuggingEnabled(HttpSession session) throws JsonProcessingException, IOException {
        requireAuth();
        Debugging t = getDebugging();
        ObjectMapper om = new ObjectMapper();
        return om.readTree("{\"enabled\":" + t.isEnabled() + "}");
    }

}
