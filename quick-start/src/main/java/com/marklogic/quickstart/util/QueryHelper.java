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
package com.marklogic.quickstart.util;

import com.marklogic.client.MarkLogicIOException;
import com.marklogic.client.query.StructuredQueryBuilder;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.XMLConstants;
import javax.xml.namespace.NamespaceContext;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.util.Iterator;

public class QueryHelper {

    private static final String SEARCH_API_NS = "http://marklogic.com/appservices/search";

    private static XMLStreamWriter makeSerializer(OutputStream out) {
        XMLOutputFactory factory = XMLOutputFactory.newInstance();
        factory.setProperty(XMLOutputFactory.IS_REPAIRING_NAMESPACES, true);

        try {
            XMLStreamWriter serializer = factory.createXMLStreamWriter(out, "UTF-8");

            serializer.setDefaultNamespace(SEARCH_API_NS);
            serializer.setPrefix("xs",  XMLConstants.W3C_XML_SCHEMA_NS_URI);

            return serializer;
        } catch (Exception e) {
            throw new MarkLogicIOException(e);
        }
    }


    public static String serializeQuery(StructuredQueryBuilder sb, StructuredQueryBuilder.AndQuery query, String sortOrder) {
        return serializeQuery(sb, query, sortOrder, null);
    }

    public static String serializeQuery(StructuredQueryBuilder sb, StructuredQueryBuilder.AndQuery query, String sortOrder, Element options) {
        String result;
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            XMLStreamWriter serializer = makeSerializer(baos);

            serializer.writeStartElement(SEARCH_API_NS, "search");

            if (options != null) {
                serializeNode(options, serializer);
            }

            serializer.writeStartElement(SEARCH_API_NS, "query");


            for (String prefix : sb.getNamespaces().getAllPrefixes()) {
                serializer.writeNamespace(prefix, sb.getNamespaces().getNamespaceURI(prefix));
            }

            query.innerSerialize(serializer);

            serializer.writeStartElement("operator-state");
            serializer.writeStartElement("operator-name");
            serializer.writeCharacters("sort");
            serializer.writeEndElement();

            serializer.writeStartElement("state-name");
            serializer.writeCharacters(sortOrder);
            serializer.writeEndElement();

            serializer.writeEndElement();

            serializer.writeEndElement();
            serializer.writeEndElement();
            result = baos.toString("UTF-8");
        } catch (Exception e) {
            throw new MarkLogicIOException(e);
        }
        return result;
    }

    private static void serializeNode(Element node, XMLStreamWriter writer) throws XMLStreamException {
        writeTagWithAttributes(node, writer);

        if (node.hasChildNodes()) {
            NodeList children = node.getChildNodes();
            for (int i = 0; i < children.getLength(); i++) {
                Node child = children.item(i);
                switch (child.getNodeType()) {
                    case Node.PROCESSING_INSTRUCTION_NODE:
                        writer.writeProcessingInstruction(child.getNodeValue());
                    case Node.DOCUMENT_TYPE_NODE:
                        break;
                    case Node.CDATA_SECTION_NODE:
                        writer.writeCData(child.getNodeValue());
                        break;
                    case Node.COMMENT_NODE:
                        writer.writeComment(child.getNodeValue());
                        break;
                    case Node.TEXT_NODE:
                        writer.writeCharacters(child.getNodeValue());
                        break;
                    case Node.ELEMENT_NODE:
                        serializeNode((Element) child, writer);
                        break;
                }
            }
        }
        writer.writeEndElement();
    }

    private static void writeTagWithAttributes(Element node, XMLStreamWriter writer) throws XMLStreamException {
        String nodePrefix = fixNull(node.getPrefix());
        String nodeNS = fixNull(node.getNamespaceURI());

        // See if nodePrefix:nodeNS is declared in writer's NamespaceContext before writing start element
        // Writing start element puts nodeNS in NamespaceContext even though namespace declaration not written
        boolean prefixDecl = isPrefixDeclared(writer, nodeNS, nodePrefix);
        writer.writeStartElement(nodePrefix, node.getLocalName(), nodeNS);

        if (node.hasAttributes()) {
            NamedNodeMap attrs = node.getAttributes();
            int numOfAttributes = attrs.getLength();
            // write namespace declarations first.
            // if we interleave this with attribue writing,
            // Zephyr will try to fix it and we end up getting inconsistent namespace bindings.
            for (int i = 0; i < numOfAttributes; i++) {
                Node attr = attrs.item(i);
                String nsUri = fixNull(attr.getNamespaceURI());
                if (nsUri.equals(XMLConstants.XMLNS_ATTRIBUTE_NS_URI)) {
                    // handle default ns declarations
                    String local = attr.getLocalName().equals(XMLConstants.XMLNS_ATTRIBUTE) ? "" : attr.getLocalName();
                    if (local.equals(nodePrefix) && attr.getNodeValue().equals(nodeNS)) {
                        prefixDecl = true;
                    }
                    if (local.equals("")) {
                        writer.writeDefaultNamespace(attr.getNodeValue());
                    } else {
                        // this is a namespace declaration, not an attribute
                        writer.setPrefix(attr.getLocalName(), attr.getNodeValue());
                        writer.writeNamespace(attr.getLocalName(), attr.getNodeValue());
                    }
                }
            }
        }
        // node's namespace is not declared as attribute, but declared on ancestor
        if (!prefixDecl) {
            writer.writeNamespace(nodePrefix, nodeNS);
        }

        // Write all other attributes which are not namespace decl.
        if (node.hasAttributes()) {
            NamedNodeMap attrs = node.getAttributes();
            int numOfAttributes = attrs.getLength();

            for (int i = 0; i < numOfAttributes; i++) {
                Node attr = attrs.item(i);
                String attrPrefix = fixNull(attr.getPrefix());
                String attrNS = fixNull(attr.getNamespaceURI());
                if (!attrNS.equals(XMLConstants.XMLNS_ATTRIBUTE_NS_URI)) {
                    String localName = attr.getLocalName();
                    if (localName == null) {
                        localName = attr.getNodeName();
                    }
                    boolean attrPrefixDecl = isPrefixDeclared(writer, attrNS, attrPrefix);
                    if (!attrPrefix.equals("") && !attrPrefixDecl) {
                        // attr has namespace but namespace decl is there in ancestor node
                        // So write the namespace decl before writing the attr
                        writer.setPrefix(attr.getLocalName(), attr.getNodeValue());
                        writer.writeNamespace(attrPrefix, attrNS);
                    }
                    writer.writeAttribute(attrPrefix, attrNS, localName, attr.getNodeValue());
                }
            }
        }
    }

    private static String fixNull(String s) {
        if (s == null) return "";
        else return s;
    }

    private static boolean isPrefixDeclared(XMLStreamWriter writer, String nsUri, String prefix) {
        boolean prefixDecl = false;
        NamespaceContext nscontext = writer.getNamespaceContext();
        Iterator prefixItr = nscontext.getPrefixes(nsUri);
        while (prefixItr.hasNext()) {
            if (prefix.equals(prefixItr.next())) {
                prefixDecl = true;
                break;
            }
        }
        return prefixDecl;
    }
}
