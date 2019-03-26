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
import java.util.HashMap;
import java.util.Map;

public interface Step {

    enum StepType {
        INGEST("ingest"),
        MAPPING("mapping"),
        MASTERING("mastering"),
        CUSTOM("custom");

        //map client-side type to server-side type
        public final static Map<String, Step.StepType> STEP_TYPE_MAPPING = new HashMap<>();
        static  {
            STEP_TYPE_MAPPING.put("ingestion", Step.StepType.INGEST);
            STEP_TYPE_MAPPING.put("mapping", Step.StepType.MAPPING);
            STEP_TYPE_MAPPING.put("mastering", Step.StepType.MASTERING);
            STEP_TYPE_MAPPING.put("custom", Step.StepType.CUSTOM);
        }

        private String type;

        StepType(String type) {
            this.type = type;
        }

        public static StepType getStepType(String type) {
            if (STEP_TYPE_MAPPING.containsKey(type)) {
                return STEP_TYPE_MAPPING.get(type);
            }
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
     * Returns the step options as a map
     *
     * @return - options map
     */
    Map<String, Object> getOptions();

    /**
     * Sets the step options
     *
     * @param options - a options map
     */
    void setOptions(Map<String, Object> options);

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
     * Returns the batch size
     *
     * @return - an integer batch size
     */
    int getBatchSize();

    /**
     * Sets the batch size for running this step
     *
     * @param batchSize - an integer
     */
    void setBatchSize(int batchSize);

    /**
     * Returns the thread count
     *
     * @return - thread count as integer
     */
    int getThreadCount();

    /**
     * Sets the thread count for running this step
     *
     * @param threadCount - an integer
     */
    void setThreadCount(int threadCount);

    /**
     * Returns the name of the source DB
     *
     * @return - source DB name as String
     */
    String getSourceDB();

    /**
     * Sets the name of the source DB
     *
     * @param sourceDB - a String
     */
    void setSourceDB(String sourceDB);

    /**
     * Returns the name of the destination DB
     *
     * @return - destination DB name as String
     */
    String getDestDB();

    /**
     * Sets the name of the destination DB
     *
     * @param destDB - a String
     */
    void setDestDB(String destDB);

    /**
     * Deserialize a json response and applies it to this mapping
     *
     * @param json - the JsonNode you want deserialize
     */
    void deserialize(JsonNode json);
}
