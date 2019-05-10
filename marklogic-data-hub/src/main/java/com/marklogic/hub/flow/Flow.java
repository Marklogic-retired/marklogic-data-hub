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
import com.marklogic.hub.step.impl.Step;

import java.util.Map;

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
     * Returns flow description
     *
     * @return - a flow description
     */
    String getDescription();

    /**
     * Sets flow description
     *
     * @param description a flow description
     */
    void setDescription(String description);

    /**
     * Returns flow batch size
     *
     * @return - flow batch size
     */
    int getBatchSize();

    /**
     * Set flow batch size
     *
     * @param batchSize flow batch size
     */
    void setBatchSize(int batchSize);

    /**
     * Returns flow thread count
     *
     * @return thread count for flow
     */
    int getThreadCount();

    /**
     * Sets flow thread count
     *
     * @param threadCount thread count for flow
     */
    void setThreadCount(int threadCount);

    /**
     * Returns flow options as JsonNode
     *
     * @return - options node
     */
    JsonNode getOptions();

    /**
     * Sets flow options
     *
     * @param options - a options node
     */
    void setOptions(JsonNode options);

    /**
     * Returns a map of Steps
     *
     * @return - a map having Step number as key and Step model as value
     */
    Map<String, Step> getSteps();

    /**
     * Sets the steps to the flow model
     *
     * @param steps -  a map having Step number as key and Step model as value
     */
    void setSteps(Map<String, Step> steps);

    /**
     * Gets the step specified by string key
     * @param stepNum the string key of the step (usually 1, 2, 3 etc)
     * @return the step object that is stored in the flow
     */
    Step getStep(String stepNum);

    /**
     * Gets the overridden options that were set at java runtime
     * @return returns a map object containing the json object submitted at runtime for commands
     */
    Map<String, Object> getOverrideOptions();

    /**
     * Sets the overridden options for the flow to use at java runtime
     * @param overrideOptions a map object that represents the json flow options that are to be used at runtime
     */
    void setOverrideOptions(Map<String, Object> overrideOptions);

    /**
     * Gets the overridden options that were set at java runtime
     * @return returns a map object containing the json object submitted at runtime for commands to flow runner
     */
    Map<String, Object> getOverrideStepConfig();

    /**
     * Sets the overridden step configs to use at java runtime
     * @param overrideStepConfig a map object that represents the json step runner config that are to be used at runtime
     */
    void setOverrideStepConfig(Map<String, Object> overrideStepConfig);
    
    /**
     * If set stops the flow on error
     * @param stopOnError boolean flag to stop on error
     */
    void setStopOnError(boolean stopOnError);

    /**
     * Returns the value for stop on error flag
     * @return boolean flag to stop on error
     */
    boolean isStopOnError();

    /**
     * Gets version
     * @return an integer representing the version
     */
    int getVersion();

    /**
     * Sets version
     * @param version version for the flow
     */
    void setVersion(int version);

    /**
     * Deserialize a json response and applies it to this flow
     *
     * @param json - the JsonNode you want deserialize
     * @return this mapping
     */
    Flow deserialize(JsonNode json);

    /**
     * Get step Info by step id
     *
     * @param stepId id for the step
     * @return a step
     */
    Step getStepById(String stepId);
}
