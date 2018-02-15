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

    List<Flow> getLocalFlowsForEntity(String entityName);

    List<Flow> getLocalFlowsForEntity(String entityName, FlowType flowType);

    Flow getFlowFromProperties(Path propertiesFile);

    /**
     * Retrieves a list of flows installed on the MarkLogic server
     *
     * @param entityName
     *            - the entity from which to fetch the flows
     * @return - a list of flows for the given entity
     */
    List<Flow> getFlows(String entityName);

    /**
     * Retrieves a named flow from a given entity
     *
     * @param entityName
     *            - the entity that the flow belongs to
     * @param flowName
     *            - the name of the flow to get
     * @return the flow
     */
    Flow getFlow(String entityName, String flowName);

    Flow getFlow(String entityName, String flowName, FlowType flowType);

    List<String> getLegacyFlows();

    List<String> updateLegacyFlows(String fromVersion);

    FlowRunner newFlowRunner();
}
