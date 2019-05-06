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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class CustomStepDefinitionImpl extends AbstractStepDefinition {

    public CustomStepDefinitionImpl(String name) {
        setName(name);
        setType(StepDefinitionType.CUSTOM);

        List<String> collectionName = new ArrayList<>();
        collectionName.add(name);
        Map<String, Object> options = getOptions();
        options.put("collections", collectionName);
        options.put("outputFormat", "json");

        options.put("sourceDatabase", HubConfig.DEFAULT_STAGING_NAME);
        options.put("targetDatabase", HubConfig.DEFAULT_FINAL_NAME);

        setModulePath("/path/to/your/step/module/main.sjs");
    }
}
