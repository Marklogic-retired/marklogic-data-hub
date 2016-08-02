package com.marklogic.quickstart.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.hub.TraceManager;
import com.marklogic.hub.trace.Trace;
import com.marklogic.quickstart.util.SearchHandleSerializer;
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
    TraceManager traceManager;

    @Bean
    @Scope(proxyMode= ScopedProxyMode.TARGET_CLASS, value="session")
    TraceManager traceManager() {
        return new TraceManager(envConfig.getTraceClient());
    }

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public String getTraces(@RequestParam(required = false) String query, @RequestParam long start, @RequestParam long count) throws JsonProcessingException {
        requireAuth();
        ObjectMapper om = new ObjectMapper();
        SimpleModule module = new SimpleModule();
        module.addSerializer(SearchHandle.class, new SearchHandleSerializer());
        om.registerModule(module);
        return om.writeValueAsString(traceManager.getTraces(query, start, count));
    }

    @RequestMapping(value = "/{traceId}", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getTrace(@PathVariable String traceId) {
        requireAuth();

        return traceManager.getTrace(traceId);
    }
}
