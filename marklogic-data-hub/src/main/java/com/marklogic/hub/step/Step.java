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
     * Serializes the mapping as a json string
     *
     * @return the serialized JSON string
     */
    String serialize();

    /**
     * Deserialize a json response and applies it to this mapping
     *
     * @param json - the JsonNode you want deserialize
     */
    void deserialize(JsonNode json);
}
