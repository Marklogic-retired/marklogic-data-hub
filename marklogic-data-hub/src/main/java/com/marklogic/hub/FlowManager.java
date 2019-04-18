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
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.step.impl.Step;

import java.util.List;
import java.util.Map;

/**
 * Manages CRUD operations for flows
 */
public interface FlowManager {

    /**
     * String value for the flow file extension
     */
    String FLOW_FILE_EXTENSION = ".flow.json";

    /**
     * Set the HubConfig
     *
     * @param hubConfig - the hubConfig to use
     */
    void setHubConfig(HubConfig hubConfig);
    /**
     * Retrieves a named flow
     *
     * @param flowName - name of the flow
     * @return a flow object
     */
    Flow getFlow(String flowName);

    /**
     * Returns a flow based on the provided name as JSON string
     *
     * @param flowName - name of the flow
     * @return string json representation of the flow object
     */
    String getFlowAsJSON(String flowName);

    /**
     * Retrieves a list of flows installed on the MarkLogic server
     *
     * @return - a list of all flows
     */
    List<Flow> getFlows();

    /**
     * Retrieves a list of names of flows installed on the MarkLogic server
     *
     * @return - a list of names of all flows
     */
    List<String> getFlowNames();

    /**
     * Creates a flow
     *
     * @param flowName - name of the flow
     */
    Flow createFlow(String flowName);

    /**
     * Creates a flow from a given JSON string
     *
     * @param json - string representation of the flow
     * @return - a Flow object
     */
    Flow createFlowFromJSON(String json);

    /**
     * Creates a flow from a given JsonNode
     *
     * @param json - JsonNode representation of the flow
     * @return - a Flow object
     */
    Flow createFlowFromJSON(JsonNode json);

    /**
     * Deletes a flow
     *
     * @param flowName - name of the flow
     */
    void deleteFlow(String flowName);

    /**
     * Saves a flow to disk
     *
     * @param flow - the flow object to be saved
     */
    void saveFlow(Flow flow);


    /**
     * Check if a flow has existed
     * @param flowName
     * @return
     */
    boolean isFlowExisted(String flowName);

    /**
     *
     * @param flow
     * @return
     */
    Map<String, Step> getSteps(Flow flow);

    /**
     *
     * @param flow
     * @param stepMap
     */
    void setSteps(Flow flow, Map<String, Step> stepMap);

    /**
     *
     * @param flow
     * @param stepNum
     * @return
     */
    Step getStep(Flow flow, String stepNum);
}
