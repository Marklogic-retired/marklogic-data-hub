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

import java.util.List;

import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.SimpleFlow;

public class FlowManager {
    private static final String HUB_NS = "http://marklogic.com/hub-in-a-box";

    List<Flow> getFlows() {
        return null;
    }

    void installFlow(Flow flow) {

    }

    void uninstallFlow(String flowName) {

    }

    // might want to add Job tracking support
    // by returning a Job or some such.
    // Depends a lot on if we go full in with spring batch or not
    void runFlow(Flow flow, int batchSize) {

    }

    void runFlowsInParallel(Flow ... flows) {

    }

    Flow flowFromXml(Document doc) {
        Flow f = null;

        String type = null;
        NodeList elements = doc.getElementsByTagNameNS(HUB_NS, "type");
        if (elements.getLength() == 1) {
            type = elements.item(0).getTextContent();
        }

        if (type.equals("simple")) {
            f = new SimpleFlow(doc);
        }

        return f;
    }
}
