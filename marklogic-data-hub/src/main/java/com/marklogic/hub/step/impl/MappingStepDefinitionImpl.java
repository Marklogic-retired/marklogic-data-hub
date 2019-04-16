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

import com.marklogic.hub.step.AbstractStepDefinition;

import java.util.Map;

public class MappingStepDefinitionImpl extends AbstractStepDefinition {

    public MappingStepDefinitionImpl(String name) {
        setName(name);
        setType(StepDefinitionType.MAPPING);

        Map<String, Object> options = getOptions();
        setIdentifier("cts.uris(null, null, cts.collectionQuery('default-ingestion'))");
        options.put("identifier", getIdentifier());

        setModulePath("/data-hub/5/builtins/steps/mapping/default/main.sjs");
    }
}
