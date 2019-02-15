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
     * Creates an in-memory default instance of a flow
     *
     * @param name - the name of the Flow
     * @return a Flow object
     */
    static Flow create(String name) {
        return new FlowImpl(name);
    }

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
     * Returns the description of the flow
     *
     * @return a flow description
     */
    String getDescription();

    /**
     * Sets the description of the flow
     *
     * @param description - a flow description
     */
    void setDescription(String description);

    /**
     * Returns the identifier of the flow
     *
     * @return a flow identifier
     */
    String getIdentifier();

    /**
     * Sets the identifier of the flow
     *
     * @param identifier - a flow identifier
     */
    void setIdentifier(String identifier);

    /**
     * Returns the language of the flow
     *
     * @return a flow language
     */
    String getLanguage();

    /**
     * Sets the language of the flow
     *
     * @param language - a flow language
     */
    void setLanguage(String language);

    /**
     * Returns the version number of the flow
     *
     * @return a flow version number
     */
    int getVersion();

    /**
     * Sets the version number of the flow
     *
     * @param versionNumber - a flow version number
     */
    void setVersion(int versionNumber);

    /**
     * Returns the options of the flow
     *
     * @return flow options
     */
    JsonNode getOptions();

    /**
     * Sets the options of the flow
     *
     * @param optionsNode - flow options
     */
    void setOptions(JsonNode optionsNode);

    /**
     * Returns the steps of the flow
     *
     * @return flow steps
     */
    JsonNode getSteps();

    /**
     * Sets the steps of the flow
     *
     * @param steps - flow steps
     */
    void setSteps(JsonNode steps);

    /**
     * Serializes the flow as a json string
     *
     * @return the serialized JSON string
     */
    String serialize();

    /**
     * Deserialize a json response and applies it to this flow
     *
     * @param json - the JsonNode you want deserialize
     * @return this mapping
     */
    Flow deserialize(JsonNode json);
}
