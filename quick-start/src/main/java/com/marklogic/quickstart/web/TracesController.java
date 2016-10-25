package com.marklogic.quickstart.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.quickstart.service.TraceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value="/api/traces")
public class TracesController extends BaseController {

    @Autowired
    TraceService traceService;

    @Bean
    @Scope(proxyMode= ScopedProxyMode.TARGET_CLASS, value="session")
    TraceService traceManager() {
        return new TraceService(envConfig.getTraceClient());
    }

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public String getTraces(@RequestParam(required = false) String query, @RequestParam long start, @RequestParam long count) throws JsonProcessingException {
        requireAuth();
        return traceService.getTraces(query, start, count).get();
    }

    @RequestMapping(value = "/{traceId}", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getTrace(@PathVariable String traceId) {
        requireAuth();

        return traceService.getTrace(traceId);
    }
}
