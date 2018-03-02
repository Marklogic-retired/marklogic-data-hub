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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.Debugging;
import com.marklogic.hub.Tracing;
import com.marklogic.quickstart.EnvironmentAware;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/settings")
public class SettingsController extends EnvironmentAware {

    private Tracing tracing = null;
    private Debugging debugging = null;

    private Tracing getTracing() {
        if (tracing == null) {
            tracing = Tracing.create(envConfig().getStagingClient());
        }
        return tracing;
    }

    private Debugging getDebugging() {
        if (debugging == null) {
            debugging = Debugging.create(envConfig().getStagingClient());
        }
        return debugging;
    }

    @RequestMapping(value="/trace/enable", method = RequestMethod.POST)
    public void enableTracing() {
        Tracing t = getTracing();
        t.enable();
    }

    @RequestMapping(value="/trace/disable", method = RequestMethod.POST)
    public void disableTracing() {
        Tracing t = getTracing();
        t.disable();
    }

    @RequestMapping(value="/trace/is-enabled", method = RequestMethod.GET)
    public JsonNode isTracingEnabled() throws IOException {
        Tracing t = getTracing();
        ObjectMapper om = new ObjectMapper();
        return om.readTree("{\"enabled\":" + t.isEnabled() + "}");
    }

    @RequestMapping(value="/debug/enable", method = RequestMethod.POST)
    public void enableDebuging() {
        Debugging t = getDebugging();
        t.enable();
    }

    @RequestMapping(value="/debug/disable", method = RequestMethod.POST)
    public void disableDebugging() {
        Debugging t = getDebugging();
        t.disable();
    }

    @RequestMapping(value="/debug/is-enabled", method = RequestMethod.GET)
    public JsonNode isDebuggingEnabled() throws IOException {
        Debugging t = getDebugging();
        ObjectMapper om = new ObjectMapper();
        return om.readTree("{\"enabled\":" + t.isEnabled() + "}");
    }

}
