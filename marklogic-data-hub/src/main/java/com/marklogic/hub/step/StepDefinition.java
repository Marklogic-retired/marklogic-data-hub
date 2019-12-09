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
import com.marklogic.hub.step.impl.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;

public interface StepDefinition {

    enum StepDefinitionType {
        INGESTION("ingestion"),
        MAPPING("mapping"),
        MASTERING("mastering"),
        MATCHING("matching"),
        MERGING("merging"),
        CUSTOM("custom");

        private String type;

        StepDefinitionType(String type) {
            this.type = type;
        }

        public static StepDefinitionType getStepDefinitionType(String type) {
            for (StepDefinitionType stepDefinitionType : StepDefinitionType.values()) {
                if (stepDefinitionType.toString().equalsIgnoreCase(type)) {
                    return stepDefinitionType;
                }
            }
            return null;
        }

        public static ArrayList<StepDefinitionType> getStepDefinitionTypes() {
            return new ArrayList<>(Arrays.asList(StepDefinitionType.values()));
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
    static StepDefinition create(String name, StepDefinitionType type) {
        StepDefinition stepDefinition = null;

        switch (type) {
            case INGESTION:
                stepDefinition = new IngestionStepDefinitionImpl(name);
                break;
            case MAPPING:
                stepDefinition = new MappingStepDefinitionImpl(name);
                break;
            case MASTERING:
                stepDefinition = new MasteringStepDefinitionImpl(name);
                break;
            case MERGING:
                stepDefinition = new MergingStepDefinitionImpl(name);
                break;
            case MATCHING:
                stepDefinition = new MatchingStepDefinitionImpl(name);
                break;
            case CUSTOM:
                stepDefinition = new CustomStepDefinitionImpl(name);
                break;
        }

        return stepDefinition;
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
    @Deprecated
    String getLanguage();

    /**
     * Returns the language setting of the step
     *
     * @return 'zxx', the default setting
     */
    String getLang();

    /**
     * Return the step version
     *
     * @return - a step version
     */
    Integer getVersion();

    /**
     * Sets the step version number
     *
     * @param version - a step version
     */
    void setVersion(Integer version);

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
     * Returns the step sourceQuery
     *
     * @return - a string sourceQuery
     */
    String getSourceQuery();

    /**
     * Sets the sourceQuery for the step
     *
     * @param sourceQuery - a string sourceQuery
     */
    void setSourceQuery(String sourceQuery);

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
    StepDefinitionType getType();

    /**
     * Sets the type of the step
     *
     * @param type - a step type
     */
    void setType(StepDefinitionType type);

    /**
     * Returns the description of the Step
     *
     * @return - a step description
     */
    String getDescription();

    /**
     * Sets the description for the step
     *
     * @param description - a string description
     */
    void setDescription(String description);

    /**
     * Returns the batch size
     *
     * @return - an integer batch size
     */
    Integer getBatchSize();

    /**
     * Sets the batch size for running this step
     *
     * @param batchSize - an integer
     */
    void setBatchSize(Integer batchSize);

    /**
     * Returns the thread count
     *
     * @return - thread count as integer
     */
    Integer getThreadCount();

    /**
     * Sets the thread count for running this step
     *
     * @param threadCount - an integer
     */
    void setThreadCount(Integer threadCount);

    /**
     * Automatically increments the version of the mapping by 1
     */
    void incrementVersion();

    /**
     * Deserialize a json response and applies it to this mapping
     *
     * @param json - the JsonNode you want deserialize
     */
    void deserialize(JsonNode json);


    /**
     *
     * @param stepName name of the step
     * @param stepDefinition step definition object to transform from
     * @param step step object to be transformed
     * @return a transformed step object
     */
    Step transformToStep(String stepName, StepDefinition stepDefinition, Step step);

    /**
     *
     * @param stepDefinition step definition to be transformed
     * @param step step object to transform from
     * @return a transformed step definition object
     */
    StepDefinition transformFromStep(StepDefinition stepDefinition, Step step);
}
