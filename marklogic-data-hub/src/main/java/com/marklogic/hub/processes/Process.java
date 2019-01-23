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

package com.marklogic.hub.processes;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.Arrays;

public interface Process {

    enum ProcessType {
        INGEST("ingest"),
        MAPPING("mapping"),
        CUSTOM("custom");

        private String type;

        ProcessType(String type) {
            this.type = type;
        }

        public static ProcessType getProcessType(String type) {
            for (ProcessType processType : ProcessType.values()) {
                if (processType.toString().equalsIgnoreCase(type)) {
                    return processType;
                }
            }
            return null;
        }

        public static ArrayList<ProcessType> getProcessTypes() {
            return new ArrayList<>(Arrays.asList(ProcessType.values()));
        }

        public String toString() {
            return this.type;
        }
    }

    /**
     * Creates an in-memory default instance of a Process given a name and a type
     *
     * @param name - the name of the Process
     * @param type - the type of the mapping
     * @return a Process object
     */
    static Process create(String name, ProcessType type) {
        return new ProcessImpl(name, type);
    }

    /**
     * Returns the name of the processes
     *
     * @return a processes name
     */
    String getName();

    /**
     * Sets the name of the processes
     *
     * @param name - a processes name
     */
    void setName(String name);

    /**
     * Returns the type of the Process
     *
     * @return - a processes type
     */
    ProcessType getType();

    /**
     * Sets the type of the processes
     *
     * @param type - a processes type
     */
    void setType(ProcessType type);

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
