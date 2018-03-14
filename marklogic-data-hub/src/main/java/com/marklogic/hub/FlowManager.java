/*
 * Copyright 2012-2018 MarkLogic Corporation
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

import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import org.w3c.dom.Element;

import java.nio.file.Path;
import java.util.List;

public interface FlowManager {
    /**
     * Creates and returns the FlowManager object
     * @param hubConfig - the hubConfig for the FlowManager to use
     * @return a FlowManager object with a set hubConfig
     */
    static FlowManager create(HubConfig hubConfig){
        return new FlowManagerImpl(hubConfig);
    }

    /**
     * Turns an XML document into a flow
     * @param doc - the xml document representing a flow
     * @return a Flow instance
     */
    static Flow flowFromXml(Element doc) {
        return FlowImpl.fromXml(doc);
    }

    /**
     * retrieves a list of all the flows on the local files systems
     * @return a list of Flows
     */
    List<Flow> getLocalFlows();

    /**
     * retrieves a list of all the flows on the local files systems
     * @param entityName - string name of the entity for the flow
     * @return a list of Flows
     */
    List<Flow> getLocalFlowsForEntity(String entityName);

    /**
     * retrieves a list of all the flows on the local files systems
     * @param entityName - string name of the entity for the flow
     * @param flowType - the FlowType enum, eg: ingest or harmonize
     * @return a list of Flows
     */
    List<Flow> getLocalFlowsForEntity(String entityName, FlowType flowType);

    /**
     * Obtains a flow from a property file
     * @param propertiesFile - the Path to the property file
     * @return - a flow object
     */
    Flow getFlowFromProperties(Path propertiesFile);

    /**
     * Retrieves a list of flows installed on the MarkLogic server
     * @param entityName - the entity from which to fetch the flows
     * @return - a list of flows for the given entity
     */
    List<Flow> getFlows(String entityName);

    /**
     * Retrieves a named flow from a given entity
     *
     * @param entityName - the entity that the flow belongs to
     * @param flowName - the name of the flow to get
     * @return the flow
     */
    Flow getFlow(String entityName, String flowName);

    /**
     * Retrieves a named flow from a given entity
     *
     * @param entityName - the entity that the flow belongs to
     * @param flowName - the name of the flow to get
     * @param flowType - the type of flow (ingest/harmonize)
     * @return the flow
     */
    Flow getFlow(String entityName, String flowName, FlowType flowType);

    /**
     * Updates the indexes in the database based on the project
     */

    List<String> getLegacyFlows();

    /**
     * Sets the version that the legacy flow is to be updated from
     * @param fromVersion - string representation of DHF version
     * @return a list of updated flow names that were updated
     */
    List<String> updateLegacyFlows(String fromVersion);

    /**
     * Creates and returns a new FlowRunner object using the FlowManager's hubconfig
     * @return FlowRunner object with current hubconfig already set
     */
    FlowRunner newFlowRunner();
}
