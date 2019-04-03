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
     * Gets the step specified by string key
     * @param stepNum the string key of the step (usually 1, 2, 3 etc)
     * @return the step object that is stored in the flow
     */
    Step getStep(String stepNum);

    /**
     * Gets the overridden batch size for the flow
     * @return an integer representing the batch size
     */
    Integer getOverrideBatchSize();

    /**
     *  Sets the overridden batch size set for the flow
     * @param overrideBatchSize an integer representing the batch size
     */
    void setOverrideBatchSize(Integer overrideBatchSize);

    /**
     * Gets the overridden thread count set for running the flow
     * @return an integer representing the number of threads to use
     */
    Integer getOverrideThreadCount();

    /**
     * Sets the thread count temporarily for running a flow
     * @param overrideThreadCount an integer representing the number of threads desired to use for running the flow
     */
    void setOverrideThreadCount(Integer overrideThreadCount);

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
     * Gets the string name of the source db that's overridden
     * @return the string name of the overridden source db
     */
    String getOverrideSourceDB();

    /**
     * Sets the string name of the source db that's overridden
     * @param overrideSourceDB the string name of the overridden source DB
     */
    void setOverrideSourceDB(String overrideSourceDB);

    /**
     * Gets the string name of the destination db that's overridden
     * @return the string name of the overridden destination db
     */
    String getOverrideDestDB();

    /**
     * Sets the string name of the destination db that's overridden
     * @param overrideDestDB the string name of the overridden destination db
     */
    void setOverrideDestDB(String overrideDestDB);

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
     * Gets version
     * @return
     */
    int getVersion();

    /**
     * Sets version
     * @param version
     */
    void setVersion(int version);

    /**
     * Deserialize a json response and applies it to this flow
     *
     * @param json - the JsonNode you want deserialize
     * @return this mapping
     */
    Flow deserialize(JsonNode json);
}
