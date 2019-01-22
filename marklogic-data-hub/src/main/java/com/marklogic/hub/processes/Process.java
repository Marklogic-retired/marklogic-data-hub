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
                if (processType.toString().equals(type)) {
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
     * Returns the name of the processes
     *
     * @return a processes name
     */
    String getProcessName();

    /**
     * Sets the name of the processes
     *
     * @param processName - a processes name
     */
    void setProcessName(String processName);

    /**
     * Returns the type of the Process
     *
     * @return - a processes type
     */
    ProcessType getProcessType();

    /**
     * Sets the type of the processes
     *
     * @param processType - a processes type
     */
    void setProcessType(ProcessType processType);

    /**
     * Serializes the mapping as a json string
     *
     * @return the serialized JSON string
     */
    String serialize();

    /**
     * Deserializes a json response and applies it to this mapping
     *
     * @param json - the JsonNode you want deserialize
     * @return this mapping
     */
    Process deserialize(JsonNode json);
}
