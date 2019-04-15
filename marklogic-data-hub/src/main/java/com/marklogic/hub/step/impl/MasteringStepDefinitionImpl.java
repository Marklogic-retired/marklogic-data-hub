/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.marklogic.hub.step.impl;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.step.AbstractStepDefinition;
import com.marklogic.hub.util.json.JSONObject;

import java.util.Map;

public class MasteringStepDefinitionImpl extends AbstractStepDefinition {

    public MasteringStepDefinitionImpl(String name) {
        setName(name);
        setType(StepDefinitionType.MASTER);

        Map<String, Object> options = getOptions();
        setIdentifier("cts.uris(null, null, cts.collectionQuery('default-ingest'))");
        options.put("identifier", getIdentifier());
        options.put("sourceDatabase", HubConfig.DEFAULT_FINAL_NAME);
        options.put("targetDatabase", HubConfig.DEFAULT_FINAL_NAME);
        options.put("mergeOptions", new JSONObject());
        options.put("matchOptions", new JSONObject());
        // Step update needed for lock-for-update in Smart Mastering
        options.put("stepUpdate", true);
        // Accepts batch needed for Smart Mastering to receive all batch documents at once
        options.put("acceptsBatch", true);

        setModulePath("/data-hub/5/builtins/steps/master/default/main.sjs");
    }
}
