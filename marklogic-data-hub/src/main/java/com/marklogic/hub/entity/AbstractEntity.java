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
package com.marklogic.hub.entity;

import java.util.ArrayList;
import java.util.List;

import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;

/**
 * Abstract Base class for entities
 */
public abstract class AbstractEntity implements Entity {

    private String name;
    private ArrayList<Flow> flows = new ArrayList<Flow>();

    public AbstractEntity(Element xml) {
        deserialize(xml);
    }

    public AbstractEntity(String name) {
        this.name = name;
    }

    private void deserialize(Node xml) {
        NodeList children = xml.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node node = children.item(i);
            if (node.getNodeType() != Node.ELEMENT_NODE) {
                continue;
            }

            String nodeName = node.getLocalName();
            switch(nodeName) {
            case "name":
                this.name = node.getTextContent();
                break;
            case "flows":
                deserialize(node);
                break;
            case "flow":
                flows.add(FlowManager.flowFromXml((Element)node));
                break;
            }
        }
    }

    /**
     * Returns the name of the Entity
     */
    @Override
    public String getName() {
        // TODO Auto-generated method stub
        return name;
    }

    /**
     * Serializes the entity to an XML string
     */
    @Override
    public String serialize() {
        // TODO Auto-generated method stub
        return null;
    }

    /**
     * Returns the entity's flows
     */
    @Override
    public List<Flow> getFlows() {
        return flows;
    }

}
