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

package com.marklogic.hub.legacy;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.flow.LegacyFlow;
import com.marklogic.hub.legacy.flow.LegacyFlowRunner;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.legacy.flow.impl.LegacyFlowImpl;
import org.w3c.dom.Element;

import java.nio.file.Path;
import java.util.List;

/**
 * Manages existing flows and creates flow runners to execute flows.
 */
public interface LegacyFlowManager {

    /**
     * Set HubConfig
     * @param hubConfig a hubConfig object
     */
    void setHubConfig(HubConfig hubConfig);

    /**
     * Turns an XML document into a flow
     * @param doc - the xml document representing a flow
     * @return a LegacyFlow instance
     */
    static LegacyFlow flowFromXml(Element doc) {
        return LegacyFlowImpl.fromXml(doc);
    }

    /**
     * retrieves a list of all the flows on the local files systems
     * @return a list of Flows
     */
    List<LegacyFlow> getLocalFlows();

    /**
     * retrieves a list of all the flows on the local files systems
     * @param entityName - string name of the entity for the flow
     * @return a list of Flows
     */
    List<LegacyFlow> getLocalFlowsForEntity(String entityName);

    /**
     * retrieves a list of all the flows on the local files systems
     * @param entityName - string name of the entity for the flow
     * @param flowType - the FlowType enum, eg: ingest or harmonize
     * @return a list of Flows
     */
    List<LegacyFlow> getLocalFlowsForEntity(String entityName, FlowType flowType);

    /**
     * Obtains a flow from a property file
     * @param propertiesFile - the Path to the property file
     * @return - a flow object
     */
    LegacyFlow getFlowFromProperties(Path propertiesFile);

    /**
     * Retrieves a list of flows installed on the MarkLogic server
     * @param entityName - the entity from which to fetch the flows
     * @return - a list of flows for the given entity
     */
    List<LegacyFlow> getFlows(String entityName);

    /**
     * Retrieves a named flow from a given entity
     *
     * @param entityName - the entity that the flow belongs to
     * @param flowName - the name of the flow to get
     * @return the flow
     */
    LegacyFlow getFlow(String entityName, String flowName);

    /**
     * Retrieves a named flow from a given entity
     *
     * @param entityName - the entity that the flow belongs to
     * @param flowName - the name of the flow to get
     * @param flowType - the type of flow (ingest/harmonize)
     * @return the flow
     */
    LegacyFlow getFlow(String entityName, String flowName, FlowType flowType);

    /**
     * Creates and returns a new LegacyFlowRunner object using the FlowManager's hubconfig
     * @return LegacyFlowRunner object with current hubconfig already set
     */
    LegacyFlowRunner newFlowRunner();
}
