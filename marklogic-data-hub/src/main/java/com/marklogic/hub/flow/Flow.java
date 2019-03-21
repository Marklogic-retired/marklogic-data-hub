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
import com.marklogic.hub.step.Step;

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
     * Returns flow id
     *
     * @return
     */
    String getId();

    /**
     * Sets flow Id
     *
     * @param id
     */
    void setId(String id);

    /**
     * Returns flow description
     *
     * @return
     */
    String getDescription();

    /**
     * Sets flow description
     *
     * @param description
     */
    void setDescription(String description);

    /**
     * Returns flow batch size
     *
     * @return
     */
    int getBatchSize();

    /**
     * Set flow batch size
     *
     * @param batchSize
     */
    void setBatchSize(int batchSize);

    /**
     * Returns flow thread count
     *
     * @return
     */
    int getThreadCount();

    /**
     * Sets flow thread count
     *
     * @param threadCount
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
     *
     * @param stepNum
     * @return
     */
    Step getStep(String stepNum);

    /**
     *
     * @param stopOnError
     */
    void setStopOnError(boolean stopOnError);
    /**
     *
     * @return
     */
    boolean isStopOnError();

    /**
     * Deserialize a json response and applies it to this flow
     *
     * @param json - the JsonNode you want deserialize
     * @return this mapping
     */
    Flow deserialize(JsonNode json);
}
