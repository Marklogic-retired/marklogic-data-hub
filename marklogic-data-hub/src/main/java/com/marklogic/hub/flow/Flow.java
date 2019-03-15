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
package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;

public interface Flow {
    /**
     * Returns the name of the flow
     *
     * @return a flow name
     */
    String getName();

    /**
     * Sets the name of the flow
     *
     * @param flowName - a flow name
     */
    void setName(String flowName);

    /**
     * Deserialize a json response and applies it to this flow
     *
     * @param json - the JsonNode you want deserialize
     * @return this mapping
     */
    Flow deserialize(JsonNode json);
}
