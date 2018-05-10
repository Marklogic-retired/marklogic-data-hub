/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.quickstart.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.quickstart.EnvironmentAware;
import com.marklogic.quickstart.model.TraceQuery;
import com.marklogic.quickstart.service.TraceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value="/api/traces")
public class TracesController extends EnvironmentAware {

    @Autowired
    TraceService traceService;

    @Bean
    @Scope(proxyMode= ScopedProxyMode.TARGET_CLASS, value="session")
    TraceService traceManager() {
        return new TraceService(envConfig().getJobClient());
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public String getTraces(@RequestBody TraceQuery traceQuery) throws JsonProcessingException {
        return traceService.getTraces(traceQuery).get();
    }

    @RequestMapping(value = "/{traceId}", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getTrace(@PathVariable String traceId) {
        return traceService.getTrace(traceId);
    }
}
