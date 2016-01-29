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

import java.util.ArrayList;
import java.util.List;

import javax.xml.stream.XMLStreamException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.Transaction;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.ServerCollector;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.SimpleFlow;
import com.marklogic.hub.plugin.Plugin;
import com.marklogic.hub.plugin.ServerPlugin;
import com.marklogic.hub.writer.ServerWriter;
import com.marklogic.hub.writer.Writer;

public class FlowManager extends ResourceManager {
    private static final String HUB_NS = "http://marklogic.com/hub-in-a-box";
    static final public String NAME = "flow";
    private DatabaseClient client;

    public FlowManager(DatabaseClient client) {
        super();
        this.client = client;
        this.client.init(NAME, this);
    }

    List<Flow> getFlows() {
        RequestParameters params = new RequestParameters();
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
            flows = new ArrayList<Flow>();
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

    Flow getFlow(String flowName) {
        RequestParameters params = new RequestParameters();
        params.add("flow-name", flowName);
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        return flowFromXml(parent.getDocumentElement());
    }

    void installFlow(Flow flow) {

    }

    void uninstallFlow(String flowName) {

    }

    // might want to add Job tracking support
    // by returning a Job or some such.
    // Depends a lot on if we go full in with spring batch or not
    void runFlow(Flow flow, int batchSize) throws XMLStreamException {
        Collector c = flow.getCollector();
        if (c instanceof ServerCollector) {
            ((ServerCollector)c).setClient(client);
        }

        boolean allServer = true;
        for (Plugin t : flow.getPlugins()) {
            if (t instanceof ServerPlugin) {
                ((ServerPlugin)t).setClient(client);
            }
            else if (t != null) {
                allServer = false;
            }
        }

        Writer w = flow.getWriter();
        if (w instanceof ServerWriter) {
            ((ServerWriter)w).setClient(client);
        }

        FlowRunner runner = new FlowRunner(client);
        List<String> ids = c.run();

        Transaction transaction = client.openTransaction();
        try {
            for (String id : ids) {

                // all of the Plugins need to be run in MarkLogic
                if (allServer) {
                    runner.run(flow, id, transaction);
                }

                // this path is for when java is in the mix
                // TODO: make this work
                else {
//                    for (Plugin t : flow.getPlugins()) {
//                        if (t != null) {
//                            t.run(id);
//                        }
//                    }
                    w.write(id);
                }

            }
            transaction.commit();
        }
        catch(Exception e) {
            transaction.rollback();
        }
    }

    void runFlowsInParallel(Flow ... flows) {

    }

    Flow flowFromXml(Element doc) {
        Flow f = null;

        String type = null;
        NodeList elements = doc.getElementsByTagNameNS(HUB_NS, "type");
        if (elements.getLength() == 1) {
            type = elements.item(0).getTextContent();
        }

        if (type.equals("simple")) {
            SimpleFlow sf = new SimpleFlow(doc);
            f = sf;
        }

        return f;
    }

    class FlowRunner extends ResourceManager {
        static final public String NAME = "flow";

        public FlowRunner(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        public void run(Flow flow, String identifier, Transaction transaction) throws XMLStreamException {
            RequestParameters params = new RequestParameters();
            params.add("identifier", identifier);

            StringHandle handle = new StringHandle(flow.serialize());
            handle.setFormat(Format.XML);
            this.getServices().post(params, handle, transaction);
        }
    }
}
