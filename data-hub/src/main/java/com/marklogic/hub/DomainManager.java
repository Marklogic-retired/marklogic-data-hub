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

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.domain.Domain;
import com.marklogic.hub.domain.DomainImpl;

public class DomainManager extends ResourceManager {
    static final public String NAME = "domain";
    private DatabaseClient client;

    public DomainManager(DatabaseClient client) {
        super();
        this.client = client;
        this.client.init(NAME, this);
    }

    /**
     * Retrieves a list of domains from the Server
     * @return a list of domains
     */
    public List<Domain> getDomains() {
        RequestParameters params = new RequestParameters();
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        NodeList children = parent.getDocumentElement().getChildNodes();

        ArrayList<Domain> domains = null;
        if (children.getLength() > 0) {
            domains = new ArrayList<Domain>();
        }

        Node node;
        for (int i = 0; i < children.getLength(); i++) {
            node = children.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                domains.add(domainFromXml((Element)children.item(i)));
            }
        }
        return domains;
    }

    /**
     * Retrieve a named domain
     * @param domainName - the name of the domain to retrieve
     * @return a domain
     */
    public Domain getDomain(String domainName) {
        RequestParameters params = new RequestParameters();
        params.add("domain-name", domainName);
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        return new DomainImpl(parent.getDocumentElement());
    }


    private Domain domainFromXml(Element doc) {
        Domain d = new DomainImpl(doc);
        return d;
    }
}
