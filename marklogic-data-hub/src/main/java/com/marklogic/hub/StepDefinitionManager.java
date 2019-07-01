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
import com.marklogic.hub.step.StepDefinition;

import java.util.ArrayList;

public interface StepDefinitionManager {

    /**
     * String value for the mapping file extension
     */
    String STEP_DEFINITION_FILE_EXTENSION = ".step.json";

    /**
     * Saves a Step Definition to disk
     *
     * @param stepDefinition - the Step Definition object to be saved
     */
    void saveStepDefinition(StepDefinition stepDefinition);

    /**
     * Saves a Step Definition to disk
     *
     * @param stepDefinition - the Step Definition object to be saved
     * @param autoIncrement  - true to increment version, false if not to
     */
    void saveStepDefinition(StepDefinition stepDefinition, boolean autoIncrement);

    /**
     * Deletes a Step Definition from disk
     *
     * @param stepDefinition - the Step Definition object to be deleted
     */
    void deleteStepDefinition(StepDefinition stepDefinition);

    /**
     * Returns a list of all Step Definition currently defined
     *
     * @return - an ArrayList of all Step Definition objects from disk
     */
    ArrayList<StepDefinition> getStepDefinitions();

    /**
     * Returns a single Step Definition given a name and a type
     *
     * @param name - name of the Step Definition
     * @param type - type of the Step Definition
     * @return the Step Definition object
     */
    StepDefinition getStepDefinition(String name, StepDefinition.StepDefinitionType type);

    /**
     * Returns a list of Step Definitions that have the given type
     *
     * @param type - type of the Step Definition
     * @return an ArrayList of Step Definition objects of a given type
     */
    ArrayList<StepDefinition> getStepDefinitionsByType(StepDefinition.StepDefinitionType type);

    /**
     * Returns a list of Step Definition names that have the given type
     *
     * @param type - type of the Step Definition
     * @return an ArrayList of Step Definition names of a given type
     */
    ArrayList<String> getStepDefinitionNamesByType(StepDefinition.StepDefinitionType type);

    /**
     * Creates a Step Definition from a given JsonNode
     *
     * @param json - a JsonNode
     * @return a Step Definition object
     */
    StepDefinition createStepDefinitionFromJSON(JsonNode json);
}
