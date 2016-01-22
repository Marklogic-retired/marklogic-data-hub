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
package com.marklogic.hub.flow;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamWriter;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.marklogic.client.MarkLogicIOException;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.QueryCollector;
import com.marklogic.hub.template.ContentTemplate;
import com.marklogic.hub.template.HeaderTemplate;
import com.marklogic.hub.template.RdfTemplate;
import com.marklogic.hub.template.Template;

public abstract class AbstractFlow implements Flow {

    private String name;
    private String type;
    private Collector collector;
    private boolean envelopeEnabled = true;
    protected ArrayList<Template> templates = new ArrayList<Template>();

    public AbstractFlow(Document xml) {
        deserialize(xml.getDocumentElement());
    }

    public AbstractFlow(String name, String type) {
        this.name = name;
        this.type = type;
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
            case "collector":
                String colType = node.getAttributes().getNamedItem("type").getNodeValue();
                if (colType.equals("query")) {
                    Collector collector = new QueryCollector();
                    this.setCollector(collector);
                }
            break;
            case "templates":
                deserialize(node);
                break;
            case "template":
                String templateType = node.getAttributes().getNamedItem("type").getNodeValue();
                if (templateType.equals("content")) {
                    ContentTemplate t = new ContentTemplate();
                    this.templates.add(t);
                }
                else if (templateType.equals("header")) {
                    HeaderTemplate t = new HeaderTemplate();
                    this.templates.add(t);
                }
                else if (templateType.equals("rdf")) {
                    RdfTemplate t = new RdfTemplate();
                    this.templates.add(t);
                }
                else if (templateType.equals("null")) {
                    this.templates.add(null);
                }
                break;
            }
        }
    }

    @Override
    public String getName() {
        return this.name;
    }

    public String getType() {
        return this.type;
    }

    public Collector getCollector() {
        return this.collector;
    }

    public void setCollector(Collector collector) {
        this.collector = collector;
    }

    void enableEnvelope(boolean enable) {
        this.envelopeEnabled = enable;
    }

    boolean isEnvelopeEnabled() {
        return this.envelopeEnabled;
    }

    protected XMLStreamWriter makeXMLSerializer(OutputStream out) {
        XMLOutputFactory factory = XMLOutputFactory.newInstance();
        factory.setProperty(XMLOutputFactory.IS_REPAIRING_NAMESPACES, true);

        try {
            XMLStreamWriter serializer = factory.createXMLStreamWriter(out, "UTF-8");
            serializer.setDefaultNamespace("http://marklogic.com/hub-in-a-box");
            return serializer;
        } catch (Exception e) {
            throw new MarkLogicIOException(e);
        }

    }

    @Override
    public String serialize() {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            XMLStreamWriter serializer = makeXMLSerializer(out);
            serializer.writeStartDocument();
            serializer.writeStartElement("flow");

            serializer.writeStartElement("name");
            serializer.writeCharacters(this.name);
            serializer.writeEndElement();

            serializer.writeStartElement("type");
            serializer.writeCharacters(this.type);
            serializer.writeEndElement();

            serializer.writeStartElement("collector");
            serializer.writeAttribute("type", "query");
            serializer.writeEndElement();

            serializer.writeStartElement("templates");
            for (Template t : this.templates) {
                serializer.writeStartElement("template");
                serializer.writeAttribute("type", t.getType());
                serializer.writeEndElement();
            }
            serializer.writeEndElement();

            serializer.writeEndElement();
            serializer.writeEndDocument();
            serializer.flush();
            serializer.close();
            return out.toString("UTF-8");
        }
        catch(Exception e) {
            throw new MarkLogicIOException(e);
        }
    }

    @Override
    public void addTemplate(Template template) {
        templates.add(template);
    }

    @Override
    public List<Template> geTemplates() {
        return templates;
    }
}
