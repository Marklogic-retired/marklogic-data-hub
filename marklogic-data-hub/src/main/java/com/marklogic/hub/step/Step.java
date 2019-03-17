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

package com.marklogic.hub.step;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.step.impl.StepImpl;

import java.util.ArrayList;
import java.util.Arrays;

public interface Step {

    enum StepType {
        INGEST("ingest"),
        MAPPING("mapping"),
        CUSTOM("custom");

        private String type;

        StepType(String type) {
            this.type = type;
        }

        public static StepType getStepType(String type) {
            for (StepType stepType : StepType.values()) {
                if (stepType.toString().equalsIgnoreCase(type)) {
                    return stepType;
                }
            }
            return null;
        }

        public static ArrayList<StepType> getStepTypes() {
            return new ArrayList<>(Arrays.asList(StepType.values()));
        }

        public String toString() {
            return this.type;
        }
    }

    /**
     * Creates an in-memory default instance of a Step given a name and a type
     *
     * @param name - the name of the Step
     * @param type - the type of the mapping
     * @return a Step object
     */
    static Step create(String name, StepType type) {
        return new StepImpl(name, type);
    }

    /**
     * Returns the name of the step
     *
     * @return a step name
     */
    String getName();

    /**
     * Sets the name of the step
     *
     * @param name - a step name
     */
    void setName(String name);

    /**
     * Returns the language setting of the step
     *
     * @return 'zxx', the default setting
     */
    String getLanguage();

    /**
     * Return the step version
     *
     * @return - a step version
     */
    int getVersion();

    /**
     * Sets the step version number
     *
     * @param version - a step version
     */
    void setVersion(int version);

    /**
     * Returns the step options as JsonNode
     *
     * @return - options node
     */
    JsonNode getOptions();

    /**
     * Sets the step options
     *
     * @param options - a options node
     */
    void setOptions(JsonNode options);

    /**
     * Returns path to the module
     *
     * @return - a string path to the module
     */
    String getModulePath();

    /**
     * Sets the module path
     *
     * @param path - a string path to the module
     */
    void setModulePath(String path);

    /**
     * Returns the customHook
     *
     * @return - a customHook node
     */
    JsonNode getCustomHook();

    /**
     * Sets the customHook
     *
     * @param hookObj - a customHook node
     */
    void setCustomHook(JsonNode hookObj);

    /**
     * Returns the step identifier
     *
     * @return - a string identifier
     */
    String getIdentifier();

    /**
     * Sets the identifier for the step
     *
     * @param identifier - a string identifier
     */
    void setIdentifier(String identifier);

    /**
     * Returns the retry limit for the step
     *
     * @return - an integer retry limit
     */
    int getRetryLimit();

    /**
     * Sets the retry limit for the step
     *
     * @param retryLimit - an integer retry limit
     */
    void setRetryLimit(int retryLimit);

    /**
     * Returns the type of the Step
     *
     * @return - a step type
     */
    StepType getType();

    /**
     * Sets the type of the step
     *
     * @param type - a step type
     */
    void setType(StepType type);

    /**
     * Deserialize a json response and applies it to this mapping
     *
     * @param json - the JsonNode you want deserialize
     */
    void deserialize(JsonNode json);
}
