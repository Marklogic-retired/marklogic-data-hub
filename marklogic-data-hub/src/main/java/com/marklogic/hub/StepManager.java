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
import com.marklogic.hub.step.Step;

import java.util.ArrayList;

public interface StepManager {

    /**
     * String value for the mapping file extension
     */
    String STEP_FILE_EXTENSION = ".step.json";

    /**
     * Saves a Step to disk
     *
     * @param step - the Step object to be saved
     */
    void saveStep(Step step);

    /**
     * Deletes a Step from disk
     *
     * @param step - the Step object to be deleted
     */
    void deleteStep(Step step);

    /**
     * Returns a list of all Steps currently defined
     *
     * @return - an ArrayList of all Step objects from disk
     */
    ArrayList<Step> getSteps();

    /**
     * Returns a single Step given a name and a type
     *
     * @param name - name of the Step
     * @param type - type of the Step
     * @return the Step object
     */
    Step getStep(String name, Step.StepType type);

    /**
     * Returns a list of Steps that have the given type
     *
     * @param type - type of the Step
     * @return an ArrayList of Step objects of a given type
     */
    ArrayList<Step> getStepsByType(Step.StepType type);

    /**
     * Returns a list of Step names that have the given type
     *
     * @param type - type of the Step
     * @return an ArrayList of Step names of a given type
     */
    ArrayList<String> getStepNamesByType(Step.StepType type);

    /**
     * Creates a Step from a given JsonNode
     *
     * @param json - a JsonNode
     * @return a Step object
     */
    Step createStepFromJSON(JsonNode json);
}
