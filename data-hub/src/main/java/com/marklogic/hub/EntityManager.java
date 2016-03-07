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
import com.marklogic.hub.entity.Entity;
import com.marklogic.hub.entity.EntityImpl;

public class EntityManager extends ResourceManager {
    static final public String NAME = "entity";
    private DatabaseClient client;

    public EntityManager(DatabaseClient client) {
        super();
        this.client = client;
        this.client.init(NAME, this);
    }

    /**
     * Retrieves a list of entities from the Server
     * 
     * @return a list of entities
     */
    public List<Entity> getEntities() {
        RequestParameters params = new RequestParameters();
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        NodeList children = parent.getDocumentElement().getChildNodes();

        ArrayList<Entity> entities = null;
        if (children.getLength() > 0) {
            entities = new ArrayList<Entity>();
        }

        Node node;
        for (int i = 0; i < children.getLength(); i++) {
            node = children.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                entities.add(entityFromXml((Element) children.item(i)));
            }
        }
        return entities;
    }

    /**
     * Retrieve a named entity
     * 
     * @param entityName
     *            - the name of the entity to retrieve
     * @return a entity
     */
    public Entity getEntity(String entityName) {
        RequestParameters params = new RequestParameters();
        params.add("entity-name", entityName);
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        return new EntityImpl(parent.getDocumentElement());
    }


    private Entity entityFromXml(Element doc) {
        Entity d = new EntityImpl(doc);
        return d;
    }
}
