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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamWriter;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import com.marklogic.client.MarkLogicIOException;
import com.marklogic.client.io.Format;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;

/**
 * Abstract Base class for entities
 */
public abstract class AbstractEntity implements Entity {

    private String name;
    private Format dataFormat = Format.XML;
    private ArrayList<Flow> flows = new ArrayList<Flow>();

    public AbstractEntity(Element xml) {
        deserialize(xml);
    }

    public static AbstractEntity loadFromFile(File file) {
        AbstractEntity entity = null;
        try {
            FileInputStream is = new FileInputStream(file);
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = null;
            builder = factory.newDocumentBuilder();
            Document doc = builder.parse(is);
            is.close();
            entity = new EntityImpl(doc.getDocumentElement());
        } catch (FileNotFoundException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (ParserConfigurationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (SAXException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return entity;
    }

    public AbstractEntity(String name, Format dataFormat) {
        this.name = name;
        this.dataFormat = dataFormat;
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
            case "data-format":
                this.dataFormat = Format.getFromMimetype(node.getTextContent());
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
     * Returns the data format of the entity
     * @return
     */
    @Override
    public Format getDataFormat() {
        return this.dataFormat;
    }

    protected XMLStreamWriter makeXMLSerializer(StringWriter writer) {
        XMLOutputFactory factory = XMLOutputFactory.newInstance();
        factory.setProperty(XMLOutputFactory.IS_REPAIRING_NAMESPACES, true);
        try {
            XMLStreamWriter serializer = factory.createXMLStreamWriter(writer);
            return serializer;
        } catch (Exception e) {
            throw new MarkLogicIOException(e);
        }
    }

    /**
     * Serializes the entity to an XML string
     */
    @Override
    public String serialize() {
        try {
            StringWriter writer = new StringWriter();
            XMLStreamWriter serializer = makeXMLSerializer(writer);
            serializer.writeStartDocument();
            serializer.writeComment("This file is autogenerated. Please don't edit.");
            serializer.setDefaultNamespace("http://marklogic.com/data-hub");
            serializer.writeStartElement("entity");

            serializer.writeStartElement("data-format");
            serializer.writeCharacters(this.dataFormat.getDefaultMimetype());
            serializer.writeEndElement();


            serializer.writeEndElement();
            serializer.writeEndDocument();
            serializer.flush();
            serializer.close();

            StringWriter finalWriter = new StringWriter();

            Transformer t = TransformerFactory.newInstance().newTransformer();
            t.setOutputProperty(OutputKeys.INDENT, "yes");
            t.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
            t.transform(new StreamSource(new StringReader(writer.toString())), new StreamResult(finalWriter));

            return finalWriter.toString().replaceFirst("<!--", "\n<!--").replaceFirst("-->", "-->\n");
        }
        catch(Exception e) {
            throw new MarkLogicIOException(e);
        }
    }

    /**
     * Returns the entity's flows
     */
    @Override
    public List<Flow> getFlows() {
        return flows;
    }

}
