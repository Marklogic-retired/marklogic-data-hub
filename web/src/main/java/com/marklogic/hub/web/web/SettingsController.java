/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.web.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.legacy.LegacyDebugging;
import com.marklogic.hub.legacy.LegacyTracing;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private LegacyTracing legacyTracing = null;
    private LegacyDebugging legacyDebugging = null;

    @Autowired
    private HubConfigImpl hubConfig;

    private LegacyTracing getLegacyTracing() {
        if (legacyTracing == null) {
            legacyTracing = LegacyTracing.create(hubConfig.newJobDbClient());
        }
        return legacyTracing;
    }

    private LegacyDebugging getLegacyDebugging() {
        if (legacyDebugging == null) {
            legacyDebugging = LegacyDebugging.create(hubConfig.newStagingClient());
        }
        return legacyDebugging;
    }

    @RequestMapping(value="/trace/enable", method = RequestMethod.POST)
    public void enableTracing() {
        LegacyTracing t = getLegacyTracing();
        t.enable();
    }

    @RequestMapping(value="/trace/disable", method = RequestMethod.POST)
    public void disableTracing() {
        LegacyTracing t = getLegacyTracing();
        t.disable();
    }

    @RequestMapping(value="/trace/is-enabled", method = RequestMethod.GET)
    public JsonNode isTracingEnabled() throws IOException {
        LegacyTracing t = getLegacyTracing();
        ObjectMapper om = new ObjectMapper();
        return om.readTree("{\"enabled\":" + t.isEnabled() + "}");
    }

    @RequestMapping(value="/debug/enable", method = RequestMethod.POST)
    public void enableDebuging() {
        LegacyDebugging t = getLegacyDebugging();
        t.enable();
    }

    @RequestMapping(value="/debug/disable", method = RequestMethod.POST)
    public void disableDebugging() {
        LegacyDebugging t = getLegacyDebugging();
        t.disable();
    }

    @RequestMapping(value="/debug/is-enabled", method = RequestMethod.GET)
    public JsonNode isDebuggingEnabled() throws IOException {
        LegacyDebugging t = getLegacyDebugging();
        ObjectMapper om = new ObjectMapper();
        return om.readTree("{\"enabled\":" + t.isEnabled() + "}");
    }

}
