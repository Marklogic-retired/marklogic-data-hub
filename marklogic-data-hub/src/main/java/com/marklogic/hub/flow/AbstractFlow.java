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

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.QueryCollector;
import com.marklogic.hub.collector.ServerCollector;
import com.marklogic.hub.plugin.ContentPlugin;
import com.marklogic.hub.plugin.HeadersPlugin;
import com.marklogic.hub.plugin.Plugin;
import com.marklogic.hub.plugin.PluginType;
import com.marklogic.hub.plugin.ServerPlugin;
import com.marklogic.hub.plugin.TriplesPlugin;
import com.marklogic.hub.writer.DefaultWriter;
import com.marklogic.hub.writer.ServerWriter;
import com.marklogic.hub.writer.Writer;

/**
 * An abstract base class representing a Flow. A flow is a sequence of plugins that transform
 * a document.
 */
public abstract class AbstractFlow implements Flow {

    private String entityName;
    private String flowName;
    private FlowType type;
    private Format dataFormat = Format.XML;
    private FlowComplexity flowComplexity;
    private Collector collector;
    private boolean envelopeEnabled = true;
    protected ArrayList<Plugin> plugins = new ArrayList<>();
    private Writer writer;

    public AbstractFlow() {}

    public AbstractFlow(Element xml) {
        deserialize(xml);
    }

    public AbstractFlow(String entityName, String flowName, FlowType type,
            Format dataFormat, FlowComplexity flowComplexity) {
        this.entityName = entityName;
        this.flowName = flowName;
        this.type = type;
        this.dataFormat = dataFormat;
        this.flowComplexity = flowComplexity;
    }

    public static AbstractFlow loadFromFile(File file) {
        AbstractFlow entity = null;
        FileInputStream is = null;
        try {
            is = new FileInputStream(file);
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(is);
            entity = new SimpleFlow(doc.getDocumentElement());
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        finally {
            if (is != null) {
                try {
                    is.close();
                }
                catch(IOException e) {}
            }

        }
        return entity;
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
                this.flowName = node.getTextContent();
                break;
            case "type":
                this.type = FlowType.getFlowType(node.getTextContent());
                break;
            case "complexity":
                this.flowComplexity = FlowComplexity.getFlowComplexity(node.getTextContent());
                break;
            case "data-format":
                this.dataFormat = Format.getFromMimetype(node.getTextContent());
                break;
            case "entity":
                this.entityName = node.getTextContent();
                break;
            case "collector":
                PluginType colType = PluginType.getPluginType(node.getAttributes().getNamedItem("type").getNodeValue());
                if (colType.equals(PluginType.XQUERY) || colType.equals(PluginType.JAVASCRIPT) || colType.equals(PluginType.XSLT)) {
                    String module = node.getAttributes().getNamedItem("module").getNodeValue();
                    Collector collector = null;
                    if (module.equals(QueryCollector.MODULE)) {
                        collector = new QueryCollector();
                    }
                    else {
                        collector = new ServerCollector(colType, module);
                    }
                    this.setCollector(collector);
                }
            break;
            case "plugins":
                deserialize(node);
                break;
            case "plugin":
                String pluginDest = null;
                String module = null;
                PluginType pluginType = PluginType.getPluginType(node.getAttributes().getNamedItem("type").getNodeValue());
                if (!pluginType.equals(PluginType.NULL)) {
                    pluginDest = node.getAttributes().getNamedItem("dest").getNodeValue();
                    module = node.getAttributes().getNamedItem("module").getNodeValue();
                }

                if (pluginType.equals(PluginType.XQUERY) || pluginType.equals(PluginType.JAVASCRIPT) || pluginType.equals(PluginType.XSLT)) {
                    if (pluginDest.equals(ContentPlugin.MODULE)) {
                        ContentPlugin t = new ContentPlugin();
                        this.plugins.add(t);
                    }
                    else if (pluginDest.equals(HeadersPlugin.MODULE)) {
                        HeadersPlugin t = new HeadersPlugin();
                        this.plugins.add(t);
                    }
                    else if (pluginDest.equals(TriplesPlugin.MODULE)) {
                        TriplesPlugin t = new TriplesPlugin();
                        this.plugins.add(t);
                    }
                    else {
                        ServerPlugin t = new ServerPlugin(pluginType, module, pluginDest);
                        this.plugins.add(t);
                    }
                }
                else if (pluginType.equals(PluginType.NULL)) {
                    this.plugins.add(null);
                }
                break;
            case "writer":
                module = null;
                pluginType = PluginType.getPluginType(node.getAttributes().getNamedItem("type").getNodeValue());
                if (pluginType.equals(PluginType.XQUERY) || pluginType.equals(PluginType.JAVASCRIPT) || pluginType.equals(PluginType.XSLT)) {
                    module = node.getAttributes().getNamedItem("module").getNodeValue();
                    Writer w = null;
                    if (module.equals(DefaultWriter.MODULE)) {
                        w = new DefaultWriter();
                    }
                    else {
                        w = new ServerWriter(pluginType, module);
                    }
                    this.setWriter(w);
                }

                break;
            }
        }
    }

    /**
     * Retrieves the name of the entity that this flow belongs to
     */
    @Override
    public String getEntityName() {
        return this.entityName;
    }

    /**
     * Retrieves the flow name
     */
    @Override
    public String getName() {
        return this.flowName;
    }

    /**
     * Retrieves the type of flow
     */
    @Override
    public FlowType getType() {
        return this.type;
    }

    @Override
    public Format getDataFormat() {
        return this.dataFormat;
    }

    public void setDataFormat(Format format) {
        this.dataFormat = format;
    }

    /**
     * Retrieves the flow's collector
     */
    public Collector getCollector() {
        return this.collector;
    }

    /**
     * sets the flow's collector
     */
    public void setCollector(Collector collector) {
        this.collector = collector;
    }

    /**
     * Retrieves the flow's writer
     */
    public Writer getWriter() {
        return this.writer;
    }

    /**
     * sets the flow's writer
     */
    public void setWriter(Writer writer) {
        this.writer = writer;
    }

    /**
     * Whether or not to wrap the document in an envelope
     */
    void enableEnvelope(boolean enable) {
        this.envelopeEnabled = enable;
    }

    /**
     * Whether or not the document is wrapped in an envelope
     */
    boolean isEnvelopeEnabled() {
        return this.envelopeEnabled;
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
     * Serializes the flow into an xml string
     */
    @Override
    public String serialize(boolean full) {
        try {
            StringWriter writer = new StringWriter();
            XMLStreamWriter serializer = makeXMLSerializer(writer);
            serializer.writeStartDocument();
            serializer.writeComment("This file is autogenerated. Please don't edit.");
            serializer.setDefaultNamespace("http://marklogic.com/data-hub");
            serializer.writeStartElement("flow");

            if (full) {
                serializer.writeStartElement("name");
                serializer.writeCharacters(this.flowName);
                serializer.writeEndElement();

                serializer.writeStartElement("entity");
                serializer.writeCharacters(this.entityName);
                serializer.writeEndElement();

                serializer.writeStartElement("type");
                serializer.writeCharacters(this.type.toString());
                serializer.writeEndElement();
            }

            serializer.writeStartElement("complexity");
            serializer.writeCharacters(this.flowComplexity.toString());
            serializer.writeEndElement();

            serializer.writeStartElement("data-format");
            serializer.writeCharacters(this.dataFormat.getDefaultMimetype());
            serializer.writeEndElement();

            if (this.collector != null) {
                this.collector.serialize(serializer);
            }

            serializer.writeStartElement("plugins");
            for (Plugin t : this.plugins) {
                if (t != null) {
                    t.serialize(serializer);
                }
            }
            serializer.writeEndElement();

            Writer w = this.getWriter();
            if (w != null) {
                this.getWriter().serialize(serializer);
            }

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
     * Adds a plugin to the flow
     */
    @Override
    public void addPlugin(Plugin plugin) {
        plugins.add(plugin);
    }

    /**
     * Gets the plugins in the flow
     */
    @Override
    public List<Plugin> getPlugins() {
        return plugins;
    }
}
