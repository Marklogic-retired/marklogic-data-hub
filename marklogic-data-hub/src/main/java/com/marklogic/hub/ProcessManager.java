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

package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.processes.Process;

import java.util.ArrayList;

public interface ProcessManager {

    /**
     * String value for the mapping file extension
     */
    String PROCESSES_FILE_EXTENSION = ".processes.json";

    /**
     * Saves a Process to disk
     *
     * @param process - the Process object to be saved
     */
    void saveProcess(Process process);

    /**
     * Deletes a Process from disk
     *
     * @param process - the Process object to be deleted
     */
    void deleteProcess(Process process);

    /**
     * Returns a list of all Processes currently defined
     *
     * @return - an ArrayList of all Process objects from disk
     */
    ArrayList<Process> getProcesses();

    /**
     * Returns a single Process given a name and a type
     *
     * @param name - name of the Process
     * @param type - type of the Process
     * @return the Process object
     */
    Process getProcess(String name, Process.ProcessType type);

    /**
     * Returns a list of Processes that have the given type
     *
     * @param type - type of the Process
     * @return an ArrayList of Process objects of a given type
     */
    ArrayList<Process> getProcessesByType(Process.ProcessType type);

    /**
     * Returns a list of Process names that have the given type
     *
     * @param type - type of the Process
     * @return an ArrayList of Process names of a given type
     */
    ArrayList<String> getProcessNamesByType(Process.ProcessType type);

    /**
     * Creates a Process from a given JsonNode
     *
     * @param json - a JsonNode
     * @return a Process object
     */
    Process createProcessFromJSON(JsonNode json);
}
