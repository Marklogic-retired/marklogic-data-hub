/*
 * Copyright 2012-2016 MarkLogic Corporation
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

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class FlowManager extends ResourceManager {
    private static final String HUB_NS = "http://marklogic.com/data-hub";
    private static final String NAME = "flow";

    private DatabaseClient stagingClient;
    private DatabaseClient finalClient;
    private DatabaseClient jobClient;
    private HubConfig hubConfig;
    private Map<String, Object> userOptions;

    public FlowManager(HubConfig hubConfig) {
        super();
        this.hubConfig = hubConfig;
        this.stagingClient = hubConfig.newStagingClient();
        this.finalClient = hubConfig.newFinalClient();
        this.jobClient = hubConfig.newJobDbClient();
        this.stagingClient.init(NAME, this);
    }

    /**
     * Retrieves a list of flows installed on the MarkLogic server
     *
     * @param entityName
     *            - the entity from which to fetch the flows
     * @return - a list of flows for the given entity
     */
    public List<Flow> getFlows(String entityName) {
        RequestParameters params = new RequestParameters();
        params.add("entity-name", entityName);
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        NodeList children = parent.getDocumentElement().getChildNodes();

        ArrayList<Flow> flows = null;
        if (children.getLength() > 0) {
            flows = new ArrayList<>();
        }

        Node node;
        for (int i = 0; i < children.getLength(); i++) {
            node = children.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                flows.add(flowFromXml((Element)children.item(i)));
            }
        }
        return flows;
    }

    /**
     * Retrieves a named flow from a given entity
     *
     * @param entityName
     *            - the entity that the flow belongs to
     * @param flowName
     *            - the name of the flow to get
     * @return the flow
     */
    public Flow getFlow(String entityName, String flowName) {
        return getFlow(entityName, flowName, null);
    }

    public Flow getFlow(String entityName, String flowName, FlowType flowType) {
        RequestParameters params = new RequestParameters();
        params.add("entity-name", entityName);
        params.add("flow-name", flowName);
        if (flowType != null) {
            params.add("flow-type", flowType.toString());
        }
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        return flowFromXml(parent.getDocumentElement());
    }

    public FlowRunner newFlowRunner() {
        return new FlowRunnerImpl(hubConfig);
    }

    /**
     * Turns an XML document into a flow
     * @param doc - the xml document representing a flow
     * @return a Flow instance
     */
    public static Flow flowFromXml(Element doc) {
        Flow f = null;

        String complexity = null;
        NodeList elements = doc.getElementsByTagNameNS(HUB_NS, "complexity");
        if (elements.getLength() == 1) {
            complexity = elements.item(0).getTextContent();
        }

        if (complexity != null && complexity.equals(FlowComplexity.SIMPLE.toString())) {
            f = new SimpleFlow(doc);
        }

        return f;
    }
}
